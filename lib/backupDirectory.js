import {
    DB_STORES,
    openDatabase,
    readDatabaseValue,
    writeDatabaseValue,
} from "./indexedDb";

import { readBackupFile } from "./backup";

const DIRECTORY_KEY = "auto-backup:directory";

/* Checks whether the browser supports choosing a backup folder. */
export function supportsBackupDirectory() {
    return typeof window !== "undefined" &&
        window.isSecureContext &&
        typeof window.showDirectoryPicker === "function";
}

/* Reads the saved directory handle without requesting permission. */
export function readBackupDirectory() {
    return readDatabaseValue(
        DIRECTORY_KEY,
        DB_STORES.metadata,
    );
}

/* Must be called directly from a user click. */
export async function chooseBackupDirectory() {
    const handle = await window.showDirectoryPicker({
        id: "dapl-backups",
        mode: "readwrite",
    });

    await writeDatabaseValue(
        DIRECTORY_KEY,
        handle,
        DB_STORES.metadata,
    );

    return handle;
}
const EXPORTED_KEY = "auto-backup:directory-export";
let exportPromise = null;

/* Reads the latest internal automatic backup. */
async function readLatestBackup() {
    const database = await openDatabase();

    return new Promise((resolve, reject) => {
        const transaction = database.transaction(
            DB_STORES.backups,
            "readonly",
        );

        let backup = null;

        transaction.oncomplete = () => resolve(backup);
        transaction.onabort = () => reject(
            transaction.error ||
            new Error("Reading automatic backup failed."),
        );

        const request = transaction
            .objectStore(DB_STORES.backups)
            .openCursor(
                IDBKeyRange.bound("auto:", "auto:\uffff"),
                "prev",
            );

        request.onsuccess = () => {
            backup = request.result?.value ?? null;
        };
    });
}

/* Writes a backup only when directory permission is already granted. */
async function exportLatestBackup() {
    const directory = await readBackupDirectory();

    if (!directory) return "not-configured";

    const permission = await directory.queryPermission({
        mode: "readwrite",
    });

    if (permission !== "granted") {
        return "permission-needed";
    }

    const backup = await readLatestBackup();

    if (!backup) return "no-backup";

    const previous = await readDatabaseValue(
        EXPORTED_KEY,
        DB_STORES.metadata,
    );

    if (
        previous?.exportedAt === backup.exportedAt &&
        previous.directory &&
        await directory.isSameEntry(previous.directory)
    ) {
        return "saved";
    }

    const timestamp = backup.exportedAt.replace(/[:.]/g, "-");
    const fileName = `auto-${timestamp}.json`;
    const content = JSON.stringify(backup, null, 2);

    // Validate before creating or modifying a file.
    await readBackupFile(new File(
        [content],
        fileName,
        { type: "application/json" },
    ));

    const fileHandle = await directory.getFileHandle(
        fileName,
        { create: true },
    );

    const writable = await fileHandle.createWritable();

    try {
        await writable.write(content);
        await writable.close();
    } catch (error) {
        await writable.abort().catch(() => { });
        throw error;
    }

    // Record success only after the file has been closed successfully.
    await writeDatabaseValue(
        EXPORTED_KEY,
        {
            directory,
            exportedAt: backup.exportedAt,
            fileName,
            savedAt: new Date().toISOString(),
        },
        DB_STORES.metadata,
    );

    return "saved";
}

/* Serializes folder exports within and between supporting browser tabs. */
export function syncBackupDirectory() {
    if (!exportPromise) {
        exportPromise = (
            typeof navigator.locks?.request === "function"
                ? navigator.locks.request(
                    "dapl-backup-directory",
                    exportLatestBackup,
                )
                : exportLatestBackup()
        ).finally(() => {
            exportPromise = null;
        });
    }

    return exportPromise;
}