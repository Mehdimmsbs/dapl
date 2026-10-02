import { DB_STORES, openDatabase } from "./indexedDb";
import { defaultSettings } from "../app/data";
import {
    STORAGE_KEYS,
    readStorage,
    readStorageText,
} from "./storage";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

function invalidBackup() {
    return new Error("Invalid or unsupported backup file.");
}

function isObject(value) {
    return value !== null &&
        typeof value === "object" &&
        !Array.isArray(value);
}

function decodeValue(value) {
    return typeof value === "string"
        ? JSON.parse(value)
        : value;
}

function hasIdentity(value) {
    return isObject(value) &&
        (
            typeof value.id === "string" ||
            (
                typeof value.id === "number" &&
                Number.isFinite(value.id)
            )
        ) &&
        typeof value.title === "string";
}

function uniqueIds(items) {
    const ids = items.map((item) => String(item.id));
    return new Set(ids).size === ids.length;
}

/* Reads the original JSON backup without changing stored data. */
export async function readBackupFile(file) {
    if (!file || file.size > MAX_FILE_SIZE) {
        throw invalidBackup();
    }

    const backup = JSON.parse(await file.text());

    if (
        !isObject(backup) ||
        backup.format !== "dapl-backup" ||
        ![1, 2].includes(backup.schemaVersion) ||
        !isObject(backup.data)
    ) {
        throw invalidBackup();
    }

    const planner = decodeValue(backup.data.planner);
    const routines = decodeValue(backup.data.routines);

    if (
        !isObject(planner) ||
        !Array.isArray(planner.tasks) ||
        !Array.isArray(routines)
    ) {
        throw invalidBackup();
    }

    const validTasks = planner.tasks.every((task) =>
        hasIdentity(task) &&
        typeof task.date === "string" &&
        /^\d{4}-\d{2}-\d{2}$/.test(task.date) &&
        ["normal", "important", "essential"].includes(task.priority) &&
        typeof task.completed === "boolean"
    );

    const validRoutines = routines.every((routine) =>
        hasIdentity(routine) &&
        Array.isArray(routine.days) &&
        routine.days.every((day) =>
            [
                "saturday",
                "sunday",
                "monday",
                "tuesday",
                "wednesday",
                "thursday",
                "friday",
            ].includes(day)
        ) &&
        ["day", "time"].includes(routine.scheduleType) &&
        typeof routine.enabled === "boolean"
    );

    if (
        !validTasks ||
        !validRoutines ||
        !uniqueIds(planner.tasks) ||
        !uniqueIds(routines)
    ) {
        throw invalidBackup();
    }

    let preferences = null;

    if (backup.schemaVersion === 2) {
        preferences = decodeValue(backup.data.preferences);

        if (
            !isObject(preferences) ||
            !isObject(preferences.settings) ||
            typeof preferences.dark !== "boolean"
        ) {
            throw invalidBackup();
        }
    }

    return {
        planner,
        routines,
        preferences,
        fileName: file.name,
    };
}

/* Restores missing records together, preserving existing records. */
export async function restoreMissingRecords(backup) {
    const database = await openDatabase();
    const preferences = backup.preferences ?? {
        settings: {
            ...defaultSettings,
            ...readStorage(STORAGE_KEYS.settings, {}),
        },
        dark: readStorageText(STORAGE_KEYS.darkMode) === "1",
    };

    return new Promise((resolve, reject) => {
        const transaction = database.transaction(
            [DB_STORES.records, DB_STORES.metadata],
            "readwrite",
        );

        const records = transaction.objectStore(DB_STORES.records);
        const metadata = transaction.objectStore(DB_STORES.metadata);

        let restored = 0;

        transaction.oncomplete = () => resolve(restored);
        transaction.onabort = () => reject(
            transaction.error ||
            new Error("Backup recovery failed."),
        );

        for (const [key, value] of [
            [STORAGE_KEYS.planner, backup.planner],
            [STORAGE_KEYS.routines, backup.routines],
            [STORAGE_KEYS.settings, preferences.settings],
            [STORAGE_KEYS.darkMode, preferences.dark],
        ]) {
            const request = records.get(key);

            request.onsuccess = () => {
                if (request.result !== undefined) return;

                records.add(value, key);

                metadata.put(
                    {
                        initializedAt: new Date().toISOString(),
                        source: "backup",
                    },
                    `initialized:${key}`,
                );

                restored += 1;
            };
        }
    });
}

/* Exports a consistent snapshot of the current planner and routines. */
export async function downloadBackup() {
    const database = await openDatabase();

    const data = await new Promise((resolve, reject) => {
        const transaction = database.transaction(
            DB_STORES.records,
            "readonly",
        );

        const records = transaction.objectStore(DB_STORES.records);
        const result = {};

        transaction.oncomplete = () => resolve(result);
        transaction.onabort = () => reject(
            transaction.error ||
            new Error("Reading backup data failed."),
        );

        for (const [name, key] of [
            ["planner", STORAGE_KEYS.planner],
            ["routines", STORAGE_KEYS.routines],
            ["settings", STORAGE_KEYS.settings],
            ["dark", STORAGE_KEYS.darkMode],
        ]) {
            const request = records.get(key);

            request.onsuccess = () => {
                result[name] = request.result;
            };
        }
    });

    const exportedAt = new Date().toISOString();
    const fileName =
        `dapl-backup-${exportedAt.replace(/[:.]/g, "-")}.json`;

    data.preferences = {
        settings: data.settings,
        dark: data.dark,
    };

    delete data.settings;
    delete data.dark;

    const file = new File(
        [
            JSON.stringify(
                {
                    format: "dapl-backup",
                    schemaVersion: 2,
                    exportedAt,
                    data,
                },
                null,
                2,
            ),
        ],
        fileName,
        { type: "application/json" },
    );

    await readBackupFile(file);

    const url = URL.createObjectURL(file);
    const link = document.createElement("a");

    try {
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
    } finally {
        link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 10000);
    }

    return {
        tasks: data.planner.tasks.length,
        routines: data.routines.length,
    };
}


/* Restores all supplied records in one database transaction. */
export async function restoreBackup(backup) {
    const hasPreferences = backup.preferences != null;

    const file = new File(
        [
            JSON.stringify({
                format: "dapl-backup",
                schemaVersion: hasPreferences ? 2 : 1,
                data: {
                    planner: backup.planner,
                    routines: backup.routines,
                    ...(hasPreferences && {
                        preferences: backup.preferences,
                    }),
                },
            }),
        ],
        "restore.json",
        { type: "application/json" },
    );

    const validated = await readBackupFile(file);
    const database = await openDatabase();

    const values = [
        [STORAGE_KEYS.planner, validated.planner],
        [STORAGE_KEYS.routines, validated.routines],
    ];

    if (validated.preferences) {
        values.push(
            [STORAGE_KEYS.settings, validated.preferences.settings],
            [STORAGE_KEYS.darkMode, validated.preferences.dark],
        );
    }

    await new Promise((resolve, reject) => {
        const transaction = database.transaction(
            [DB_STORES.records, DB_STORES.metadata],
            "readwrite",
        );

        transaction.oncomplete = () => resolve();

        transaction.onabort = () => reject(
            transaction.error ||
            new Error("Backup restore failed."),
        );

        const records = transaction.objectStore(DB_STORES.records);
        const metadata = transaction.objectStore(DB_STORES.metadata);
        const restoredAt = new Date().toISOString();

        for (const [key, value] of values) {
            records.put(value, key);

            metadata.put(
                {
                    initializedAt: restoredAt,
                    source: "backup",
                },
                `initialized:${key}`,
            );
        }
    });
}