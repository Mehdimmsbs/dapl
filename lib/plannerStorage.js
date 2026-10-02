import {
    initializeDatabaseValue,
    readDatabaseValue,
    updateDatabaseValue,
} from "./indexedDb";

const entries = new Map();
let channel = null;

function publish(entry, changes) {
    entry.revision += 1;
    entry.snapshot = { ...entry.snapshot, ...changes };
    entry.listeners.forEach((listener) => listener());
}

function connectChannel() {
    if (
        channel ||
        typeof window === "undefined" ||
        !("BroadcastChannel" in window)
    ) {
        return;
    }

    channel = new BroadcastChannel("dapl-planner-data");

    channel.onmessage = async ({ data }) => {
        const entry = entries.get(data?.key);

        if (!entry?.snapshot.hydrated) return;

        const revision = entry.revision;

        try {
            const value = await readDatabaseValue(data.key);

            if (revision !== entry.revision) return;

            if (value === undefined) {
                throw Object.assign(
                    new Error("The planner record is missing."),
                    { code: "DATABASE_RECORD_MISSING" },
                );
            }

            publish(entry, { value, error: null });
        } catch (error) {
            if (revision === entry.revision) {
                publish(entry, { error });
            }
        }
    };
}

/* Shares one snapshot between all mounted views of the same record. */
export function getStoredEntry(key, initialValue) {
    if (!entries.has(key)) {
        entries.set(key, {
            snapshot: {
                value: initialValue,
                hydrated: false,
                error: null,
            },
            listeners: new Set(),
            loadPromise: null,
            queue: Promise.resolve(),
            revision: 0,
        });
    }

    return entries.get(key);
}

export function subscribeStoredEntry(entry, listener) {
    entry.listeners.add(listener);
    return () => entry.listeners.delete(listener);
}

export function loadStoredEntry(key, initialValue) {
    const entry = getStoredEntry(key, initialValue);

    if (!entry.loadPromise) {
        connectChannel();

        entry.loadPromise = initializeDatabaseValue(key, initialValue)
            .then((value) => {
                publish(entry, {
                    value,
                    hydrated: true,
                    error: null,
                });
            })
            .catch((error) => {
                publish(entry, { error });
                throw error;
            });
    }

    return entry.loadPromise;
}

/* Serializes writes and publishes only successfully saved values. */
export function updateStoredValue(key, initialValue, updater) {
    const entry = getStoredEntry(key, initialValue);

    const operation = entry.queue
        .catch(() => { })
        .then(() => loadStoredEntry(key, initialValue))
        .then(() => updateDatabaseValue(key, updater))
        .then((value) => {
            publish(entry, { value, error: null });
            channel?.postMessage({ key });
            return value;
        })
        .catch((error) => {
            publish(entry, { error });
            throw error;
        });

    entry.queue = operation;

    return operation;
}