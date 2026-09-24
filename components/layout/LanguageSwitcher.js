"use client";

import { useLanguage } from "../providers/LanguageProvider";
import AppIcon from "../ui/AppIcon";

/* Renders the Aurora language selector. */
export default function LanguageSwitcher({
  className = "",
}) {
  const {
    locale,
    languages,
    changeLocale,
    t,
  } = useLanguage();

  /* Updates the active application language. */
  function handleLanguageChange(event) {
    changeLocale(event.target.value);
  }

  return (
    <label
      className={`languageSwitcher ${className}`.trim()}
    >
      <span className="srOnly">
        {t("selectLanguage")}
      </span>

      <select
        value={locale}
        onChange={handleLanguageChange}
        aria-label={t("selectLanguage")}
      >
        {languages.map(({ code, name }) => (
          <option key={code} value={code}>
            {name}
          </option>
        ))}
      </select>

      <AppIcon
        name="chevron-down"
        size={16}
        className="languageChevron"
      />
    </label>
  );
}