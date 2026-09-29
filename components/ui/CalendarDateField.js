"use client";

import { useEffect, useRef, useState } from "react";

import {
    calendarParts,
    getAdjacentMonthDate,
    getLocalIsoDate,
    monthDates,
    monthTitle,
    formatDate,
    weekdayIndex,
    weekdayNameIndex,
} from "../../lib/date";
import { tr } from "../../lib/i18n";

const WEEKDAYS = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
];

export default function CalendarDateField({
    value,
    onChange,
    calendar,
    lang,
    firstDay = "monday",
    min,
    max,
}) {
    const [open, setOpen] = useState(false);
    const [anchor, setAnchor] = useState(value);
    const rootRef = useRef(null);

    const t = (key) => tr(lang, key);
    const today = getLocalIsoDate();

    useEffect(() => {
        setAnchor(value);
    }, [value, calendar]);

    useEffect(() => {
        if (!open) return;

        function handlePointerDown(event) {
            if (!rootRef.current?.contains(event.target)) {
                setOpen(false);
            }
        }

        function handleKeyDown(event) {
            if (event.key === "Escape") {
                setOpen(false);
            }
        }

        document.addEventListener("pointerdown", handlePointerDown);
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("pointerdown", handlePointerDown);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [open]);

    const days = monthDates(anchor, calendar);
    const weekStart = weekdayNameIndex(firstDay);
    const blanks = days.length
        ? (weekdayIndex(days[0]) - weekStart + 7) % 7
        : 0;

    const numberFormatter = new Intl.NumberFormat(
        lang === "fa"
            ? "fa-IR"
            : lang === "ar"
                ? "ar-SA"
                : lang === "de"
                    ? "de-DE"
                    : "en-US",
        { useGrouping: false },
    );

    function chooseDate(date) {
        if ((min && date < min) || (max && date > max)) {
            return;
        }

        onChange(date);
        setOpen(false);
    }

    return (
        <div className="calendarDateField" ref={rootRef}>
            <span className="calendarDateLabel">
                {t("taskDate")}
            </span>

            <button
                type="button"
                className="calendarDateTrigger"
                aria-expanded={open}
                onClick={() => setOpen((current) => !current)}
            >
                {formatDate(value, calendar, lang)}
                <span aria-hidden="true">▾</span>
            </button>

            {open && (
                <div className="calendarDatePanel">
                    <div className="calendarDateToolbar">
                        <button
                            type="button"
                            aria-label={t("monthPrev")}
                            onClick={() =>
                                setAnchor(
                                    getAdjacentMonthDate(anchor, -1, calendar),
                                )
                            }
                        >
                            ‹
                        </button>

                        <strong>{monthTitle(anchor, calendar, lang)}</strong>

                        <button
                            type="button"
                            aria-label={t("monthNext")}
                            onClick={() =>
                                setAnchor(
                                    getAdjacentMonthDate(anchor, 1, calendar),
                                )
                            }
                        >
                            ›
                        </button>
                    </div>

                    <div className="calendarDateGrid">
                        {WEEKDAYS.map((_, index) => {
                            const weekday =
                                WEEKDAYS[(weekStart + index) % 7];

                            return (
                                <span
                                    className="calendarDateWeekday"
                                    key={weekday}
                                >
                                    {t(weekday)}
                                </span>
                            );
                        })}

                        {Array.from(
                            { length: blanks },
                            (_, index) => (
                                <span key={`blank-${index}`} />
                            ),
                        )}

                        {days.map((date) => {
                            const disabled =
                                (min && date < min) ||
                                (max && date > max);

                            return (
                                <button
                                    key={date}
                                    type="button"
                                    disabled={Boolean(disabled)}
                                    className={[
                                        "calendarDateDay",
                                        date === value ? "isSelected" : "",
                                        date === today ? "isToday" : "",
                                    ]
                                        .filter(Boolean)
                                        .join(" ")}
                                    aria-label={formatDate(date, calendar, lang)}
                                    aria-pressed={date === value}
                                    onClick={() => chooseDate(date)}
                                >
                                    {numberFormatter.format(
                                        calendarParts(date, calendar).day,
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* The saved value remains the ISO date used by the app. */}
            <input type="hidden" name="date" value={value} />
        </div>
    );
}