"use client";

import {
    useMemo,
    useState,
} from "react";

import CalendarBoard from "../components/calendar/CalendarBoard";
import CalendarTaskForm from "../components/calendar/CalendarTaskForm";
import CalendarTaskListModal from "../components/calendar/CalendarTaskListModal";
import AppShell from "../components/layout/AppShell";
import { useLanguage } from "../components/providers/LanguageProvider";
import useStoredState from "../hooks/useStoredState";
import {
    getAdjacentMonthDate,
    getLocalIsoDate,
    monthDates,
    weekdayIndex,
    weekdayNameIndex,
} from "../lib/date";
import {
    STORAGE_KEYS,
} from "../lib/storage";
import { seed } from "./data";

/* Displays the calendar and coordinates its dialogs. */
export default function CalendarPage() {
    const {
        settings,
        t,
    } = useLanguage();

    const [
        data,
        setData,
    ] = useStoredState(
        STORAGE_KEYS.planner,
        seed,
    );

    const [
        anchor,
        setAnchor,
    ] = useState(
        getLocalIsoDate,
    );

    const [
        selected,
        setSelected,
    ] = useState(null);

    const [
        modal,
        setModal,
    ] = useState(null);

    const days = useMemo(() => {
        return monthDates(
            anchor,
            settings.calendar,
        );
    }, [
        anchor,
        settings.calendar,
    ]);

    const tasksByDate =
        useMemo(() => {
            return data.tasks.reduce(
                (
                    groupedTasks,
                    task,
                ) => {
                    groupedTasks[
                        task.date
                    ] ??= [];

                    groupedTasks[
                        task.date
                    ].push(task);

                    return groupedTasks;
                },
                {},
            );
        }, [data.tasks]);

    const weekStartIndex =
        weekdayNameIndex(
            settings.firstDay,
        );

    const leadingCells =
        days[0]
            ? (
                weekdayIndex(
                    days[0],
                ) -
                weekStartIndex +
                7
            ) % 7
            : 0;

    const calendarCells = [
        ...Array(
            leadingCells,
        ).fill(null),
        ...days,
    ];

    const selectedTasks =
        selected
            ? (
                tasksByDate[
                selected
                ] ?? []
            )
            : [];

    /* Opens tasks or the add form for one date. */
    function chooseDate(date) {
        setSelected(date);

        const hasTasks =
            (
                tasksByDate[date] ??
                []
            ).length > 0;

        setModal(
            hasTasks
                ? "day"
                : "add",
        );
    }

    /* Changes the visible calendar month. */
    function shiftMonth(
        direction,
    ) {
        setAnchor(
            getAdjacentMonthDate(
                anchor,
                direction,
                settings.calendar,
            ),
        );
    }

    /* Adds one task to the shared planner data. */
    function addTask(task) {
        setData(
            (currentData) => ({
                ...currentData,

                tasks: [
                    ...currentData.tasks,
                    task,
                ],
            }),
        );

        setModal(null);
    }

    return (
        <>
            <AppShell activePage="calendar">
                <main className="content">
                    <div className="hero">
                        <div>
                            <div className="kicker">
                                {t("calendar")}
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
                        cells={
                            calendarCells
                        }
                        days={days}
                        selected={selected}
                        settings={settings}
                        tasksByDate={
                            tasksByDate
                        }
                        onChooseDate={
                            chooseDate
                        }
                        onShiftMonth={
                            shiftMonth
                        }
                        onToday={() => {
                            setAnchor(
                                getLocalIsoDate(),
                            );
                        }}
                    />
                </main>
            </AppShell>

            {modal === "day" &&
                selected && (
                    <CalendarTaskListModal
                        date={selected}
                        settings={settings}
                        tasks={
                            selectedTasks
                        }
                        onAdd={() => {
                            setModal("add");
                        }}
                        onClose={() => {
                            setModal(null);
                        }}
                    />
                )}

            {modal === "add" &&
                selected && (
                    <CalendarTaskForm
                        date={selected}
                        settings={settings}
                        onSave={addTask}
                        onClose={() => {
                            setModal(null);
                        }}
                    />
                )}
        </>
    );
}