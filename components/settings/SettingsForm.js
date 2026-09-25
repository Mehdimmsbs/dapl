"use client";

import { translations } from "../../lib/i18n";
import SelectField from "../ui/SelectField";
import { useLanguage } from "../providers/LanguageProvider";

/* Displays global language, calendar and appearance settings. */
export default function SettingsForm({
    onSubmit,
}) {
    const {
        changeLocale,
        dark,
        setDark,
        settings,
        t,
        updateSettings,
    } = useLanguage();

    const usesHijriCalendar =
        settings.calendar === "hijri" ||
        settings.secondaryCalendar ===
        "hijri";

    /* Updates one setting immediately. */
    function updateSetting(event) {
        const {
            name,
            value,
        } = event.target;

        if (name === "language") {
            changeLocale(value);
            return;
        }

        updateSettings({
            [name]: value,
        });
    }

    return (
        <form
            className="form"
            onSubmit={onSubmit}
        >
            <label>
                {t("language")}

                <SelectField
                    name="language"
                    value={settings.language}
                    onChange={updateSetting}
                >
                    {Object.entries(
                        translations,
                    ).map(
                        ([
                            code,
                            language,
                        ]) => (
                            <option
                                key={code}
                                value={code}
                            >
                                {language.name}
                            </option>
                        ),
                    )}
                </SelectField>
            </label>

            <label>
                {t("calendarType")}

                <SelectField
                    name="calendar"
                    value={settings.calendar}
                    onChange={updateSetting}
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
                </SelectField>
            </label>

            <label>
                {t("secondary")}

                <SelectField
                    name="secondaryCalendar"
                    value={
                        settings.secondaryCalendar
                    }
                    onChange={updateSetting}
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
                </SelectField>
            </label>

            <label>
                {t("firstDay")}

                <SelectField
                    name="firstDay"
                    value={settings.firstDay}
                    onChange={updateSetting}
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
                </SelectField>
            </label>

            {usesHijriCalendar && (
                <label>
                    {t("hijriMethod")}

                    <SelectField
                        name="hijriMethod"
                        value={
                            settings.hijriMethod
                        }
                        onChange={updateSetting}
                    >
                        <option value="ummalqura">
                            {t("ummalqura")}
                        </option>
                    </SelectField>
                </label>
            )}

            <label className="switchRow">
                <span>
                    {t("darkMode")}
                </span>

                <input
                    type="checkbox"
                    checked={dark}
                    onChange={(event) => {
                        setDark(
                            event.target.checked,
                        );
                    }}
                />
            </label>

            <button
                className="primary"
                type="submit"
            >
                {t("save")}
            </button>
        </form>
    );
}