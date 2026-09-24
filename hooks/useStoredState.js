"use client";

import { useEffect, useState } from "react";

import {
    readStorage,
    writeStorage,
} from "../lib/storage";

/* Keeps React state synchronized with one localStorage entry. */
export default function useStoredState(
    key,
    initialValue,
) {
    const [value, setValue] = useState(initialValue);
    const [hydrated, setHydrated] = useState(false);

    /* Loads the stored value after browser hydration. */
    useEffect(() => {
        setValue(
            readStorage(key, initialValue),
        );

        setHydrated(true);
    }, [key, initialValue]);

    /* Saves changes only after the first browser load. */
    useEffect(() => {
        if (!hydrated) {
            return;
        }

        writeStorage(key, value);
    }, [key, value, hydrated]);

    return [
        value,
        setValue,
        hydrated,
    ];
}