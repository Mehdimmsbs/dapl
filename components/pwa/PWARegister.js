"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "../providers/LanguageProvider";

export default function PWARegister() {
    const { t } = useLanguage();
    const [installPrompt, setInstallPrompt] = useState(null);
    const [installed, setInstalled] = useState(false);

    useEffect(() => {
        setInstalled(
            window.matchMedia("(display-mode: standalone)").matches ||
            window.navigator.standalone === true,
        );

        if (
            process.env.NODE_ENV === "production" &&
            "serviceWorker" in navigator
        ) {
            navigator.serviceWorker
                .register("/sw.js", { scope: "/" })
                .catch((error) => {
                    console.error("Service worker registration failed:", error);
                });
        }

        function handleBeforeInstall(event) {
            event.preventDefault();
            setInstallPrompt(event);
        }

        function handleInstalled() {
            setInstalled(true);
            setInstallPrompt(null);
        }

        window.addEventListener("beforeinstallprompt", handleBeforeInstall);
        window.addEventListener("appinstalled", handleInstalled);

        return () => {
            window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
            window.removeEventListener("appinstalled", handleInstalled);
        };
    }, []);

    async function installApplication() {
        if (!installPrompt) return;

        await installPrompt.prompt();
        await installPrompt.userChoice;
        setInstallPrompt(null);
    }

    if (installed) return null;

    return (
        <button
            type="button"
            className="pwaInstallButton"
            onClick={installApplication}
        >
            <span aria-hidden="true">↧</span>
            {t("installApp")}
        </button>
    );
}