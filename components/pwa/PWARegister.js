"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "../providers/LanguageProvider";

/* Registers the safe service worker and displays the install action. */
export default function PWARegister() {
    const { t } = useLanguage();

    const [
        installPrompt,
        setInstallPrompt,
    ] = useState(null);

    useEffect(() => {
        if (
            process.env.NODE_ENV === "production" &&
            "serviceWorker" in navigator
        ) {
            navigator.serviceWorker
                .register("/sw.js", {
                    scope: "/",
                })
                .catch((error) => {
                    console.error(
                        "Service worker registration failed:",
                        error,
                    );
                });
        }

        function handleBeforeInstall(event) {
            event.preventDefault();
            setInstallPrompt(event);
        }

        function handleInstalled() {
            setInstallPrompt(null);
        }

        window.addEventListener(
            "beforeinstallprompt",
            handleBeforeInstall,
        );

        window.addEventListener(
            "appinstalled",
            handleInstalled,
        );

        return () => {
            window.removeEventListener(
                "beforeinstallprompt",
                handleBeforeInstall,
            );

            window.removeEventListener(
                "appinstalled",
                handleInstalled,
            );
        };
    }, []);

    async function installApplication() {
        if (!installPrompt) {
            return;
        }

        await installPrompt.prompt();
        await installPrompt.userChoice;

        setInstallPrompt(null);
    }

    if (!installPrompt) {
        return null;
    }

    return (
        <button
            type="button"
            className="pwaInstallButton"
            onClick={installApplication}
        >
            {t("installApp")}
        </button>
    );
}