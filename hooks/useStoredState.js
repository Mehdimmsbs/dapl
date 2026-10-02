"use client";

import {
    useCallback,
    useEffect,
    useMemo,
    useSyncExternalStore,
} from "react";

import {
    getStoredEntry,
    loadStoredEntry,
    subscribeStoredEntry,
    updateStoredValue,
} from "../lib/plannerStorage";

/* Connects planner views to their shared IndexedDB record. */
export default function useStoredState(key, initialValue) {
    const entry = useMemo(
        () => getStoredEntry(key, initialValue),
        [key, initialValue],
    );

    const subscribe = useCallback(
        (listener) => subscribeStoredEntry(entry, listener),
        [entry],
    );

    const getSnapshot = useCallback(
        () => entry.snapshot,
        [entry],
    );

    const snapshot = useSyncExternalStore(
        subscribe,
        getSnapshot,
        getSnapshot,
    );

    useEffect(() => {
        loadStoredEntry(key, initialValue).catch(() => {
            /* The shared snapshot exposes the error to the view. */
        });
    }, [key, initialValue]);

    const setValue = useCallback(
        (updater) => {
            const operation = updateStoredValue(
                key,
                initialValue,
                updater,
            );

            operation.catch(() => {
                /* The shared snapshot exposes failed writes. */
            });

            return operation;
        },
        [key, initialValue],
    );

    if (snapshot.error) {
        throw snapshot.error;
    }

    return [snapshot.value, setValue, snapshot.hydrated];
}