"use client";

import {
    calendarParts,
    monthTitle,
    weekdayNameIndex,
} from "../../lib/date";
import { useLanguage } from "../providers/LanguageProvider";

const WEEKDAYS = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
];

/* Renders the calendar toolbar, weekdays and day cells. */
export default function CalendarBoard({
    anchor,
    cells,
    days,
    selected,
    settings,
    tasksByDate,
    onChooseDate,
    onShiftMonth,
    onToday,
}) {
    const { t } = useLanguage();

    const weekStartIndex =
        weekdayNameIndex(
            settings.firstDay,
        );

    return (
        <section className="card calendarWrap">
            <div className="calendarToolbar">
                <div className="monthTitle">
                    <h1>
                        {monthTitle(
                            anchor,
                            settings.calendar,
                            settings.language,
                        )}
                    </h1>

                    <span>
                        {days.length} {t("days")}
                    </span>
                </div>

                <div className="monthActions">
                    <button
                        type="button"
                        className="ghost"
                        onClick={() => {
                            onShiftMonth(-1);
                        }}
                    >
                        {t("monthPrev")}
                    </button>

                    <button
                        type="button"
                        className="ghost"
                        onClick={onToday}
                    >
                        {t("monthToday")}
                    </button>

                    <button
                        type="button"
                        className="ghost"
                        onClick={() => {
                            onShiftMonth(1);
                        }}
                    >
                        {t("monthNext")}
                    </button>
                </div>
            </div>

            <div className="calGrid">
                {WEEKDAYS.map(
                    (_, index) => {
                        const weekday =
                            WEEKDAYS[
                            (
                                weekStartIndex +
                                index
                            ) % 7
                            ];

                        return (
                            <div
                                className="calHead"
                                key={weekday}
                            >
                                {t(weekday)}
                            </div>
                        );
                    },
                )}

                {cells.map(
                    (date, index) => {
                        if (!date) {
                            return (
                                <div
                                    className="calBlank"
                                    key={`blank-${index}`}
                                />
                            );
                        }

                        const tasks =
                            tasksByDate[date] ??
                            [];

                        return (
                            <button
                                type="button"
                                key={date}
                                className={`calDay ${date === selected
                                        ? "selected"
                                        : ""
                                    }`}
                                onClick={() => {
                                    onChooseDate(date);
                                }}
                            >
                                <span className="dayNum">
                                    {
                                        calendarParts(
                                            date,
                                            settings.calendar,
                                        ).day
                                    }
                                </span>

                                <div className="dots">
                                    {tasks.some(
                                        (task) =>
                                            task.priority ===
                                            "essential",
                                    ) && (
                                            <i className="dot r" />
                                        )}

                                    {tasks.some(
                                        (task) =>
                                            task.priority ===
                                            "important",
                                    ) && (
                                            <i className="dot p" />
                                        )}

                                    {tasks.some(
                                        (task) =>
                                            task.completed,
                                    ) && (
                                            <i className="dot g" />
                                        )}
                                </div>

                                {tasks.length > 0 && (
                                    <span className="count">
                                        {t("dayCount", {
                                            n: tasks.length,
                                        })}
                                    </span>
                                )}
                            </button>
                        );
                    },
                )}
            </div>
        </section>
    );
}