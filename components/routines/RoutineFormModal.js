"use client";

import { useState } from "react";

import {
    ACTIVITY_UNITS,
    ROUTINE_DAYS,
    createEmptyRoutine,
    normalizeUnit,
} from "../../lib/routines";
import Modal from "../ui/Modal";
import { useLanguage } from "../providers/LanguageProvider";

/* Displays the routine creation and editing form. */
export default function RoutineFormModal({
    routine,
    onClose,
    onSave,
}) {
    const { t } = useLanguage();

    const [
        form,
        setForm,
    ] = useState(() => ({
        ...createEmptyRoutine(),
        ...routine,

        unit: normalizeUnit(
            routine.unit,
        ),

        days: [
            ...(
                routine.days ||
                ROUTINE_DAYS
            ),
        ],
    }));

    /* Updates one routine field. */
    function handleChange(event) {
        const {
            name,
            value,
            type,
            checked,
        } = event.target;

        setForm(
            (currentForm) => ({
                ...currentForm,

                [name]:
                    type === "checkbox"
                        ? checked
                        : value,
            }),
        );
    }

    /* Adds or removes one weekday. */
    function toggleDay(day) {
        setForm(
            (currentForm) => ({
                ...currentForm,

                days:
                    currentForm.days.includes(
                        day,
                    )
                        ? currentForm.days.filter(
                            (currentDay) =>
                                currentDay !==
                                day,
                        )
                        : [
                            ...currentForm.days,
                            day,
                        ],
            }),
        );
    }

    /* Sends a normalized routine to the page hook. */
    function handleSubmit(event) {
        event.preventDefault();

        onSave({
            ...form,

            title:
                form.title.trim(),

            description:
                form.description.trim(),
        });
    }

    return (
        <Modal
            title={
                routine.id
                    ? t("editRoutine")
                    : t("newRoutine")
            }
            close={onClose}
        >
            <form
                className="form"
                onSubmit={handleSubmit}
            >
                <label>
                    {t("title")}

                    <input
                        name="title"
                        value={form.title}
                        onChange={
                            handleChange
                        }
                        required
                        autoFocus
                    />
                </label>

                <label>
                    {t(
                        "routineDescription",
                    )}

                    <textarea
                        name="description"
                        rows="3"
                        value={
                            form.description
                        }
                        onChange={
                            handleChange
                        }
                    />
                </label>

                <label>
                    {t("priority")}

                    <select
                        name="priority"
                        value={form.priority}
                        onChange={
                            handleChange
                        }
                    >
                        <option value="normal">
                            {t("normal")}
                        </option>

                        <option value="important">
                            {t(
                                "importantLabel",
                            )}
                        </option>

                        <option value="essential">
                            {t(
                                "essentialLabel",
                            )}
                        </option>
                    </select>
                </label>

                <label>
                    {t("schedule")}

                    <select
                        name="scheduleType"
                        value={
                            form.scheduleType
                        }
                        onChange={
                            handleChange
                        }
                    >
                        <option value="day">
                            {t("day")}
                        </option>

                        <option value="time">
                            {t("atTime")}
                        </option>
                    </select>
                </label>

                {form.scheduleType ===
                    "time" && (
                        <div className="two timeFields">
                            <label>
                                {t("start")}

                                <input
                                    name="startTime"
                                    type="time"
                                    value={
                                        form.startTime
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    required
                                />
                            </label>

                            <label>
                                {t("end")}

                                <input
                                    name="endTime"
                                    type="time"
                                    value={
                                        form.endTime
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    required
                                />
                            </label>
                        </div>
                    )}

                <label>
                    {t("unit")}

                    <select
                        name="unit"
                        value={form.unit}
                        onChange={
                            handleChange
                        }
                    >
                        {ACTIVITY_UNITS.map(
                            (unit) => {
                                const key =
                                    `unit${unit[0]
                                        .toUpperCase()
                                    }${unit.slice(1)}`;

                                return (
                                    <option
                                        key={unit}
                                        value={unit}
                                    >
                                        {t(key)}
                                    </option>
                                );
                            },
                        )}
                    </select>
                </label>

                <div className="weekPicker">
                    <b>
                        {t("routineDays")}
                    </b>

                    {ROUTINE_DAYS.map(
                        (day) => (
                            <button
                                type="button"
                                key={day}
                                className={`dayChoice ${form.days.includes(
                                    day,
                                )
                                        ? "on"
                                        : ""
                                    }`}
                                onClick={() => {
                                    toggleDay(day);
                                }}
                            >
                                {t(day)}
                            </button>
                        ),
                    )}
                </div>

                <label className="switchRow">
                    <span>
                        {t("enabled")}
                    </span>

                    <input
                        name="enabled"
                        type="checkbox"
                        checked={
                            form.enabled
                        }
                        onChange={
                            handleChange
                        }
                    />
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