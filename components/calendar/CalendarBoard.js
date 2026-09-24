"use client";

import {
    calendarParts,
    monthTitle,
    weekdayNameIndex,
} from "../../lib/date";

import AppIcon from "../ui/AppIcon";
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

/* Renders the Aurora calendar month board. */
export default function CalendarBoard({
    anchor,
    cells,
    selected,
    settings,
    tasksByDate,
    onChooseDate,
    onShiftMonth,
    onToday,
}) {
    const { t } = useLanguage();
    const weekStartIndex = weekdayNameIndex(
        settings.firstDay,
    );

    return (
        <section className="card calendarWrap">
            <header className="calendarToolbar">
                <div className="calendarTitleGroup">
                    <h2>
                        {monthTitle(
                            anchor,
                            settings.calendar,
                            settings.language,
                        )}
                    </h2>

                    <div className="calendarPager">
                        <button
                            type="button"
                            className="calendarArrow"
                            onClick={() => onShiftMonth(-1)}
                            aria-label={t("monthPrev")}
                        >
                            <AppIcon
                                name="chevron-left"
                                size={18}
                            />
                        </button>

                        <button
                            type="button"
                            className="calendarTodayButton"
                            onClick={onToday}
                        >
                            {t("monthToday")}
                        </button>

                        <button
                            type="button"
                            className="calendarArrow"
                            onClick={() => onShiftMonth(1)}
                            aria-label={t("monthNext")}
                        >
                            <AppIcon
                                name="chevron-right"
                                size={18}
                            />
                        </button>
                    </div>
                </div>

                <div className="calendarViewActions">
                    <button
                        type="button"
                        className="calendarViewButton active"
                    >
                        {t("monthView")}
                    </button>

                    <button
                        type="button"
                        className="calendarViewButton"
                        onClick={() => onShiftMonth(-1)}
                    >
                        {t("monthPrev")}
                    </button>

                    <button
                        type="button"
                        className="calendarViewButton"
                        onClick={() => onShiftMonth(1)}
                    >
                        {t("monthNext")}
                    </button>
                </div>
            </header>

            <div className="calGrid">
                {WEEKDAYS.map((_, index) => {
                    const weekday =
                        WEEKDAYS[
                        (weekStartIndex + index) % 7
                        ];

                    return (
                        <div
                            className="calHead"
                            key={weekday}
                        >
                            {t(weekday)}
                        </div>
                    );
                })}

                {cells.map((date, index) => {
                    if (!date) {
                        return (
                            <div
                                className="calBlank"
                                key={`blank-${index}`}
                                aria-hidden="true"
                            />
                        );
                    }

                    const tasks = tasksByDate[date] ?? [];
                    const isSelected = date === selected;

                    return (
                        <button
                            type="button"
                            key={date}
                            className={[
                                "calDay",
                                isSelected ? "selected" : "",
                                tasks.length ? "hasTasks" : "",
                            ].filter(Boolean).join(" ")}
                            onClick={() => onChooseDate(date)}
                            aria-pressed={isSelected}
                        >
                            <span className="dayNum">
                                {
                                    calendarParts(
                                        date,
                                        settings.calendar,
                                        settings.language,
                                    ).day
                                }
                            </span>

                            {tasks.length > 0 && (
                                <div
                                    className="calendarTaskIndicators"
                                    aria-label={t("dayCount", {
                                        n: tasks.length,
                                    })}
                                >
                                    {tasks
                                        .slice(0, 2)
                                        .map((task) => (
                                            <span
                                                key={task.id}
                                                className={[
                                                    "calendarTaskIndicator",
                                                    task.priority || "normal",
                                                    task.completed
                                                        ? "completed"
                                                        : "",
                                                ].filter(Boolean).join(" ")}
                                            >
                                                <i />
                                                <b />
                                            </span>
                                        ))}

                                    {tasks.length > 2 && (
                                        <span className="calendarMoreTasks">
                                            +{tasks.length - 2}
                                        </span>
                                    )}
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>
        </section>
    );
}