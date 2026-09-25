"use client";

import {
    useEffect,
    useMemo,
    useState,
} from "react";

import { seed } from "../app/data";
import { useLanguage } from "../components/providers/LanguageProvider";
import {
    addDays,
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

    const carryToday =
        getLocalIsoDate();

    const carryTomorrow =
        addDays(carryToday, 1);

    const carryFrom =
        addDays(carryToday, -2);

    const carryTasks = useMemo(() => {
        return data.tasks
            .filter(
                (task) =>
                    !task.completed &&
                    task.date >= carryFrom &&
                    task.date <= carryToday,
            )
            .sort(
                (firstTask, secondTask) =>
                    firstTask.date.localeCompare(
                        secondTask.date,
                    ),
            );
    }, [
        data.tasks,
        carryFrom,
        carryToday,
    ]);

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

    const detailsTask =
        modal?.type === "details"
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

    /* Creates, carries or updates a task. */
    function saveTask(event) {
        event.preventDefault();

        const form =
            new FormData(
                event.currentTarget,
            );

        const taskId =
            form.get("id");

        const carryId =
            form.get("carryId");

        const numericTaskId =
            taskId
                ? Number(taskId)
                : null;

        const existingTask =
            numericTaskId
                ? data.tasks.find(
                    (task) =>
                        task.id ===
                        numericTaskId,
                )
                : null;

        const carriedTask =
            carryId
                ? data.tasks.find(
                    (task) =>
                        String(task.id) ===
                        String(carryId) &&
                        !task.completed &&
                        task.date >= carryFrom &&
                        task.date <= carryToday,
                )
                : null;

        /*
         * Stops manipulated or outdated Carry over
         * submissions from creating a duplicate task.
         */
        if (carryId && !carriedTask) {
            return;
        }

        const taskDate =
            form.get("date") ||
            existingTask?.date ||
            date;

        /*
         * An unfinished task may only be moved
         * to today or tomorrow.
         */
        if (
            carriedTask &&
            taskDate !== carryToday &&
            taskDate !== carryTomorrow
        ) {
            return;
        }

        const priority =
            form.get("priority");

        /*
         * Priority limits are calculated for the
         * selected target date.
         */
        const otherTasksOnDate =
            data.tasks.filter(
                (task) =>
                    task.date === taskDate &&
                    String(task.id) !==
                    String(taskId) &&
                    String(task.id) !==
                    String(carryId),
            );

        const importantTasks =
            otherTasksOnDate.filter(
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
            otherTasksOnDate.filter(
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

        const prerequisiteValue =
            form.get("prerequisite");

        const prerequisiteId =
            prerequisiteValue
                ? Number(prerequisiteValue)
                : null;

        const validPrerequisite =
            prerequisiteId
                ? data.tasks.find(
                    (task) =>
                        task.id ===
                        prerequisiteId &&
                        task.date ===
                        taskDate &&
                        String(task.id) !==
                        String(numericTaskId) &&
                        String(task.id) !==
                        String(carriedTask?.id),
                )
                : null;

        const scheduleType =
            form.get("scheduleType");

        const baseTask =
            carriedTask ||
            existingTask;

        const nextTask = {
            id:
                numericTaskId ||
                carriedTask?.id ||
                Date.now(),

            title:
                String(
                    form.get("title") || "",
                ).trim(),

            description:
                String(
                    form.get("description") ||
                    "",
                ).trim(),

            date: taskDate,
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
                carriedTask
                    ? false
                    : existingTask?.completed ||
                    false,

            completedAt:
                carriedTask
                    ? null
                    : existingTask?.completedAt ||
                    null,

            activityUnit:
                form.get("unit") ||
                "minute",

            activityValue:
                carriedTask
                    ? 0
                    : existingTask?.activityValue ||
                    0,

            prerequisites:
                validPrerequisite
                    ? [validPrerequisite.id]
                    : [],

            routineId:
                baseTask?.routineId,

            source:
                baseTask?.source,

            carriedFromDate:
                carriedTask
                    ? carriedTask.carriedFromDate ||
                    carriedTask.date
                    : existingTask?.carriedFromDate,

            carriedOverAt:
                carriedTask
                    ? new Date().toISOString()
                    : existingTask?.carriedOverAt,
        };

        if (!nextTask.title) {
            return;
        }

        const replacedTaskId =
            numericTaskId ||
            carriedTask?.id;

        setData((currentData) => ({
            ...currentData,

            tasks: replacedTaskId
                ? currentData.tasks.map(
                    (task) => {
                        if (
                            String(task.id) ===
                            String(replacedTaskId)
                        ) {
                            return {
                                ...task,
                                ...nextTask,
                            };
                        }

                        /*
                         * Removes references to the carried
                         * task from other prerequisites.
                         */
                        if (carriedTask) {
                            return {
                                ...task,

                                prerequisites:
                                    (
                                        task.prerequisites ||
                                        []
                                    ).filter(
                                        (prerequisiteTaskId) =>
                                            String(
                                                prerequisiteTaskId,
                                            ) !==
                                            String(
                                                carriedTask.id,
                                            ),
                                    ),
                            };
                        }

                        return task;
                    },
                )
                : [
                    ...currentData.tasks,
                    nextTask,
                ],
        }));

        setDate(taskDate);
        setModal(null);
    }

    /* Moves an unfinished task to today or tomorrow. */
    function carryTask(
        taskId,
        targetDate,
    ) {
        if (
            targetDate !== carryToday &&
            targetDate !== carryTomorrow
        ) {
            return;
        }

        setData((currentData) => {
            const sourceTask =
                currentData.tasks.find(
                    (task) =>
                        String(task.id) ===
                        String(taskId),
                );

            if (
                !sourceTask ||
                sourceTask.completed ||
                sourceTask.date === targetDate
            ) {
                return currentData;
            }

            return {
                ...currentData,

                tasks:
                    currentData.tasks.map(
                        (task) => {
                            if (
                                String(task.id) ===
                                String(taskId)
                            ) {
                                return {
                                    ...task,
                                    date: targetDate,

                                    carriedFromDate:
                                        task.carriedFromDate ||
                                        task.date,

                                    carriedOverAt:
                                        new Date()
                                            .toISOString(),

                                    prerequisites: [],
                                };
                            }

                            return {
                                ...task,

                                prerequisites:
                                    (
                                        task.prerequisites ||
                                        []
                                    ).filter(
                                        (
                                            prerequisiteId,
                                        ) =>
                                            String(
                                                prerequisiteId,
                                            ) !==
                                            String(taskId),
                                    ),
                            };
                        },
                    ),
            };
        });
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

            fontSize:
                form.get("fontSize") ||
                "medium",
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
        carryTasks,
        carryToday,
        carryTomorrow,
        completedCount,
        importantTotal,
        importantCount,
        essentialCount,
        normalCount,
        completionPercent, carryTasks,
        carryToday,
        carryTomorrow,
        displayDate,
        secondaryDate,
        editingTask,
        detailsTask,
        setFilter,
        setModal,
        toggleTask,
        saveTask,
        carryTask,
        removeTask,
        completeTask,
        saveSettings,

        /* Opens the task details modal. */
        openDetailsModal:
            (taskId) => {
                setModal({
                    type: "details",
                    id: taskId,
                });
            },

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