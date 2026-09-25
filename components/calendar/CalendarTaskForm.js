"use client";

import { useState } from "react";

import { formatDate } from "../../lib/date";
import SelectField from "../ui/SelectField";
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
    task,
    onSave,
    onClose,
}) {
    const { t } = useLanguage();

    const [scheduleType, setScheduleType] = useState(
        task?.scheduleType || "day",
    );
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
            ...(task || {}),
            id: task?.id ?? Date.now(),
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

            completed: task?.completed ?? false,

            activityUnit:
                form.get("unit"),

            activityValue: task?.activityValue ?? 0,
            prerequisites: task?.prerequisites ?? [],
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
                        defaultValue={task?.title ?? ""}
                        required
                        autoFocus
                    />
                </label>

                <label>
                    {t("description")}

                    <textarea
                        defaultValue={task?.description ?? ""}
                        name="description"
                        rows="3"
                    />
                </label>

                <label>
                    {t("priority")}

                    <SelectField

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
                    </SelectField>
                </label>

                <label>
                    {t("schedule")}

                    <SelectField

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
                    </SelectField>
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

                    <SelectField

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
                    </SelectField>
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