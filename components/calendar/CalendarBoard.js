"use client";

import {
    calendarParts,
    getLocalIsoDate,
    monthTitle,
    weekdayNameIndex,
} from "../../lib/date";

import { useLanguage } from "../providers/LanguageProvider";
import AppIcon from "../ui/AppIcon";

const WEEKDAYS = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
];

/* Renders the calendar month and its task summaries. */
export default function CalendarBoard({
    anchor,
    cells,
    selected,
    settings,
    tasksByDate,
    onChooseDate,
    onShiftMonth,
    onToday,
    onPickMonth,
}) {
    const { t } = useLanguage();
    const today = getLocalIsoDate();

    const weekStartIndex = weekdayNameIndex(
        settings.firstDay,
    );

    return (
        <section className="card calendarWrap">
            <header className="calendarToolbar">
                <div className="calendarTitleGroup">
                    <button
                        type="button"
                        className="calendarMonthTrigger"
                        onClick={onPickMonth}
                        aria-label={t("chooseCalendarMonth")}
                    >
                        {monthTitle(
                            anchor,
                            settings.calendar,
                            settings.language,
                        )}

                        <AppIcon
                            name="chevron-down"
                            size={18}
                        />
                    </button>

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

                <div
                    className="calendarPriorityLegend"
                    aria-label={t("priority")}
                >
                    <span className="essential">
                        <i aria-hidden="true" />
                        {t("essentialLabel")}
                    </span>

                    <span className="important">
                        <i aria-hidden="true" />
                        {t("importantLabel")}
                    </span>

                    <span className="normal">
                        <i aria-hidden="true" />
                        {t("normal")}
                    </span>
                </div>
            </header>

            <div className="calGrid">
                {WEEKDAYS.map((_, index) => {
                    const weekday =
                        WEEKDAYS[
                        (weekStartIndex + index) %
                        WEEKDAYS.length
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

                    const tasks =
                        tasksByDate[date] ?? [];

                    const priorityCounts = [
                        "essential",
                        "important",
                        "normal",
                    ]
                        .map((priority) => {
                            const priorityTasks =
                                tasks.filter(
                                    (task) =>
                                        task.priority ===
                                        priority,
                                );

                            return {
                                priority,
                                total:
                                    priorityTasks.length,
                                completed:
                                    priorityTasks.filter(
                                        (task) =>
                                            task.completed,
                                    ).length,
                            };
                        })
                        .filter(
                            ({ total }) => total > 0,
                        );

                    const isSelected =
                        date === selected;

                    return (
                        <button
                            type="button"
                            key={date}
                            className={[
                                "calDay",
                                date === today
                                    ? "isToday"
                                    : "",
                                isSelected
                                    ? "selected"
                                    : "",
                                tasks.length
                                    ? "hasTasks"
                                    : "",
                            ]
                                .filter(Boolean)
                                .join(" ")}
                            onClick={() =>
                                onChooseDate(date)
                            }
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

                            {priorityCounts.length >
                                0 && (
                                    <div className="calendarTaskIndicators">
                                        {priorityCounts.map(
                                            ({
                                                priority,
                                                completed,
                                                total,
                                            }) => (
                                                <span
                                                    key={priority}
                                                    className={`calendarPriorityRow ${priority}`}
                                                    aria-label={`${t(
                                                        priority ===
                                                            "normal"
                                                            ? "normal"
                                                            : `${priority}Label`,
                                                    )}: ${completed}/${total}`}
                                                >
                                                    <i aria-hidden="true" />
                                                    <b aria-hidden="true" />
                                                    <strong>
                                                        {completed}/
                                                        {total}
                                                    </strong>
                                                </span>
                                            ),
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