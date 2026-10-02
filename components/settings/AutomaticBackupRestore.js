"use client";

import { useRef, useState } from "react";

import { readLatestAutomaticBackup } from "../../lib/autoBackup";
import { restoreBackup } from "../../lib/backup";
import { useLanguage } from "../providers/LanguageProvider";

/* Previews an internal backup before replacing current data. */
export default function AutomaticBackupRestore() {
    const { locale, t } = useLanguage();

    const [backup, setBackup] = useState(null);
    const [confirmed, setConfirmed] = useState(false);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const lock = useRef(false);

    async function previewBackup() {
        if (lock.current) return;

        lock.current = true;
        setBusy(true);
        setError("");
        setBackup(null);
        setConfirmed(false);

        try {
            const result = await readLatestAutomaticBackup();

            if (result) {
                setBackup(result);
            } else {
                setError("autoBackupNoneYet");
            }
        } catch {
            setError("autoBackupStatusFailed");
        } finally {
            lock.current = false;
            setBusy(false);
        }
    }

    async function restore() {
        if (lock.current || !backup || !confirmed) return;

        lock.current = true;
        setBusy(true);
        setError("");

        try {
            // Restores the exact backup shown in the preview.
            await restoreBackup(backup);
            window.location.reload();
        } catch {
            setError("backupRestoreFailed");
            lock.current = false;
            setBusy(false);
        }
    }

    return (
        <div className="backupSettingsRestore" aria-busy={busy}>
            {!backup ? (
                <div className="backupSettingsActions">
                    <button
                        type="button"
                        className="ghost"
                        disabled={busy}
                        onClick={previewBackup}
                    >
                        {t("autoBackupRestoreLatest")}
                    </button>
                </div>
            ) : (
                <div className="backupSettingsPreview">
                    <strong>{t("autoBackupLatestTitle")}</strong>

                    <time dateTime={backup.exportedAt}>
                        {new Intl.DateTimeFormat(locale, {
                            dateStyle: "medium",
                            timeStyle: "short",
                        }).format(new Date(backup.exportedAt))}
                    </time>

                    <p>
                        {t("autoBackupLatestSummary", {
                            tasks: backup.planner.tasks.length,
                            routines: backup.routines.length,
                        })}
                    </p>

                    <label className="backupSettingsConfirm">
                        <input
                            type="checkbox"
                            name="confirmAutomaticBackupRestore"
                            checked={confirmed}
                            disabled={busy}
                            onChange={(event) => {
                                setConfirmed(event.target.checked);
                            }}
                        />

                        <span>{t("autoBackupRestoreConfirm")}</span>
                    </label>

                    <div className="backupSettingsActions">
                        <button
                            type="button"
                            className="primary"
                            disabled={busy || !confirmed}
                            onClick={restore}
                        >
                            {t("autoBackupRestoreAction")}
                        </button>

                        <button
                            type="button"
                            className="ghost"
                            disabled={busy}
                            onClick={() => {
                                setBackup(null);
                                setConfirmed(false);
                                setError("");
                            }}
                        >
                            {t("autoBackupRestoreCancel")}
                        </button>
                    </div>
                </div>
            )}

            {error && (
                <p className="backupSettingsError" role="alert">
                    {t(error)}
                </p>
            )}
        </div>
    );
}