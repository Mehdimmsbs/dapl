"use client";

import { useRef, useState } from "react";

import {
    downloadBackup,
    readBackupFile,
    restoreBackup,
} from "../../lib/backup";

import { useLanguage } from "../providers/LanguageProvider";

export default function BackupSettings() {
    const { t } = useLanguage();
    const fileInput = useRef(null);
    const operationLock = useRef(false);

    const [operation, setOperation] = useState(null);
    const [summary, setSummary] = useState(null);
    const [backup, setBackup] = useState(null);
    const [confirmed, setConfirmed] = useState(false);
    const [errorKey, setErrorKey] = useState(null);

    const busy = operation !== null;

    function startOperation(name) {
        if (operationLock.current) return false;

        operationLock.current = true;
        setOperation(name);
        setErrorKey(null);
        setSummary(null);

        return true;
    }

    function finishOperation() {
        operationLock.current = false;
        setOperation(null);
    }

    async function handleDownload() {
        if (!startOperation("download")) return;

        try {
            setSummary(await downloadBackup());
        } catch {
            setErrorKey("backupDownloadFailed");
        } finally {
            finishOperation();
        }
    }

    async function handleFileChange(event) {
        const file = event.target.files?.[0];
        event.target.value = "";

        if (!file || !startOperation("read")) return;

        setBackup(null);
        setConfirmed(false);

        try {
            setBackup(await readBackupFile(file));
        } catch {
            setErrorKey("backupInvalidFile");
        } finally {
            finishOperation();
        }
    }

    async function handleRestore() {
        if (
            !backup ||
            !confirmed ||
            !startOperation("restore")
        ) {
            return;
        }

        try {
            await restoreBackup(backup);
        } catch {
            setErrorKey("backupRestoreFailed");
            finishOperation();
            return;
        }

        window.location.reload();
    }

    function cancelRestore() {
        setBackup(null);
        setConfirmed(false);
        setErrorKey(null);
    }

    return (
        <section
            className="card backupSettings"
            aria-labelledby="backup-settings-title"
            aria-busy={busy}
        >
            <div>
                <h2 id="backup-settings-title">
                    {t("backupSettingsTitle")}
                </h2>

                <p>{t("backupSettingsDescription")}</p>
            </div>

            <input
                ref={fileInput}
                type="file"
                accept=".json,application/json"
                hidden
                disabled={busy}
                onChange={handleFileChange}
            />

            <div className="backupSettingsActions">
                <button
                    type="button"
                    className="primary"
                    disabled={busy}
                    onClick={handleDownload}
                >
                    {t(
                        operation === "download"
                            ? "backupPreparing"
                            : "backupDownload",
                    )}
                </button>

                <button
                    type="button"
                    className="ghost"
                    disabled={busy}
                    onClick={() => fileInput.current?.click()}
                >
                    {t("backupChooseFile")}
                </button>
            </div>

            {backup && (
                <div className="backupSettingsPreview">
                    <strong>{backup.fileName}</strong>

                    <p>
                        {t("backupRecoverySummary", {
                            tasks: backup.planner.tasks.length,
                            routines: backup.routines.length,
                        })}
                    </p>

                    <p>{t("backupReplaceWarning")}</p>

                    <label className="backupSettingsConfirm">
                        <input
                            type="checkbox"
                            checked={confirmed}
                            disabled={busy}
                            onChange={(event) => {
                                setConfirmed(event.target.checked);
                            }}
                        />

                        <span>{t("backupReplaceConfirm")}</span>
                    </label>

                    <div className="backupSettingsActions">
                        <button
                            type="button"
                            className="primary"
                            disabled={busy || !confirmed}
                            onClick={handleRestore}
                        >
                            {t(
                                operation === "restore"
                                    ? "backupRestoring"
                                    : "backupRestore",
                            )}
                        </button>

                        <button
                            type="button"
                            className="ghost"
                            disabled={busy}
                            onClick={cancelRestore}
                        >
                            {t("backupRestoreCancel")}
                        </button>
                    </div>
                </div>
            )}

            <div role="status" aria-live="polite">
                {summary && (
                    <p>{t("backupDownloadStarted", summary)}</p>
                )}
            </div>

            {errorKey && (
                <p className="backupSettingsError" role="alert">
                    {t(errorKey)}
                </p>
            )}
        </section>
    );
}