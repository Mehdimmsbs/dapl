import { STORAGE_KEYS } from "./storage";

const DATABASE_NAME = "dapl";
const DATABASE_VERSION = 1;

export const DB_STORES = {
    records: "records",
    metadata: "metadata",
    backups: "backups",
};

let databasePromise = null;

/* Opens the database and creates its stores on the first run. */
export function openDatabase() {
    if (typeof window === "undefined" || !window.indexedDB) {
        return Promise.reject(
            new Error("IndexedDB is unavailable in this environment."),
        );
    }

    if (databasePromise) return databasePromise;

    databasePromise = new Promise((resolve, reject) => {
        const request = window.indexedDB.open(
            DATABASE_NAME,
            DATABASE_VERSION,
        );

        request.onupgradeneeded = () => {
            const database = request.result;

            for (const storeName of Object.values(DB_STORES)) {
                if (!database.objectStoreNames.contains(storeName)) {
                    database.createObjectStore(storeName);
                }
            }
        };

        request.onsuccess = () => {
            const database = request.result;

            database.onversionchange = () => {
                database.close();
                databasePromise = null;
            };

            database.onclose = () => {
                databasePromise = null;
            };

            resolve(database);
        };

        request.onerror = () => {
            reject(request.error);
        };

        request.onblocked = () => {
            reject(
                new Error("Database upgrade is blocked by another open tab."),
            );
        };
    }).catch((error) => {
        databasePromise = null;
        throw error;
    });

    return databasePromise;
}

/* Resolves only after the entire transaction has completed. */
async function runRequest(storeName, mode, operation) {
    const database = await openDatabase();

    return new Promise((resolve, reject) => {
        const transaction = database.transaction(storeName, mode);
        const store = transaction.objectStore(storeName);
        let result;
        let request;

        transaction.oncomplete = () => resolve(result);

        transaction.onabort = () => {
            reject(
                transaction.error ||
                new Error("The database transaction was aborted."),
            );
        };

        try {
            request = operation(store);

            request.onsuccess = () => {
                result = request.result;
            };
        } catch (error) {
            transaction.abort();
            reject(error);
        }
    });
}

/* Returns undefined when the requested record does not exist. */
export function readDatabaseValue(
    key,
    storeName = DB_STORES.records,
) {
    return runRequest(
        storeName,
        "readonly",
        (store) => store.get(key),
    );
}

/* Creates or replaces one record. */
export function writeDatabaseValue(
    key,
    value,
    storeName = DB_STORES.records,
) {
    return runRequest(
        storeName,
        "readwrite",
        (store) => store.put(value, key),
    );
}
/* Validates the initial shape of each supported record. */
function isValidStoredValue(key, value) {
    const isObject =
        value !== null &&
        typeof value === "object" &&
        !Array.isArray(value);

    switch (key) {
        case STORAGE_KEYS.planner:
            return isObject && Array.isArray(value.tasks);

        case STORAGE_KEYS.routines:
            return Array.isArray(value);

        case STORAGE_KEYS.settings:
            return isObject;

        case STORAGE_KEYS.darkMode:
            return typeof value === "boolean";

        default:
            return false;
    }
}

/* Converts legacy localStorage values to database values. */
function decodeLegacyValue(key, rawValue) {
    if (key === STORAGE_KEYS.darkMode) {
        if (rawValue === "1" || rawValue === "true") {
            return true;
        }

        if (rawValue === "0" || rawValue === "false") {
            return false;
        }

        throw new Error("The stored appearance preference is invalid.");
    }

    return JSON.parse(rawValue);
}
/* Initializes each record once without removing legacy data. */
export async function initializeDatabaseValue(key, initialValue) {
    const database = await openDatabase();

    return new Promise((resolve, reject) => {
        const transaction = database.transaction(
            [DB_STORES.records, DB_STORES.metadata],
            "readwrite",
        );

        const records = transaction.objectStore(DB_STORES.records);
        const metadata = transaction.objectStore(DB_STORES.metadata);
        const markerKey = `initialized:${key}`;

        let value;
        let failure;

        transaction.oncomplete = () => resolve(value);

        transaction.onabort = () => {
            reject(
                failure ||
                transaction.error ||
                new Error("Database initialization failed."),
            );
        };

        function abortWith(error) {
            failure = error;
            transaction.abort();
        }

        const request = records.get(key);

        request.onsuccess = () => {
            if (request.result !== undefined) {
                if (!isValidStoredValue(key, request.result)) {
                    abortWith(
                        new Error("The stored database record is invalid."),
                    );
                    return;
                }

                value = request.result;
                return;
            }

            const markerRequest = metadata.get(markerKey);

            markerRequest.onsuccess = () => {
                try {
                    if (markerRequest.result !== undefined) {
                        throw Object.assign(
                            new Error(
                                "A previously initialized database record is missing.",
                            ),
                            { code: "DATABASE_RECORD_MISSING" },
                        );
                    }

                    const legacyValue = window.localStorage.getItem(key);

                    value = legacyValue === null
                        ? structuredClone(initialValue)
                        : decodeLegacyValue(key, legacyValue);

                    if (!isValidStoredValue(key, value)) {
                        throw new Error(
                            "The stored application data is invalid.",
                        );
                    }

                    records.put(value, key);

                    metadata.put(
                        {
                            initializedAt: new Date().toISOString(),
                            source: legacyValue === null
                                ? "new"
                                : "localStorage",
                        },
                        markerKey,
                    );
                } catch (error) {
                    abortWith(error);
                }
            };
        };
    });
}

/* Reads and updates a record within the same transaction. */
export async function updateDatabaseValue(key, updater) {
    const database = await openDatabase();

    return new Promise((resolve, reject) => {
        const transaction = database.transaction(
            DB_STORES.records,
            "readwrite",
        );

        const store = transaction.objectStore(DB_STORES.records);

        let value;
        let failure;

        transaction.oncomplete = () => resolve(value);
        transaction.onabort = () => {
            reject(
                failure ||
                transaction.error ||
                new Error("Saving planner data failed."),
            );
        };

        const request = store.get(key);

        request.onsuccess = () => {
            try {
                if (request.result === undefined) {
                    throw Object.assign(
                        new Error("The planner record is missing."),
                        { code: "DATABASE_RECORD_MISSING" },
                    );
                }

                value =
                    typeof updater === "function"
                        ? updater(request.result)
                        : updater;

                store.put(value, key);
            } catch (error) {
                failure = error;
                transaction.abort();
            }
        };
    });
}