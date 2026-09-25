"use client";

import { useState } from "react";

import { formatDate } from "../../lib/date";
import Modal from "../ui/Modal";
import { useLanguage } from "../providers/LanguageProvider";

const ACTIVITY_UNITS = [
    "minute",
    "hour",
    "percent",
    "item",
    "page",
];

/* Displays the calendar task creation form. */
export default function CalendarTaskForm({
    date,
    settings,
    onSave,
    onClose,
}) {
    const { t } = useLanguage();

    const [
        scheduleType,
        setScheduleType,
    ] = useState("day");

    /* Creates a normalized task from form values. */
    function saveTask(event) {
        event.preventDefault();

        const form =
            new FormData(
                event.currentTarget,
            );

        const title =
            String(
                form.get("title") ?? "",
            ).trim();

        if (!title) {
            return;
        }

        onSave({
            id: Date.now(),
            title,

            description:
                String(
                    form.get(
                        "description",
                    ) ?? "",
                ).trim(),

            date,

            priority:
                form.get("priority"),

            scheduleType,

            startTime:
                scheduleType === "time"
                    ? form.get("startTime")
                    : "",

            endTime:
                scheduleType === "time"
                    ? form.get("endTime")
                    : "",

            completed: false,

            activityUnit:
                form.get("unit"),

            activityValue: 0,
            prerequisites: [],
        });
    }

    return (
        <Modal
            title={t("addFor", {
                date: formatDate(
                    date,
                    settings.calendar,
                    settings.language,
                ),
            })}
            close={onClose}
        >
            <form
                className="form"
                onSubmit={saveTask}
            >
                <label>
                    {t("title")}

                    <input
                        name="title"
                        required
                        autoFocus
                    />
                </label>

                <label>
                    {t("description")}

                    <textarea
                        name="description"
                        rows="3"
                    />
                </label>

                <label>
                    {t("priority")}

                    <select
                        name="priority"
                        defaultValue="normal"
                    >
                        <option value="normal">
                            {t("normal")}
                        </option>

                        <option value="important">
                            {t("importantLabel")}
                        </option>

                        <option value="essential">
                            {t("essentialLabel")}
                        </option>
                    </select>
                </label>

                <label>
                    {t("schedule")}

                    <select
                        name="scheduleType"
                        value={scheduleType}
                        onChange={(event) => {
                            setScheduleType(
                                event.target.value,
                            );
                        }}
                    >
                        <option value="day">
                            {t("day")}
                        </option>

                        <option value="time">
                            {t("atTime")}
                        </option>
                    </select>
                </label>

                {scheduleType === "time" && (
                    <div className="two timeFields">
                        <label>
                            {t("start")}

                            <input
                                name="startTime"
                                type="time"
                                required
                            />
                        </label>

                        <label>
                            {t("end")}

                            <input
                                name="endTime"
                                type="time"
                                required
                            />
                        </label>
                    </div>
                )}

                <label>
                    {t("unit")}

                    <select
                        name="unit"
                        defaultValue="minute"
                    >
                        {ACTIVITY_UNITS.map(
                            (unit) => {
                                const translationKey =
                                    `unit${unit[0]
                                        .toUpperCase()
                                    }${unit.slice(1)}`;

                                return (
                                    <option
                                        key={unit}
                                        value={unit}
                                    >
                                        {t(
                                            translationKey,
                                        )}
                                    </option>
                                );
                            },
                        )}
                    </select>
                </label>

                <button
                    className="primary"
                    type="submit"
                >
                    {t("save")}
                </button>
            </form>
        </Modal>
    );
}