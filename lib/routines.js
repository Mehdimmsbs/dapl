export const ROUTINE_DAYS = [
    "saturday",
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
];

export const ACTIVITY_UNITS = [
    "minute",
    "hour",
    "percent",
    "item",
    "page",
];

const LEGACY_UNIT_MAP = {
    دقیقه: "minute",
    ساعت: "hour",
    درصد: "percent",
    مورد: "item",
    صفحه: "page",
};

/* Creates a fresh routine form value. */
export function createEmptyRoutine() {
    return {
        id: null,
        title: "",
        description: "",
        priority: "normal",
        scheduleType: "day",
        startTime: "",
        endTime: "",
        unit: "minute",
        enabled: true,
        days: [...ROUTINE_DAYS],
    };
}

/* Converts old translated values into stable identifiers. */
export function normalizeUnit(unit) {
    if (ACTIVITY_UNITS.includes(unit)) {
        return unit;
    }

    return LEGACY_UNIT_MAP[unit] || "minute";
}