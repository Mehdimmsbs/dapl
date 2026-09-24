"use client";

import {
    useEffect,
    useMemo,
    useState,
} from "react";

import { seed } from "../app/data";
import { useLanguage } from "../components/providers/LanguageProvider";
import { getLocalIsoDate } from "../lib/date";
import {
    createEmptyRoutine,
    normalizeUnit,
    ROUTINE_DAYS,
} from "../lib/routines";
import {
    STORAGE_KEYS,
    readStorage,
    writeStorage,
} from "../lib/storage";
import useStoredState from "./useStoredState";

const EMPTY_ROUTINES = [];

const JAVASCRIPT_WEEKDAYS = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
];

/* Owns routine persistence, filtering and actions. */
export default function useRoutinesPage() {
    const {
        settings,
        t,
    } = useLanguage();

    const [
        routines,
        setRoutines,
        hydrated,
    ] = useStoredState(
        STORAGE_KEYS.routines,
        EMPTY_ROUTINES,
    );

    const [
        filter,
        setFilter,
    ] = useState("all");

    const [
        editingRoutine,
        setEditingRoutine,
    ] = useState(null);

    /* Normalizes old translated unit values. */
    useEffect(() => {
        if (!hydrated) {
            return;
        }

        setRoutines(
            (currentRoutines) =>
                currentRoutines.map(
                    (routine) => ({
                        ...routine,

                        unit: normalizeUnit(
                            routine.unit,
                        ),
                    }),
                ),
        );
    }, [
        hydrated,
        setRoutines,
    ]);

    const visibleRoutines =
        useMemo(() => {
            if (filter === "all") {
                return routines;
            }

            return routines.filter(
                (routine) =>
                    (
                        routine.days || []
                    ).includes(filter),
            );
        }, [
            routines,
            filter,
        ]);

    /* Creates a localized weekday list. */
    function formatRoutineDays(
        routineDays,
    ) {
        const translatedDays =
            routineDays.map(
                (day) => t(day),
            );

        try {
            return new Intl.ListFormat(
                settings.language,
                {
                    style: "long",
                    type: "conjunction",
                },
            ).format(translatedDays);
        } catch {
            return translatedDays.join(
                ", ",
            );
        }
    }

    /* Creates or updates one routine. */
    function saveRoutine(form) {
        const normalizedRoutine = {
            ...form,

            id:
                form.id ||
                Date.now(),

            title:
                String(
                    form.title || "",
                ).trim(),

            description:
                String(
                    form.description || "",
                ).trim(),

            unit:
                normalizeUnit(form.unit),

            days:
                Array.isArray(
                    form.days,
                ) && form.days.length
                    ? form.days
                    : [...ROUTINE_DAYS],

            startTime:
                form.scheduleType ===
                    "time"
                    ? form.startTime
                    : "",

            endTime:
                form.scheduleType ===
                    "time"
                    ? form.endTime
                    : "",
        };

        if (
            !normalizedRoutine.title ||
            !normalizedRoutine.days.length
        ) {
            return;
        }

        setRoutines(
            (currentRoutines) =>
                form.id
                    ? currentRoutines.map(
                        (routine) =>
                            String(
                                routine.id,
                            ) ===
                                String(form.id)
                                ? normalizedRoutine
                                : routine,
                    )
                    : [
                        ...currentRoutines,
                        normalizedRoutine,
                    ],
        );

        setEditingRoutine(null);
    }

    /* Deletes one routine after confirmation. */
    function deleteRoutine(
        routineId,
    ) {
        if (
            !window.confirm(
                t(
                    "confirmDeleteRoutine",
                ),
            )
        ) {
            return;
        }

        setRoutines(
            (currentRoutines) =>
                currentRoutines.filter(
                    (routine) =>
                        String(
                            routine.id,
                        ) !==
                        String(routineId),
                ),
        );
    }

    /* Enables or disables one routine. */
    function toggleRoutine(
        routineId,
    ) {
        setRoutines(
            (currentRoutines) =>
                currentRoutines.map(
                    (routine) =>
                        String(
                            routine.id,
                        ) ===
                            String(routineId)
                            ? {
                                ...routine,

                                enabled:
                                    !routine.enabled,
                            }
                            : routine,
                ),
        );
    }

    /* Adds today's enabled routines as planner tasks. */
    function applyToday() {
        const today =
            getLocalIsoDate();

        const weekday =
            JAVASCRIPT_WEEKDAYS[
            new Date().getDay()
            ];

        const plannerData =
            readStorage(
                STORAGE_KEYS.planner,
                seed,
            );

        const existingTasks =
            Array.isArray(
                plannerData.tasks,
            )
                ? plannerData.tasks
                : [];

        const newTasks =
            routines
                .filter(
                    (routine) =>
                        routine.enabled &&
                        (
                            routine.days || []
                        ).includes(weekday),
                )
                .filter(
                    (routine) =>
                        !existingTasks.some(
                            (task) =>
                                task.date ===
                                today &&
                                String(
                                    task.routineId,
                                ) ===
                                String(
                                    routine.id,
                                ),
                        ),
                )
                .map(
                    (
                        routine,
                        index,
                    ) => ({
                        id:
                            Date.now() +
                            index,

                        title:
                            routine.title,

                        description:
                            routine.description ||
                            "",

                        date: today,

                        priority:
                            routine.priority,

                        scheduleType:
                            routine.scheduleType,

                        startTime:
                            routine.scheduleType ===
                                "time"
                                ? routine.startTime
                                : "",

                        endTime:
                            routine.scheduleType ===
                                "time"
                                ? routine.endTime
                                : "",

                        completed: false,

                        activityUnit:
                            normalizeUnit(
                                routine.unit,
                            ),

                        activityValue: 0,
                        prerequisites: [],
                        source: "routine",

                        routineId:
                            routine.id,
                    }),
                );

        if (!newTasks.length) {
            window.alert(
                t("routineNothing"),
            );

            return;
        }

        writeStorage(
            STORAGE_KEYS.planner,
            {
                ...plannerData,

                tasks: [
                    ...existingTasks,
                    ...newTasks,
                ],
            },
        );

        window.alert(
            t("routineApplied", {
                n: newTasks.length,
            }),
        );
    }

    return {
        settings,
        filter,
        setFilter,
        editingRoutine,
        setEditingRoutine,
        visibleRoutines,
        formatRoutineDays,

        /* Opens a clean routine form. */
        openNewRoutine: () => {
            setEditingRoutine(
                createEmptyRoutine(),
            );
        },

        saveRoutine,
        deleteRoutine,
        toggleRoutine,
        applyToday,
    };
}