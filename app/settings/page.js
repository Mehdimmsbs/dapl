"use client";

import { useEffect, useState } from "react";
import {
    SETTINGS,
    defaultSettings,
} from "../data";
import {
    tr,
    translations,
} from "../../lib/i18n";

const DARK_MODE_STORAGE_KEY = "pdp-dark";

/* Safely reads JSON data from local storage. */
function readJson(key, fallback) {
    try {
        const storedValue = localStorage.getItem(key);

        return storedValue
            ? JSON.parse(storedValue)
            : fallback;
    } catch {
        return fallback;
    }
}

/* Displays and manages the application settings page. */
export default function SettingsPage() {
    const [settings, setSettings] =
        useState(defaultSettings);

    const [dark, setDark] =
        useState(false);

    const [hydrated, setHydrated] =
        useState(false);

    /* Loads saved settings after the browser is ready. */
    useEffect(() => {
        const savedSettings =
            readJson(SETTINGS, {});

        setSettings({
            ...defaultSettings,
            ...savedSettings,
        });

        setDark(
            localStorage.getItem(
                DARK_MODE_STORAGE_KEY,
            ) === "1",
        );

        setHydrated(true);
    }, []);

    /* Updates language, direction and dark mode preview. */
    useEffect(() => {
        if (!hydrated) {
            return;
        }

        const activeLanguage =
            translations[settings.language] ??
            translations.en;

        document.documentElement.lang =
            settings.language;

        document.documentElement.dir =
            activeLanguage.dir;

        document.documentElement.classList.toggle(
            "dark",
            dark,
        );
    }, [
        settings.language,
        dark,
        hydrated,
    ]);

    /* Returns translated text for the selected language. */
    function t(key) {
        return tr(settings.language, key);
    }

    /* Updates one settings field. */
    function updateSetting(event) {
        const { name, value } =
            event.target;

        setSettings((currentSettings) => ({
            ...currentSettings,
            [name]: value,
        }));
    }

    /* Updates the dark mode preview. */
    function updateDarkMode(event) {
        setDark(event.target.checked);
    }

    /* Saves settings and returns to the dashboard. */
    function saveSettings(event) {
        event.preventDefault();

        localStorage.setItem(
            SETTINGS,
            JSON.stringify(settings),
        );

        localStorage.setItem(
            DARK_MODE_STORAGE_KEY,
            dark ? "1" : "0",
        );

        /* Notifies open components about the settings change. */
        window.dispatchEvent(
            new Event(
                "dapl:settings-changed",
            ),
        );

        window.location.assign("/");
    }

    const usesHijriCalendar =
        settings.calendar === "hijri" ||
        settings.secondaryCalendar ===
        "hijri";

    return (
        <div className="appShell">
            {/* Displays desktop navigation. */}
            <aside className="sidebar">
                <div className="brand">
                    <div className="brandMark">
                        ✓
                    </div>

                    <div className="brandText">
                        <b>{t("brandName")}</b>
                        <span>{t("planner")}</span>
                    </div>
                </div>

                <nav className="nav">
                    <a href="/">
                        ⌂{" "}
                        <span>
                            {t("today")}
                        </span>
                    </a>

                    <a href="/calendar">
                        ▦{" "}
                        <span>
                            {t("calendar")}
                        </span>
                    </a>

                    <a href="/?new=1">
                        ＋{" "}
                        <span>
                            {t("newTask")}
                        </span>
                    </a>

                    <a href="/routines">
                        ↻{" "}
                        <span>
                            {t("routines")}
                        </span>
                    </a>

                    <a
                        className="active"
                        href="/settings"
                    >
                        ⚙{" "}
                        <span>
                            {t("settings")}
                        </span>
                    </a>
                </nav>
            </aside>

            <div className="main">
                <main className="content">
                    {/* Displays the settings page heading. */}
                    <div className="hero">
                        <div>
                            <div className="kicker">
                                {t("settings")}
                            </div>

                            <h1>
                                {t("settingsTitle")}
                            </h1>

                            <p>
                                {t("settingsSub")}
                            </p>
                        </div>
                    </div>

                    <section className="card settingsPage">
                        <form
                            className="form"
                            onSubmit={saveSettings}
                        >
                            {/* Changes the application language. */}
                            <label>
                                {t("language")}

                                <select
                                    name="language"
                                    value={settings.language}
                                    onChange={
                                        updateSetting
                                    }
                                >
                                    {Object.entries(
                                        translations,
                                    ).map(
                                        ([
                                            languageCode,
                                            language,
                                        ]) => (
                                            <option
                                                key={
                                                    languageCode
                                                }
                                                value={
                                                    languageCode
                                                }
                                            >
                                                {
                                                    language.name
                                                }
                                            </option>
                                        ),
                                    )}
                                </select>
                            </label>

                            {/* Selects the main calendar system. */}
                            <label>
                                {t("calendarType")}

                                <select
                                    name="calendar"
                                    value={settings.calendar}
                                    onChange={
                                        updateSetting
                                    }
                                >
                                    <option value="gregorian">
                                        {t("gregorian")}
                                    </option>

                                    <option value="jalali">
                                        {t("jalali")}
                                    </option>

                                    <option value="hijri">
                                        {t("hijri")}
                                    </option>
                                </select>
                            </label>

                            {/* Selects an optional secondary calendar. */}
                            <label>
                                {t("secondary")}

                                <select
                                    name="secondaryCalendar"
                                    value={
                                        settings.secondaryCalendar
                                    }
                                    onChange={
                                        updateSetting
                                    }
                                >
                                    <option value="none">
                                        {t("noneCalendar")}
                                    </option>

                                    <option value="gregorian">
                                        {t("gregorian")}
                                    </option>

                                    <option value="jalali">
                                        {t("jalali")}
                                    </option>

                                    <option value="hijri">
                                        {t("hijri")}
                                    </option>
                                </select>
                            </label>

                            {/* Selects the first day of the week. */}
                            <label>
                                {t("firstDay")}

                                <select
                                    name="firstDay"
                                    value={
                                        settings.firstDay
                                    }
                                    onChange={
                                        updateSetting
                                    }
                                >
                                    <option value="saturday">
                                        {t("saturday")}
                                    </option>

                                    <option value="sunday">
                                        {t("sunday")}
                                    </option>

                                    <option value="monday">
                                        {t("monday")}
                                    </option>
                                </select>
                            </label>

                            {/* Shows Hijri settings only when needed. */}
                            {usesHijriCalendar && (
                                <label>
                                    {t("hijriMethod")}

                                    <select
                                        name="hijriMethod"
                                        value={
                                            settings.hijriMethod
                                        }
                                        onChange={
                                            updateSetting
                                        }
                                    >
                                        <option value="ummalqura">
                                            {t("ummalqura")}
                                        </option>
                                    </select>
                                </label>
                            )}

                            {/* Enables or disables dark mode. */}
                            <label className="switchRow">
                                <span>
                                    {t("darkMode")}
                                </span>

                                <input
                                    type="checkbox"
                                    checked={dark}
                                    onChange={
                                        updateDarkMode
                                    }
                                />
                            </label>

                            <button
                                className="primary"
                                type="submit"
                            >
                                {t("save")}
                            </button>
                        </form>
                    </section>
                </main>

                <SettingsMobileNav
                    lang={settings.language}
                />
            </div>
        </div>
    );
}

/* Displays mobile navigation for the settings page. */
function SettingsMobileNav({
    lang,
}) {
    /* Returns translated mobile navigation labels. */
    function t(key) {
        return tr(lang, key);
    }

    return (
        <nav className="mobileNav">
            <a href="/">
                ⌂
                <span>{t("today")}</span>
            </a>

            <a href="/calendar">
                ▦
                <span>{t("calendar")}</span>
            </a>

            <a
                href="/?new=1"
                className="add"
            >
                +
                <span>{t("newTask")}</span>
            </a>

            <a href="/routines">
                ↻
                <span>{t("routines")}</span>
            </a>

            <a
                href="/settings"
                className="active"
            >
                ⚙
                <span>{t("settings")}</span>
            </a>
        </nav>
    );
}