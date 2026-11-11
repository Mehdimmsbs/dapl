"use client";

import { useEffect, useRef, useState } from "react";

import { useLanguage } from "../providers/LanguageProvider";

const INSTALL_STEPS = {
  ios: ["installIosStepOne", "installIosStepTwo", "installIosStepThree"],

  android: ["installAndroidStepOne", "installAndroidStepTwo"],

  macSafari: ["installMacStepOne", "installMacStepTwo"],

  desktop: ["installDesktopStepOne", "installDesktopStepTwo"],
};

/* Detects the installation instructions required by this browser. */
function detectPlatform() {
  const userAgent = window.navigator.userAgent;

  const ios =
    /iPhone|iPad|iPod/i.test(userAgent) ||
    (window.navigator.platform === "MacIntel" &&
      window.navigator.maxTouchPoints > 1);

  if (ios) {
    return "ios";
  }

  if (/Android/i.test(userAgent)) {
    return "android";
  }

  const safari =
    /Safari/i.test(userAgent) &&
    !/Chrome|Chromium|CriOS|FxiOS|EdgiOS|OPiOS|Android/i.test(userAgent);

  const mac = /Macintosh|Mac OS X/i.test(userAgent);

  if (safari && mac) {
    return "macSafari";
  }

  return "desktop";
}

/* Registers the PWA and provides platform-specific installation. */
export default function PWARegister() {
  const { t } = useLanguage();

  const installButtonRef = useRef(null);
  const closeButtonRef = useRef(null);

  const [installPrompt, setInstallPrompt] = useState(null);

  const [installed, setInstalled] = useState(false);

  const [guideOpen, setGuideOpen] = useState(false);

  const [platform, setPlatform] = useState("desktop");

  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const standaloneQuery = window.matchMedia("(display-mode: standalone)");

    function refreshInstalledState() {
      setInstalled(
        standaloneQuery.matches || window.navigator.standalone === true,
      );
    }

    refreshInstalledState();
    setPlatform(detectPlatform());

    /*
     * Register in development too, so installation can be
     * tested from an HTTPS Codespaces URL.
     */
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js", {
          scope: "/",
        })
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
      setGuideOpen(false);
    }

    function handleDisplayModeChange() {
      refreshInstalledState();
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    window.addEventListener("appinstalled", handleInstalled);

    standaloneQuery.addEventListener?.("change", handleDisplayModeChange);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);

      window.removeEventListener("appinstalled", handleInstalled);

      standaloneQuery.removeEventListener?.("change", handleDisplayModeChange);
    };
  }, []);

  useEffect(() => {
    if (!guideOpen) {
      return undefined;
    }

    closeButtonRef.current?.focus();

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setGuideOpen(false);
        installButtonRef.current?.focus();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [guideOpen]);

  function closeGuide() {
    setGuideOpen(false);

    window.requestAnimationFrame(() => {
      installButtonRef.current?.focus();
    });
  }

  async function installApplication() {
    if (busy) {
      return;
    }

    /*
     * Chromium browsers provide a native installation prompt.
     * Safari and browsers without it receive clear instructions.
     */
    if (!installPrompt) {
      setGuideOpen(true);
      return;
    }

    setBusy(true);

    try {
      await installPrompt.prompt();

      const choice = await installPrompt.userChoice;

      setInstallPrompt(null);

      if (choice.outcome === "accepted") {
        setInstalled(true);
      }
    } catch {
      setInstallPrompt(null);
      setGuideOpen(true);
    } finally {
      setBusy(false);
    }
  }

  if (installed) {
    return null;
  }

  return (
    <>
      <button
        ref={installButtonRef}
        type="button"
        className="pwaInstallButton"
        disabled={busy}
        onClick={installApplication}
      >
        <span aria-hidden="true">↧</span>

        {t("installApp")}
      </button>

      {guideOpen && (
        <div
          className="pwaInstallOverlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeGuide();
            }
          }}
        >
          <section
            className="pwaInstallDialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="pwa-install-title"
          >
            <header>
              <div>
                <h2 id="pwa-install-title">{t("installHelpTitle")}</h2>

                <p>{t("installHelpIntro")}</p>
              </div>

              <button
                ref={closeButtonRef}
                type="button"
                className="pwaInstallClose"
                aria-label={t("installHelpClose")}
                onClick={closeGuide}
              >
                ×
              </button>
            </header>

            <ol className="pwaInstallSteps">
              {INSTALL_STEPS[platform].map((translationKey) => (
                <li key={translationKey}>{t(translationKey)}</li>
              ))}
            </ol>

            <button type="button" className="primary" onClick={closeGuide}>
              {t("installHelpDone")}
            </button>
          </section>
        </div>
      )}
    </>
  );
}
