import en from "../locales/translations/en.json";
import de from "../locales/translations/de.json";
import fa from "../locales/translations/fa.json";
import ar from "../locales/translations/ar.json";

import {
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  getLocaleConfig,
  normalizeLocale,
} from "../locales/config";

const dictionaries = {
  en,
  de,
  fa,
  ar,
};

export const translations = Object.fromEntries(
  SUPPORTED_LOCALES.map((locale) => [
    locale,
    {
      ...dictionaries[locale],

      // Temporary compatibility for the existing components.
      name: dictionaries[locale].languageName,
      dir: getLocaleConfig(locale).direction,
    },
  ]),
);

export function getMessages(locale) {
  return translations[normalizeLocale(locale)];
}

export function tr(locale, key, variables = {}) {
  const normalizedLocale = normalizeLocale(locale);

  const message =
    translations[normalizedLocale]?.[key] ??
    translations[DEFAULT_LOCALE]?.[key] ??
    key;

  if (typeof message !== "string") {
    return key;
  }

  return message.replace(/\{(\w+)\}/g, (_, variableName) => {
    return variables[variableName] ?? "";
  });
}

export const langs = SUPPORTED_LOCALES;