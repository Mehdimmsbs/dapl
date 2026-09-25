"use client";

import { useMemo, useState } from "react";

import CalendarBoard from "../components/calendar/CalendarBoard";
import CalendarMonthPicker from "../components/calendar/CalendarMonthPicker";
import CalendarTaskForm from "../components/calendar/CalendarTaskForm";
import CalendarTaskListModal from "../components/calendar/CalendarTaskListModal";
import AppShell from "../components/layout/AppShell";
import TaskDetailsModal from "../components/planner/TaskDetailsModal";
import { useLanguage } from "../components/providers/LanguageProvider";
import useStoredState from "../hooks/useStoredState";

import {
    formatDate,
    getAdjacentMonthDate,
    getLocalIsoDate,
    monthDates,
    weekdayIndex,
    weekdayNameIndex,
} from "../lib/date";

import { STORAGE_KEYS } from "../lib/storage";
import { seed } from "./data";

/* Displays the calendar and coordinates its dialogs. */
export default function CalendarPage() {
    const { settings, t } = useLanguage();

    const [data, setData] = useStoredState(
        STORAGE_KEYS.planner,
        seed,
    );

    const [anchor, setAnchor] = useState(
        getLocalIsoDate,
    );

    const [selected, setSelected] = useState(null);
    const [modal, setModal] = useState(null);

    const [activeTaskId, setActiveTaskId] =
        useState(null);

    const [monthPickerOpen, setMonthPickerOpen] =
        useState(false);

    const today = getLocalIsoDate();

    const days = useMemo(
        () => monthDates(anchor, settings.calendar),
        [anchor, settings.calendar],
    );

    const tasksByDate = useMemo(() => {
        return data.tasks.reduce(
            (groupedTasks, task) => {
                groupedTasks[task.date] ??= [];
                groupedTasks[task.date].push(task);
                return groupedTasks;
            },
            {},
        );
    }, [data.tasks]);

    const weekStartIndex = weekdayNameIndex(
        settings.firstDay,
    );

    const leadingCells = days[0]
        ? (
            weekdayIndex(days[0]) -
            weekStartIndex +
            7
        ) % 7
        : 0;

    const calendarCells = [
        ...Array(leadingCells).fill(null),
        ...days,
    ];

    const selectedTasks = selected
        ? tasksByDate[selected] ?? []
        : [];

    const activeTask = data.tasks.find(
        (task) =>
            String(task.id) === String(activeTaskId),
    );

    /* Opens the day list or the add form. */
    function chooseDate(date) {
        setSelected(date);
        setActiveTaskId(null);

        const hasTasks =
            (tasksByDate[date] ?? []).length > 0;

        setModal(
            date < getLocalIsoDate() || hasTasks
                ? "day"
                : "add",
        );
    }

    /* Changes the visible calendar month. */
    function shiftMonth(direction) {
        setAnchor(
            getAdjacentMonthDate(
                anchor,
                direction,
                settings.calendar,
            ),
        );
    }

    /* Creates a new task or updates the selected task. */
    function saveCalendarTask(task) {
        if (task.date < getLocalIsoDate()) {
            return;
        }

        setData((currentData) => ({
            ...currentData,
            tasks:
                activeTaskId === null
                    ? [
                        ...currentData.tasks,
                        task,
                    ]
                    : currentData.tasks.map(
                        (item) =>
                            String(item.id) ===
                                String(activeTaskId)
                                ? task
                                : item,
                    ),
        }));

        setActiveTaskId(null);
        setModal("day");
    }

    /* Deletes a task and removes references to it. */
    function removeCalendarTask(taskId) {
        if (
            !window.confirm(
                t("confirmDeleteTask"),
            )
        ) {
            return;
        }

        setData((currentData) => ({
            ...currentData,
            tasks: currentData.tasks
                .filter(
                    (item) =>
                        String(item.id) !==
                        String(taskId),
                )
                .map((item) => ({
                    ...item,
                    prerequisites: (
                        item.prerequisites || []
                    ).filter(
                        (id) =>
                            String(id) !==
                            String(taskId),
                    ),
                })),
        }));

        setActiveTaskId(null);
        setModal("day");
    }

    return (
        <>
            <AppShell activePage="calendar">
                <main className="content">
                    <div className="hero">
                        <div>
                            <div className="kicker">
                                {formatDate(
                                    today,
                                    settings.calendar,
                                    settings.language,
                                )}
                            </div>

                            <h1>
                                {t("calendarTitle")}
                            </h1>

                            <p>
                                {t("calendarSub")}
                            </p>
                        </div>
                    </div>

                    <CalendarBoard
                        anchor={anchor}
                        cells={calendarCells}
                        selected={selected}
                        settings={settings}
                        tasksByDate={tasksByDate}
                        onChooseDate={chooseDate}
                        onShiftMonth={shiftMonth}
                        onPickMonth={() => {
                            setMonthPickerOpen(true);
                        }}
                        onToday={() => {
                            setAnchor(
                                getLocalIsoDate(),
                            );
                            setSelected(null);
                        }}
                    />
                </main>
            </AppShell>

            {modal === "day" && selected && (
                <CalendarTaskListModal
                    date={selected}
                    settings={settings}
                    tasks={selectedTasks}
                    canAdd={selected >= today}
                    onAdd={() => {
                        if (
                            selected <
                            getLocalIsoDate()
                        ) {
                            return;
                        }

                        setActiveTaskId(null);
                        setModal("add");
                    }}
                    onOpenTask={(id) => {
                        setActiveTaskId(id);
                        setModal("details");
                    }}
                    onRemoveTask={
                        removeCalendarTask
                    }
                    onClose={() => {
                        setModal(null);
                    }}
                />
            )}

            {(modal === "add" ||
                modal === "edit") &&
                selected &&
                selected >= today &&
                (modal !== "edit" ||
                    activeTask) && (
                    <CalendarTaskForm
                        key={
                            activeTaskId ??
                            `new-${selected}`
                        }
                        date={selected}
                        settings={settings}
                        task={
                            modal === "edit"
                                ? activeTask
                                : null
                        }
                        onSave={
                            saveCalendarTask
                        }
                        onClose={() => {
                            setModal(
                                modal === "edit"
                                    ? "details"
                                    : "day",
                            );
                        }}
                    />
                )}

            {modal === "details" &&
                activeTask && (
                    <TaskDetailsModal
                        task={activeTask}
                        data={data}
                        calendar={
                            settings.calendar
                        }
                        lang={
                            settings.language
                        }
                        canEdit={
                            activeTask.date >=
                            today
                        }
                        onClose={() => {
                            setActiveTaskId(null);
                            setModal("day");
                        }}
                        onEdit={() => {
                            if (
                                activeTask.date >=
                                getLocalIsoDate()
                            ) {
                                setModal("edit");
                            }
                        }}
                        onRemove={() => {
                            removeCalendarTask(
                                activeTask.id,
                            );
                        }}
                    />
                )}

            {monthPickerOpen && (
                <CalendarMonthPicker
                    anchor={anchor}
                    settings={settings}
                    onChoose={(date) => {
                        setAnchor(date);
                        setSelected(null);
                        setMonthPickerOpen(
                            false,
                        );
                    }}
                    onClose={() => {
                        setMonthPickerOpen(
                            false,
                        );
                    }}
                />
            )}
        </>
    );
}