"use client";

import { useEffect, useRef, useState } from "react";

import { getLatestAutomaticBackup } from "../../lib/autoBackup";
import AutomaticBackupRestore from "./AutomaticBackupRestore";
import SelectField from "../ui/SelectField";
import { useLanguage } from "../providers/LanguageProvider";

/* Configures daily backups and displays the latest saved copy. */
export default function AutoBackupSettings() {
    const {
        locale,
        settings,
        updateSettings,
        t,
    } = useLanguage();

    const savedEnabled = settings.backup?.enabled ?? true;
    const savedTime = settings.backup?.time ?? "23:59";

    const [enabled, setEnabled] = useState(savedEnabled);
    const [time, setTime] = useState(savedTime);
    const [busy, setBusy] = useState(false);
    const [status, setStatus] = useState(null);
    const [latest, setLatest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [backupError, setBackupError] = useState("");

    const lock = useRef(false);

    useEffect(() => {
        setEnabled(savedEnabled);
        setTime(savedTime);
    }, [savedEnabled, savedTime]);

    useEffect(() => {
        let active = true;
        let revision = 0;

        async function refresh() {
            const currentRevision = ++revision;

            try {
                const result = await getLatestAutomaticBackup();

                if (!active || currentRevision !== revision) return;

                setLatest(result);
                setBackupError((current) =>
                    current === "autoBackupStatusFailed"
                        ? ""
                        : current,
                );
            } catch {
                if (!active || currentRevision !== revision) return;

                setBackupError("autoBackupStatusFailed");
            } finally {
                if (active && currentRevision === revision) {
                    setLoading(false);
                }
            }
        }

        function handleBackupStatus(event) {
            if (event.detail?.status === "failed") {
                setBackupError("autoBackupRunFailed");
                return;
            }

            setBackupError("");
            void refresh();
        }

        function handleVisibility() {
            if (document.visibilityState === "visible") {
                void refresh();
            }
        }

        window.addEventListener(
            "dapl:auto-backup-status",
            handleBackupStatus,
        );

        window.addEventListener("focus", refresh);
        document.addEventListener(
            "visibilitychange",
            handleVisibility,
        );

        // Also picks up backups created by another browser tab.
        const interval = window.setInterval(refresh, 60_000);

        void refresh();

        return () => {
            active = false;
            window.clearInterval(interval);

            window.removeEventListener(
                "dapl:auto-backup-status",
                handleBackupStatus,
            );

            window.removeEventListener("focus", refresh);
            document.removeEventListener(
                "visibilitychange",
                handleVisibility,
            );
        };
    }, []);

    async function saveSchedule(event) {
        event.preventDefault();

        if (lock.current) return;

        if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) {
            setStatus("autoBackupInvalidTime");
            return;
        }

        lock.current = true;
        setBusy(true);
        setStatus(null);

        try {
            await updateSettings((current) => ({
                ...current,
                backup: {
                    ...current.backup,
                    enabled,
                    time,
                },
            }));

            setStatus("autoBackupScheduleSaved");
        } catch {
            setStatus("autoBackupSaveFailed");
        } finally {
            lock.current = false;
            setBusy(false);
        }
    }

    const latestDate = latest
        ? new Intl.DateTimeFormat(locale, {
            dateStyle: "medium",
            timeStyle: "short",
        }).format(new Date(latest.exportedAt))
        : "";

    return (
        <section
            className="card backupSettings"
            aria-labelledby="auto-backup-title"
        >
            <div>
                <h2 id="auto-backup-title">
                    {t("autoBackupTitle")}
                </h2>

                <p>{t("autoBackupDescription")}</p>
            </div>

            <form
                className="form"
                onSubmit={saveSchedule}
                aria-busy={busy}
            >
                <label className="switchRow">
                    <span>{t("autoBackupEnabled")}</span>

                    <input
                        type="checkbox"
                        name="autoBackupEnabled"
                        checked={enabled}
                        disabled={busy}
                        onChange={(event) => {
                            setEnabled(event.target.checked);
                            setStatus(null);
                        }}
                    />
                </label>

                <div className="settingsTime">
                    <span id="auto-backup-time-label">
                        {t("autoBackupTime")}
                    </span>

                    <div
                        className="settingsTimeFields"
                        role="group"
                        aria-labelledby="auto-backup-time-label"
                    >
                        <SelectField
                            label={t("hour")}
                            name="autoBackupHour"
                            value={time.split(":")[0]}
                            disabled={busy}
                            onChange={(event) => {
                                setTime((current) =>
                                    `${event.target.value}:${current.split(":")[1]}`,
                                );
                                setStatus(null);
                            }}
                        >
                            {Array.from({ length: 24 }, (_, index) => {
                                const value = String(index).padStart(2, "0");

                                return (
                                    <option key={value} value={value}>
                                        {value}
                                    </option>
                                );
                            })}
                        </SelectField>

                        <b aria-hidden="true">:</b>

                        <SelectField
                            label={t("minute")}
                            name="autoBackupMinute"
                            value={time.split(":")[1]}
                            disabled={busy}
                            onChange={(event) => {
                                setTime((current) =>
                                    `${current.split(":")[0]}:${event.target.value}`,
                                );
                                setStatus(null);
                            }}
                        >
                            {Array.from({ length: 60 }, (_, index) => {
                                const value = String(index).padStart(2, "0");

                                return (
                                    <option key={value} value={value}>
                                        {value}
                                    </option>
                                );
                            })}
                        </SelectField>
                    </div>
                </div>

                <div className="backupSettingsActions">
                    <button
                        type="submit"
                        className="primary"
                        disabled={busy}
                    >
                        {t("save")}
                    </button>
                </div>

                <div role="status" aria-live="polite">
                    {status && <p>{t(status)}</p>}
                </div>
            </form>

            <div
                className="backupSettingsPreview"
                role="status"
                aria-live="polite"
                aria-busy={loading}
            >
                <strong>{t("autoBackupLatestTitle")}</strong>

                {loading ? (
                    <p>{t("autoBackupStatusLoading")}</p>
                ) : latest ? (
                    <>
                        <p>{t("autoBackupLastSaved")}</p>

                        <time dateTime={latest.exportedAt}>
                            {latestDate}
                        </time>

                        <p>
                            {t("autoBackupLatestSummary", {
                                tasks: latest.tasks,
                                routines: latest.routines,
                            })}
                        </p>
                    </>
                ) : (
                    <p>{t("autoBackupNoneYet")}</p>
                )}
            </div>

            {backupError && (
                <p
                    className="backupSettingsError"
                    role="alert"
                >
                    {t(backupError)}
                </p>
            )}

            <AutomaticBackupRestore />
        </section>
    );
}