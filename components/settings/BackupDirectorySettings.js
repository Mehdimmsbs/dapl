"use client";

import { useEffect, useRef, useState } from "react";

import {
    chooseBackupDirectory,
    readBackupDirectory,
    supportsBackupDirectory,
} from "../../lib/backupDirectory";
import { useLanguage } from "../providers/LanguageProvider";

/* Configures the external backup folder and its write permission. */
export default function BackupDirectorySettings() {
    const { t } = useLanguage();

    const [supported, setSupported] = useState(false);
    const [fileSaved, setFileSaved] = useState(false);
    const [directory, setDirectory] = useState(null);
    const [permission, setPermission] = useState("");
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");

    const lock = useRef(false);

    useEffect(() => {
        let active = true;

        async function load() {
            const available = supportsBackupDirectory();
            setSupported(available);

            if (!available) {
                setLoading(false);
                return;
            }

            try {
                const handle = await readBackupDirectory();
                const access = handle
                    ? await handle.queryPermission({
                        mode: "readwrite",
                    })
                    : "";

                if (!active) return;

                setDirectory(handle ?? null);
                setPermission(access);
            } catch {
                if (active) {
                    setError("backupDirectoryFailed");
                }
            } finally {
                if (active) setLoading(false);
            }
        }

        void load();

        return () => {
            active = false;
        };
    }, []);

    useEffect(() => {
        function handleExport(event) {
            const status = event.detail?.status;

            setFileSaved(status === "saved");

            if (status === "permission-needed") {
                setPermission("prompt");
                setError("");
            } else if (status === "failed") {
                setError("backupDirectoryFailed");
            } else {
                setError("");
            }
        }

        window.addEventListener(
            "dapl:backup-directory-status",
            handleExport,
        );

        return () => {
            window.removeEventListener(
                "dapl:backup-directory-status",
                handleExport,
            );
        };
    }, []);

    async function chooseDirectory() {
        if (lock.current) return;

        lock.current = true;
        setBusy(true);
        setError("");

        try {
            // Opens the picker before any database awaits.
            const handle = await chooseBackupDirectory();

            setDirectory(handle);
            setPermission(
                await handle.queryPermission({
                    mode: "readwrite",
                }),
            );

            setFileSaved(false);

            window.dispatchEvent(
                new Event("dapl:backup-directory-changed"),
            );
        } catch (error) {
            // Closing the picker is a cancellation, not an error.
            if (error.name !== "AbortError") {
                setError("backupDirectoryFailed");
            }
        } finally {
            lock.current = false;
            setBusy(false);
        }
    }

    async function grantPermission() {
        if (lock.current || !directory) return;

        lock.current = true;
        setBusy(true);
        setError("");

        try {
            const access = await directory.requestPermission({
                mode: "readwrite",
            });

            setPermission(access);
            setFileSaved(false);

            if (access === "granted") {
                window.dispatchEvent(
                    new Event("dapl:backup-directory-changed"),
                );
            }
        } catch {
            setError("backupDirectoryFailed");
        } finally {
            lock.current = false;
            setBusy(false);
        }
    }

    return (
        <section
            className="card backupSettings"
            aria-labelledby="backup-directory-title"
            aria-busy={loading || busy}
        >
            <div>
                <h2 id="backup-directory-title">
                    {t("backupDirectoryTitle")}
                </h2>

                <p>{t("backupDirectoryDescription")}</p>
            </div>

            {!loading && (
                supported ? (
                    <>
                        <div
                            className="backupSettingsPreview"
                            role="status"
                        >
                            <strong>
                                {directory
                                    ? directory.name
                                    : t("backupDirectoryNotSelected")}
                            </strong>

                            {directory && (
                                <p>
                                    {t(
                                        permission !== "granted"
                                            ? "backupDirectoryPermissionNeeded"
                                            : fileSaved
                                                ? "backupDirectoryFileSaved"
                                                : "backupDirectoryReady"
                                    )}
                                </p>
                            )}
                        </div>

                        <div className="backupSettingsActions">
                            <button
                                type="button"
                                className="ghost"
                                disabled={busy}
                                onClick={chooseDirectory}
                            >
                                {t("backupDirectoryChoose")}
                            </button>

                            {directory &&
                                permission !== "granted" && (
                                    <button
                                        type="button"
                                        className="primary"
                                        disabled={busy}
                                        onClick={grantPermission}
                                    >
                                        {t("backupDirectoryGrant")}
                                    </button>
                                )}
                        </div>
                    </>
                ) : (
                    <p>{t("backupDirectoryUnsupported")}</p>
                )
            )}

            {error && (
                <p className="backupSettingsError" role="alert">
                    {t(error)}
                </p>
            )}
        </section>
    );
}