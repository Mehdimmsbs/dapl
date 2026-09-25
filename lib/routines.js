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

export const ROUTINE_TITLE_SUGGESTION_KEYS = [
    "routineSuggestionExercise",
    "routineSuggestionStudy",
    "routineSuggestionBreakfast",
    "routineSuggestionLunch",
    "routineSuggestionDinner",
    "routineSuggestionHouseCleaning",
    "routineSuggestionWalking",
    "routineSuggestionMeditation",
    "routineSuggestionDrinkWater",
    "routineSuggestionCheckEmail",
    "routineSuggestionPlanDay",
    "routineSuggestionLanguageLearning",
];

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
        days: [],
    };
}

/* Converts old translated values into stable identifiers. */
export function normalizeUnit(unit) {
    if (ACTIVITY_UNITS.includes(unit)) {
        return unit;
    }

    return LEGACY_UNIT_MAP[unit] || "minute";
}