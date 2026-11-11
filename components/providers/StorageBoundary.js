"use client";

import { Component, useRef, useState } from "react";

import {
    readBackupFile,
    restoreMissingRecords,
} from "../../lib/backup";
import {
    LanguageProvider,
    useLanguage
} from "./LanguageProvider";

function RecoveryNotice() {
    const { t } = useLanguage();
    const inputRef = useRef(null);

    const [backup, setBackup] = useState(null);
    const [busy, setBusy] = useState(false);
    const [errorKey, setErrorKey] = useState("");

    async function chooseFile(event) {
        const file = event.target.files?.[0];
        event.target.value = "";

        if (!file) return;

        setBackup(null);
        setErrorKey("");
        setBusy(true);

        try {
            setBackup(await readBackupFile(file));
        } catch {
            setErrorKey("backupInvalidFile");
        } finally {
            setBusy(false);
        }
    }

    async function restore() {
        if (!backup || busy) return;

        setErrorKey("");
        setBusy(true);

        try {
            await restoreMissingRecords(backup);
            window.location.reload();
        } catch {
            setErrorKey("backupRestoreFailed");
            setBusy(false);
        }
    }

    return (
        <main className="storageRecovery">
            <section
                className="card storageRecoveryCard"
                aria-labelledby="storage-recovery-title"
                aria-busy={busy}
            >
                <h1 id="storage-recovery-title">
                    {t("storageRecoveryTitle")}
                </h1>

                <p>{t("storageRecoveryDescription")}</p>

                <input
                    ref={inputRef}
                    type="file"
                    accept=".json,application/json"
                    hidden
                    onChange={chooseFile}
                />

                {backup && (
                    <div className="storageRecoveryPreview">
                        <strong>{backup.fileName}</strong>

                        <p>
                            {t("backupRecoverySummary", {
                                tasks: backup.planner.tasks.length,
                                routines: backup.routines.length,
                            })}
                        </p>

                        <small>{t("backupRecoveryNotice")}</small>
                    </div>
                )}

                {errorKey && (
                    <p
                        className="storageRecoveryError"
                        role="alert"
                    >
                        {t(errorKey)}
                    </p>
                )}

                <div className="storageRecoveryActions">
                    <button
                        type="button"
                        className="ghost"
                        disabled={busy}
                        onClick={() => inputRef.current?.click()}
                    >
                        {t("backupChooseFile")}
                    </button>

                    {backup && (
                        <button
                            type="button"
                            className="primary"
                            disabled={busy}
                            onClick={restore}
                        >
                            {t("backupRestoreMissing")}
                        </button>
                    )}

                    <button
                        type="button"
                        className="ghost"
                        disabled={busy}
                        onClick={() => window.location.reload()}
                    >
                        {t("storageRecoveryRetry")}
                    </button>
                </div>
            </section>
        </main>
    );
}

/* Handles missing records while leaving other errors visible. */
export default class StorageBoundary extends Component {
    state = { error: null };

    static getDerivedStateFromError(error) {
        return { error };
    }

    render() {
        const { error } = this.state;

        if (error?.code === "DATABASE_RECORD_MISSING") {
            return (
                <LanguageProvider recoveryMode>
                    <RecoveryNotice />
                </LanguageProvider>
            );
        }

        if (error) throw error;

        return this.props.children;
    }
}