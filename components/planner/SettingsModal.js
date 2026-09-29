import { tr, translations } from "../../lib/i18n";
import SelectField from "../ui/SelectField";
import Modal from "../ui/Modal";

/* Displays language, calendar and date preferences. */
export default function SettingsModal({
  settings,
  lang,
  onClose,
  onSubmit,
}) {
  /* Returns translated text for the active language. */
  function t(key, variables) {
    return tr(lang, key, variables);
  }

  return (
    <Modal title={t("settingsTitle")} close={onClose}>
      <form className="form" onSubmit={onSubmit}>
        <p className="formHint">
          {t("settingsSub")}
        </p>

        <SelectField label={t("language")}
            name="language"
            defaultValue={settings.language}
          >
            {Object.entries(translations).map(
              ([locale, messages]) => (
                <option key={locale} value={locale}>
                  {messages.name}
                </option>
              ),
            )}
          </SelectField>

        <SelectField label={t("calendarType")}
            name="calendar"
            defaultValue={settings.calendar}
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

        <SelectField label={t("secondary")}
            name="secondaryCalendar"
            defaultValue={settings.secondaryCalendar}
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

        <SelectField label={t("firstDay")}
            name="firstDay"
            defaultValue={settings.firstDay}
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

        <SelectField label={t("hijriMethod")}
            name="hijriMethod"
            defaultValue={settings.hijriMethod}
          >
            <option value="ummalqura">
              {t("ummalqura")}
            </option>
          </SelectField>
        <SelectField label={t("fontSize")}
            name="fontSize"
            defaultValue={
              settings.fontSize || "medium"
            }
          >
            <option value="small">
              {t("fontSmall")}
            </option>

            <option value="medium">
              {t("fontMedium")}
            </option>

            <option value="large">
              {t("fontLarge")}
            </option>
          </SelectField>

        <button className="primary">
          {t("save")}
        </button>
      </form>
    </Modal>
  );
}