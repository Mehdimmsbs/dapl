"use client";

import { useEffect } from "react";

import { checkAutomaticBackup } from "../../lib/autoBackup";
import { syncBackupDirectory } from "../../lib/backupDirectory";
import { useLanguage } from "./LanguageProvider";

/* Creates internal backups and exports them to the selected folder. */
export default function AutoBackupRunner() {
    const { settings } = useLanguage();

    const enabled = settings.backup?.enabled ?? true;
    const time = settings.backup?.time ?? "23:59";

    useEffect(() => {
        if (!enabled) return;

        let active = true;
        let checking = false;

        function notify(name, status) {
            if (!active) return;

            window.dispatchEvent(new CustomEvent(name, {
                detail: { status },
            }));
        }

        async function check() {
            if (checking || !active) return;
            checking = true;

            try {
                const created = await checkAutomaticBackup();

                notify(
                    "dapl:auto-backup-status",
                    created ? "created" : "checked",
                );

                if (!active) return;

                // External failure does not invalidate the internal backup.
                try {
                    const status = await syncBackupDirectory();
                    notify("dapl:backup-directory-status", status);
                } catch (error) {
                    console.error("Backup folder export failed:", error);
                    notify(
                        "dapl:backup-directory-status",
                        "failed",
                    );
                }
            } catch (error) {
                console.error("Automatic backup failed:", error);
                notify("dapl:auto-backup-status", "failed");
            } finally {
                checking = false;
            }
        }

        function handleVisibility() {
            if (document.visibilityState === "visible") {
                void check();
            }
        }

        void check();

        const timer = window.setInterval(check, 60_000);

        window.addEventListener("focus", check);
        window.addEventListener(
            "dapl:backup-directory-changed",
            check,
        );
        document.addEventListener(
            "visibilitychange",
            handleVisibility,
        );

        return () => {
            active = false;
            window.clearInterval(timer);

            window.removeEventListener("focus", check);
            window.removeEventListener(
                "dapl:backup-directory-changed",
                check,
            );
            document.removeEventListener(
                "visibilitychange",
                handleVisibility,
            );
        };
    }, [enabled, time]);

    return null;
}