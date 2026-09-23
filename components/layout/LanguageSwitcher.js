"use client";

import { useLanguage } from "../providers/LanguageProvider";

/* Renders the language selector and updates the active locale. */
export default function LanguageSwitcher({ className = "" }) {
  const {
    locale,
    languages,
    changeLocale,
    t,
  } = useLanguage();

  /* Passes the selected language to the global language provider. */
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
    </label>
  );
}