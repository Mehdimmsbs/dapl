"use client";

import {
    ROUTINE_DAYS,
} from "../../lib/routines";
import { useLanguage } from "../providers/LanguageProvider";

/* Displays routine filters and routine cards. */
export default function RoutineList({
    filter,
    routines,
    formatDays,
    onDelete,
    onEdit,
    onFilterChange,
    onToggle,
}) {
    const { t } = useLanguage();

    /* Returns a translated priority label. */
    function priorityLabel(
        priority,
    ) {
        if (
            priority === "essential"
        ) {
            return t(
                "essentialLabel",
            );
        }

        if (
            priority === "important"
        ) {
            return t(
                "importantLabel",
            );
        }

        return t("normal");
    }

    return (
        <section className="card routinesPage">
            <div className="routineFilters">
                <button
                    type="button"
                    className={
                        filter === "all"
                            ? "on"
                            : ""
                    }
                    onClick={() => {
                        onFilterChange(
                            "all",
                        );
                    }}
                >
                    {t("allDays")}
                </button>

                {ROUTINE_DAYS.map(
                    (day) => (
                        <button
                            type="button"
                            key={day}
                            className={
                                filter === day
                                    ? "on"
                                    : ""
                            }
                            onClick={() => {
                                onFilterChange(
                                    day,
                                );
                            }}
                        >
                            {t(day)}
                        </button>
                    ),
                )}
            </div>

            <div className="routineList">
                {routines.map(
                    (routine) => (
                        <div
                            className={`routineItem ${routine.enabled
                                    ? ""
                                    : "disabled"
                                }`}
                            key={routine.id}
                        >
                            <div className="routineMain">
                                <div className="routineIcon">
                                    ↻
                                </div>

                                <div>
                                    <b>
                                        {routine.title}
                                    </b>

                                    <span>
                                        {routine.scheduleType ===
                                            "time"
                                            ? `${routine.startTime} – ${routine.endTime}`
                                            : t("day")}

                                        {" · "}

                                        {formatDays(
                                            routine.days ||
                                            [],
                                        )}
                                    </span>

                                    {routine.description && (
                                        <small className="routineDesc">
                                            {
                                                routine.description
                                            }
                                        </small>
                                    )}
                                </div>
                            </div>

                            <div className="routineActions">
                                <span
                                    className={`tag ${routine.priority}`}
                                >
                                    {priorityLabel(
                                        routine.priority,
                                    )}
                                </span>

                                <button
                                    type="button"
                                    className="miniBtn"
                                    onClick={() => {
                                        onToggle(
                                            routine.id,
                                        );
                                    }}
                                    title={t(
                                        "enabled",
                                    )}
                                >
                                    {routine.enabled
                                        ? "✓"
                                        : "○"}
                                </button>

                                <button
                                    type="button"
                                    className="miniBtn"
                                    onClick={() => {
                                        onEdit({
                                            ...routine,
                                        });
                                    }}
                                    title={t("edit")}
                                >
                                    ✎
                                </button>

                                <button
                                    type="button"
                                    className="miniBtn dangerBtn"
                                    onClick={() => {
                                        onDelete(
                                            routine.id,
                                        );
                                    }}
                                    title={t("delete")}
                                >
                                    ×
                                </button>
                            </div>
                        </div>
                    ),
                )}

                {!routines.length && (
                    <div className="empty">
                        {t("noRoutines")}
                    </div>
                )}
            </div>
        </section>
    );
}