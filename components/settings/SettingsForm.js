"use client";

import { useRef, useState } from "react";

import SelectField from "../ui/SelectField";
import { useLanguage } from "../providers/LanguageProvider";

export default function SettingsForm({ onSubmit }) {
    const {
        changeLocale,
        dark,
        languages,
        setDark,
        settings,
        t,
        updateSettings,
    } = useLanguage();

    const pendingWrites = useRef([]);
    const submitLock = useRef(false);
    const [saving, setSaving] = useState(false);

    const usesHijriCalendar =
        settings.calendar === "hijri" ||
        settings.secondaryCalendar === "hijri";

    /* Tracks writes so submission waits for all changes. */
    function trackWrite(operation) {
        const promise = Promise.resolve(operation);

        pendingWrites.current.push(promise);

        promise.catch(() => {
            /* Storage errors are handled by StorageBoundary. */
        });
    }

    function updateSetting(event) {
        const { name, value } = event.target;

        trackWrite(
            name === "language"
                ? changeLocale(value)
                : updateSettings({ [name]: value }),
        );
    }

    async function handleSubmit(event) {
        event.preventDefault();

        if (submitLock.current) return;

        submitLock.current = true;
        setSaving(true);

        try {
            await Promise.all(pendingWrites.current);
            pendingWrites.current = [];

            await onSubmit?.();
        } catch {
            /* Keep the page open if saving fails. */
        } finally {
            submitLock.current = false;
            setSaving(false);
        }
    }

    return (
        <form
            className="form"
            onSubmit={handleSubmit}
            aria-busy={saving}
        >
            <SelectField
                label={t("language")}
                name="language"
                value={settings.language}
                onChange={updateSetting}
                disabled={saving}
            >
                {languages.map(({ code, name }) => (
                    <option key={code} value={code}>
                        {name}
                    </option>
                ))}
            </SelectField>

            <SelectField
                label={t("calendarType")}
                name="calendar"
                value={settings.calendar}
                onChange={updateSetting}
                disabled={saving}
            >
                <option value="gregorian">{t("gregorian")}</option>
                <option value="jalali">{t("jalali")}</option>
                <option value="hijri">{t("hijri")}</option>
            </SelectField>

            <SelectField
                label={t("secondary")}
                name="secondaryCalendar"
                value={settings.secondaryCalendar}
                onChange={updateSetting}
                disabled={saving}
            >
                <option value="none">{t("noneCalendar")}</option>
                <option value="gregorian">{t("gregorian")}</option>
                <option value="jalali">{t("jalali")}</option>
                <option value="hijri">{t("hijri")}</option>
            </SelectField>

            <SelectField
                label={t("firstDay")}
                name="firstDay"
                value={settings.firstDay}
                onChange={updateSetting}
                disabled={saving}
            >
                <option value="saturday">{t("saturday")}</option>
                <option value="sunday">{t("sunday")}</option>
                <option value="monday">{t("monday")}</option>
            </SelectField>

            {usesHijriCalendar && (
                <SelectField
                    label={t("hijriMethod")}
                    name="hijriMethod"
                    value={settings.hijriMethod}
                    onChange={updateSetting}
                    disabled={saving}
                >
                    <option value="ummalqura">
                        {t("ummalqura")}
                    </option>
                </SelectField>
            )}

            <label className="switchRow">
                <span>{t("darkMode")}</span>

                <input
                    type="checkbox"
                    checked={dark}
                    disabled={saving}
                    onChange={(event) => {
                        trackWrite(setDark(event.target.checked));
                    }}
                />
            </label>

            <button
                className="primary"
                type="submit"
                disabled={saving}
            >
                {t("save")}
            </button>
        </form>
    );
}