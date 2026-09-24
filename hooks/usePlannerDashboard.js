"use client";

import {
    useEffect,
    useMemo,
    useState,
} from "react";

import { seed } from "../app/data";
import { useLanguage } from "../components/providers/LanguageProvider";
import {
    formatDate,
    getLocalIsoDate,
} from "../lib/date";
import {
    STORAGE_KEYS,
    readStorageText,
    removeStorage,
} from "../lib/storage";
import useStoredState from "./useStoredState";

const EMPTY_ROUTINES = [];

const WEEKDAYS = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
];

/* Owns dashboard data, derived values and task actions. */
export default function usePlannerDashboard() {
    const {
        settings,
        t,
        updateSettings,
    } = useLanguage();

    const [
        data,
        setData,
    ] = useStoredState(
        STORAGE_KEYS.planner,
        seed,
    );

    const [routines] = useStoredState(
        STORAGE_KEYS.routines,
        EMPTY_ROUTINES,
    );

    const [date, setDate] =
        useState(getLocalIsoDate);

    const [modal, setModal] =
        useState(null);

    const [filter, setFilter] =
        useState("all");

    /* Restores calendar navigation and URL actions. */
    useEffect(() => {
        const selectedDate =
            readStorageText(
                STORAGE_KEYS.selectedDate,
            );

        if (selectedDate) {
            setDate(selectedDate);

            removeStorage(
                STORAGE_KEYS.selectedDate,
            );
        }

        const query =
            new URLSearchParams(
                window.location.search,
            );

        if (query.get("new") === "1") {
            setModal("add");
        }
    }, []);

    const weekday =
        WEEKDAYS[
        new Date(
            `${date}T12:00:00`,
        ).getDay()
        ];

    const todayRoutines =
        routines.filter((routine) => {
            return (
                routine.enabled &&
                (routine.days || []).includes(
                    weekday,
                )
            );
        });

    const tasks = useMemo(() => {
        return data.tasks.filter(
            (task) => task.date === date,
        );
    }, [data.tasks, date]);

    const visibleTasks = useMemo(() => {
        return tasks.filter((task) => {
            if (filter === "remaining") {
                return !task.completed;
            }

            if (
                [
                    "essential",
                    "important",
                    "normal",
                ].includes(filter)
            ) {
                return task.priority === filter;
            }

            return true;
        });
    }, [tasks, filter]);

    const completedCount =
        tasks.filter(
            (task) => task.completed,
        ).length;

    const importantTotal =
        tasks.filter(
            (task) =>
                task.priority !== "normal",
        ).length;

    const importantCount =
        tasks.filter(
            (task) =>
                task.priority === "important",
        ).length;

    const essentialCount =
        tasks.filter(
            (task) =>
                task.priority === "essential",
        ).length;

    const normalCount =
        tasks.filter(
            (task) =>
                task.priority === "normal",
        ).length;

    const completionPercent =
        tasks.length > 0
            ? Math.round(
                (
                    completedCount /
                    tasks.length
                ) * 100,
            )
            : 0;

    const displayDate = formatDate(
        date,
        settings.calendar,
        settings.language,
    );

    const secondaryDate =
        settings.secondaryCalendar !==
            "none"
            ? formatDate(
                date,
                settings.secondaryCalendar,
                settings.language,
                true,
            )
            : "";

    const editingTask =
        modal?.type === "edit"
            ? data.tasks.find(
                (task) =>
                    task.id === modal.id,
            )
            : null;

    /* Toggles a task when all prerequisites are complete. */
    function toggleTask(task) {
        const isBlocked =
            (
                task.prerequisites || []
            ).some((prerequisiteId) => {
                const prerequisite =
                    data.tasks.find(
                        (item) =>
                            item.id ===
                            prerequisiteId,
                    );

                return !prerequisite?.completed;
            });

        if (isBlocked) {
            return;
        }

        setData((currentData) => ({
            ...currentData,

            tasks:
                currentData.tasks.map(
                    (item) => {
                        if (
                            item.id !== task.id
                        ) {
                            return item;
                        }

                        const completed =
                            !item.completed;

                        return {
                            ...item,
                            completed,

                            completedAt: completed
                                ? new Date()
                                    .toISOString()
                                : null,
                        };
                    },
                ),
        }));
    }

    /* Creates a new task or updates an existing task. */
    function saveTask(event) {
        event.preventDefault();

        const form =
            new FormData(
                event.currentTarget,
            );

        const prerequisite =
            form.get("prerequisite");

        const priority =
            form.get("priority");

        const taskId =
            form.get("id");

        const numericTaskId =
            taskId
                ? Number(taskId)
                : null;

        const otherTasks =
            tasks.filter(
                (task) =>
                    String(task.id) !==
                    String(taskId),
            );

        const importantTasks =
            otherTasks.filter(
                (task) =>
                    task.priority !== "normal",
            );

        if (
            priority !== "normal" &&
            importantTasks.length >= 7
        ) {
            window.alert(
                t("maxImportant"),
            );

            return;
        }

        const essentialTasks =
            otherTasks.filter(
                (task) =>
                    task.priority ===
                    "essential",
            );

        if (
            priority === "essential" &&
            essentialTasks.length >= 3
        ) {
            window.alert(
                t("maxEssential"),
            );

            return;
        }

        const scheduleType =
            form.get("scheduleType");

        const existingTask =
            numericTaskId
                ? data.tasks.find(
                    (task) =>
                        task.id ===
                        numericTaskId,
                )
                : null;

        const nextTask = {
            id:
                numericTaskId ||
                Date.now(),

            title:
                form.get("title"),

            description:
                form.get("description") ||
                "",

            date,
            priority,
            scheduleType,

            startTime:
                scheduleType === "time"
                    ? form.get("startTime") ||
                    ""
                    : "",

            endTime:
                scheduleType === "time"
                    ? form.get("endTime") ||
                    ""
                    : "",

            completed:
                existingTask?.completed ||
                false,

            activityUnit:
                form.get("unit"),

            activityValue:
                existingTask?.activityValue ||
                0,

            prerequisites:
                prerequisite
                    ? [
                        Number(
                            prerequisite,
                        ),
                    ]
                    : [],
        };

        setData((currentData) => ({
            ...currentData,

            tasks: numericTaskId
                ? currentData.tasks.map(
                    (task) =>
                        task.id ===
                            numericTaskId
                            ? {
                                ...task,
                                ...nextTask,
                            }
                            : task,
                )
                : [
                    ...currentData.tasks,
                    nextTask,
                ],
        }));

        setModal(null);
    }

    /* Deletes a task and removes prerequisite references. */
    function removeTask(task) {
        if (
            !window.confirm(
                t("confirmDeleteTask"),
            )
        ) {
            return;
        }

        setData((currentData) => ({
            ...currentData,

            tasks:
                currentData.tasks
                    .filter(
                        (item) =>
                            item.id !== task.id,
                    )
                    .map((item) => ({
                        ...item,

                        prerequisites:
                            (
                                item.prerequisites ||
                                []
                            ).filter(
                                (
                                    prerequisiteId,
                                ) =>
                                    prerequisiteId !==
                                    task.id,
                            ),
                    })),
        }));

        setModal(null);
    }

    /* Saves completion information for a task. */
    function completeTask(event) {
        event.preventDefault();

        const form =
            new FormData(
                event.currentTarget,
            );

        const taskId =
            Number(form.get("id"));

        const activityValue =
            Number(
                form.get("value") || 0,
            );

        const description =
            form.get("desc");

        setData((currentData) => ({
            ...currentData,

            tasks:
                currentData.tasks.map(
                    (task) =>
                        task.id === taskId
                            ? {
                                ...task,
                                completed: true,
                                activityValue,

                                description:
                                    description ||
                                    task.description,

                                completedAt:
                                    new Date()
                                        .toISOString(),
                            }
                            : task,
                ),
        }));

        setModal(null);
    }

    /* Saves preferences through LanguageProvider. */
    function saveSettings(event) {
        event.preventDefault();

        const form =
            new FormData(
                event.currentTarget,
            );

        updateSettings({
            language:
                form.get("language"),

            calendar:
                form.get("calendar"),

            secondaryCalendar:
                form.get(
                    "secondaryCalendar",
                ),

            firstDay:
                form.get("firstDay"),

            hijriMethod:
                form.get("hijriMethod"),
        });

        setModal(null);
    }

    return {
        data,
        date,
        modal,
        filter,
        settings,
        tasks,
        visibleTasks,
        todayRoutines,
        completedCount,
        importantTotal,
        importantCount,
        essentialCount,
        normalCount,
        completionPercent,
        displayDate,
        secondaryDate,
        editingTask,
        setFilter,
        setModal,
        toggleTask,
        saveTask,
        removeTask,
        completeTask,
        saveSettings,

        /* Opens the task completion modal. */
        openCompletionModal:
            (taskId) => {
                setModal({
                    type: "complete",
                    id: taskId,
                });
            },

        /* Opens the task editing modal. */
        openEditModal:
            (taskId) => {
                setModal({
                    type: "edit",
                    id: taskId,
                });
            },
    };
}