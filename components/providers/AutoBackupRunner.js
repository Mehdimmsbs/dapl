"use client";

import { useEffect } from "react";

import { checkAutomaticBackup } from "../../lib/autoBackup";
import { useLanguage } from "./LanguageProvider";

export default function AutoBackupRunner() {
    const { settings } = useLanguage();

    const enabled = settings.backup?.enabled ?? true;
    const time = settings.backup?.time ?? "23:59";

    useEffect(() => {
        if (!enabled) return;

        let active = true;

        async function check() {
            try {
                const created = await checkAutomaticBackup();

                if (active) {
                    window.dispatchEvent(
                        new CustomEvent("dapl:auto-backup-status", {
                            detail: {
                                status: created ? "created" : "checked",
                            },
                        }),
                    );
                }
            } catch (error) {
                console.error("Automatic backup failed:", error);

                if (active) {
                    window.dispatchEvent(
                        new CustomEvent("dapl:auto-backup-status", {
                            detail: { status: "failed" },
                        }),
                    );
                }
            }
        }

        function handleVisibility() {
            if (document.visibilityState === "visible") {
                check();
            }
        }

        check();

        const timer = window.setInterval(check, 60_000);

        window.addEventListener("focus", check);
        document.addEventListener(
            "visibilitychange",
            handleVisibility,
        );

        return () => {
            active = false;

            window.clearInterval(timer);
            window.removeEventListener("focus", check);
            document.removeEventListener(
                "visibilitychange",
                handleVisibility,
            );
        };
    }, [enabled, time]);

    return null;
}