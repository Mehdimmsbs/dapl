import {
    DB_STORES,
    readDatabaseValue,
    writeDatabaseValue,
} from "./indexedDb";

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