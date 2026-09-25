export const STORAGE_KEYS = {
    planner: "personal-daily-planner-data-v5",
    settings: "personal-daily-planner-settings-v5",
    routines: "personal-daily-planner-routines-v8",
    darkMode: "pdp-dark",
    selectedDate: "pdp-selected-date",
};

export const STORAGE_EVENT = "pdp-storage";

/* Reads a JSON value safely from localStorage. */
export function readStorage(key, fallback) {
    if (typeof window === "undefined") {
        return fallback;
    }

    try {
        const storedValue = window.localStorage.getItem(key);

        return storedValue
            ? JSON.parse(storedValue)
            : fallback;
    } catch {
        return fallback;
    }
}

/* Writes a JSON value and notifies mounted planner views. */
export function writeStorage(key, value) {
    if (typeof window === "undefined") {
        return;
    }

    try {
        window.localStorage.setItem(
            key,
            JSON.stringify(value),
        );

        window.dispatchEvent(
            new Event(STORAGE_EVENT),
        );
    } catch {
        /* Keeps the application usable when storage is unavailable. */
    }
}

/* Reads a plain string value from localStorage. */
export function readStorageText(key, fallback = "") {
    if (typeof window === "undefined") {
        return fallback;
    }

    try {
        return window.localStorage.getItem(key) ?? fallback;
    } catch {
        return fallback;
    }
}

/* Writes a plain string value to localStorage. */
export function writeStorageText(key, value) {
    if (typeof window === "undefined") {
        return;
    }

    try {
        window.localStorage.setItem(key, value);

        window.dispatchEvent(
            new Event(STORAGE_EVENT),
        );
    } catch {
        /* Keeps the application usable when storage is unavailable. */
    }
}

/* Removes one value from localStorage. */
export function removeStorage(key) {
    if (typeof window === "undefined") {
        return;
    }

    try {
        window.localStorage.removeItem(key);
    } catch {
        /* Keeps the application usable when storage is unavailable. */
    }
}