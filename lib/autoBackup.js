import { DB_STORES, openDatabase } from "./indexedDb";
import { readBackupFile } from "./backup";
import { STORAGE_KEYS } from "./storage";

const LAST_BACKUP_KEY = "auto-backup:last";
const BACKUP_PREFIX = "auto:";
const KEEP_BACKUPS = 7;

let running = null;

function localDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/* Finds the most recent daily backup time in the device timezone. */
function latestDueSlot(time, now) {
  const [hours, minutes] = time.split(":").map(Number);
  const due = new Date(now);

  due.setHours(hours, minutes, 0, 0);

  if (due > now) {
    due.setDate(due.getDate() - 1);
  }

  return {
    date: localDateKey(due),
    timestamp: due.getTime(),
  };
}

/* Reads application data from one consistent database snapshot. */
async function readSnapshot(database) {
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(DB_STORES.records, "readonly");

    const records = transaction.objectStore(DB_STORES.records);
    const result = {};

    transaction.oncomplete = () => resolve(result);
    transaction.onabort = () =>
      reject(transaction.error || new Error("Reading backup data failed."));

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
}

async function createDueBackup() {
  const database = await openDatabase();
  const snapshot = await readSnapshot(database);

  // Wait until all application records have been initialized.
  const notInitialized = [
    snapshot.planner,
    snapshot.routines,
    snapshot.settings,
    snapshot.dark,
  ].some((value) => value === undefined);

  if (notInitialized) {
    return false;
  }

  const options = snapshot.settings?.backup;

  if (options?.enabled === false) return false;

  const time = options?.time ?? "23:59";

  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) {
    throw new Error("The automatic backup time is invalid.");
  }

  const now = new Date();
  const slot = latestDueSlot(time, now);

  const backup = {
    format: "dapl-backup",
    schemaVersion: 2,
    exportedAt: now.toISOString(),
    data: {
      planner: snapshot.planner,
      routines: snapshot.routines,
      preferences: {
        settings: snapshot.settings,
        dark: snapshot.dark,
      },
    },
  };

  /* Uses the same validation as manual JSON backups. */
  await readBackupFile(
    new File([JSON.stringify(backup)], "automatic-backup.json", {
      type: "application/json",
    }),
  );

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(
      [DB_STORES.backups, DB_STORES.metadata],
      "readwrite",
    );

    const backups = transaction.objectStore(DB_STORES.backups);
    const metadata = transaction.objectStore(DB_STORES.metadata);
    let created = false;

    transaction.oncomplete = () => resolve(created);
    transaction.onabort = () =>
      reject(transaction.error || new Error("Automatic backup failed."));

    const request = metadata.get(LAST_BACKUP_KEY);

    request.onsuccess = () => {
      const previous = request.result;

      /*
       * Starts scheduling on first use. It does not pretend
       * to have backed up days before this feature was enabled.
       */
      if (!previous) {
        metadata.put(
          {
            startedAt: now.getTime(),
            date: null,
          },
          LAST_BACKUP_KEY,
        );
        return;
      }

      if (
        slot.timestamp < previous.startedAt ||
        (previous.date && previous.date >= slot.date)
      ) {
        return;
      }

      const key = `${BACKUP_PREFIX}${slot.date}`;

      backups.put(backup, key);
      metadata.put(
        {
          ...previous,
          date: slot.date,
          exportedAt: backup.exportedAt,
        },
        LAST_BACKUP_KEY,
      );

      created = true;

      /* Keeps seven automatic backups, preserving other entries. */
      let count = 0;

      const cursorRequest = backups.openCursor(
        IDBKeyRange.bound(BACKUP_PREFIX, `${BACKUP_PREFIX}\uffff`),
        "prev",
      );

      cursorRequest.onsuccess = () => {
        const cursor = cursorRequest.result;

        if (!cursor) return;

        count += 1;

        if (count > KEEP_BACKUPS) {
          cursor.delete();
        }

        cursor.continue();
      };
    };
  });
}

/* Avoids overlapping checks within this browser tab. */
export function checkAutomaticBackup() {
  if (!running) {
    running = createDueBackup().finally(() => {
      running = null;
    });
  }

  return running;
}
/* Returns the latest saved automatic backup summary. */
export async function getLatestAutomaticBackup() {
  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(DB_STORES.backups, "readonly");

    let result = null;

    transaction.oncomplete = () => resolve(result);
    transaction.onabort = () =>
      reject(
        transaction.error ||
          new Error("Reading automatic backup status failed."),
      );

    const request = transaction
      .objectStore(DB_STORES.backups)
      .openCursor(
        IDBKeyRange.bound(BACKUP_PREFIX, `${BACKUP_PREFIX}\uffff`),
        "prev",
      );

    request.onsuccess = () => {
      const cursor = request.result;

      if (!cursor) return;

      const backup = cursor.value;

      result = {
        exportedAt: backup.exportedAt,
        tasks: backup.data.planner.tasks.length,
        routines: backup.data.routines.length,
      };
    };
  });
}
/* Loads and validates the latest automatic backup for restoration. */
export async function readLatestAutomaticBackup() {
  const database = await openDatabase();

  const backup = await new Promise((resolve, reject) => {
    const transaction = database.transaction(DB_STORES.backups, "readonly");

    let result = null;

    transaction.oncomplete = () => resolve(result);
    transaction.onabort = () =>
      reject(
        transaction.error || new Error("Reading automatic backup failed."),
      );

    const request = transaction
      .objectStore(DB_STORES.backups)
      .openCursor(
        IDBKeyRange.bound(BACKUP_PREFIX, `${BACKUP_PREFIX}\uffff`),
        "prev",
      );

    request.onsuccess = () => {
      result = request.result?.value ?? null;
    };
  });

  if (!backup) return null;

  const validated = await readBackupFile(
    new File([JSON.stringify(backup)], "automatic-backup.json", {
      type: "application/json",
    }),
  );

  return {
    ...validated,
    exportedAt: backup.exportedAt,
  };
}
