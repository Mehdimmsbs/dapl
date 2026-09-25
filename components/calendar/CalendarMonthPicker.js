"use client";

import { useMemo, useState } from "react";

import {
    calendarParts,
    getAdjacentMonthDate,
    monthTitle,
} from "../../lib/date";
import { useLanguage } from "../providers/LanguageProvider";
import Modal from "../ui/Modal";
import SelectField from "../ui/SelectField";

export default function CalendarMonthPicker({
    anchor,
    settings,
    onChoose,
    onClose,
}) {
    const { t } = useLanguage();
    const calendar = settings.calendar;

    const currentYear = calendarParts(
        anchor,
        calendar,
    ).year;

    const [year, setYear] = useState(currentYear);

    // Collect month anchors around the currently visible month.
    // This also works for Jalali and Hijri calendars.
    const months = useMemo(() => {
        let date = anchor;

        for (let i = 0; i < 72; i += 1) {
            date = getAdjacentMonthDate(
                date,
                -1,
                calendar,
            );
        }

        const result = [];

        for (let i = 0; i <= 144; i += 1) {
            const parts = calendarParts(
                date,
                calendar,
            );

            result.push({
                date,
                year: parts.year,
                month: parts.month,
            });

            date = getAdjacentMonthDate(
                date,
                1,
                calendar,
            );
        }

        return result;
    }, [anchor, calendar]);

    const years = [
        ...new Set(months.map((item) => item.year)),
    ];

    const visibleMonths = months.filter(
        (item) => item.year === year,
    );

    return (
        <Modal title={t("chooseCalendarMonth")} close={onClose}>
            <div className="calendarMonthPicker">
                <SelectField
                    label={t("calendarYear")}
                    value={String(year)}
                    onChange={(event) => {
                        setYear(Number(event.target.value));
                    }}
                >
                    {years.map((item) => (
                        <option
                            key={item}
                            value={String(item)}
                        >
                            {item}
                        </option>
                    ))}
                </SelectField>

                <div
                    className="calendarMonthChoices"
                    aria-label={t("calendarMonth")}
                >
                    {visibleMonths.map((item) => (
                        <button
                            key={`${item.year}-${item.month}`}
                            type="button"
                            className={
                                item.year === currentYear &&
                                    item.month ===
                                    calendarParts(
                                        anchor,
                                        calendar,
                                    ).month
                                    ? "isCurrent"
                                    : ""
                            }
                            onClick={() => {
                                onChoose(item.date);
                            }}
                        >
                            {monthTitle(
                                item.date,
                                calendar,
                                settings.language,
                            )}
                        </button>
                    ))}
                </div>
            </div>
        </Modal>
    );
}