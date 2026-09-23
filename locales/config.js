export const DEFAULT_LOCALE = "en";

export const SUPPORTED_LOCALES = ["en", "de", "fa", "ar"];

export const LOCALE_CONFIG = {
  en: {
    direction: "ltr",
    calendar: "gregorian",
    secondaryCalendar: "none",
    firstDay: "monday",
    intlLocale: "en-US",
  },
  de: {
    direction: "ltr",
    calendar: "gregorian",
    secondaryCalendar: "none",
    firstDay: "monday",
    intlLocale: "de-DE",
  },
  fa: {
    direction: "rtl",
    calendar: "jalali",
    secondaryCalendar: "gregorian",
    firstDay: "saturday",
    intlLocale: "fa-IR",
  },
  ar: {
    direction: "rtl",
    calendar: "hijri",
    secondaryCalendar: "gregorian",
    firstDay: "saturday",
    intlLocale: "ar-SA",
  },
};

export function normalizeLocale(locale) {
  return SUPPORTED_LOCALES.includes(locale) ? locale : DEFAULT_LOCALE;
}

export function getLocaleConfig(locale) {
  return LOCALE_CONFIG[normalizeLocale(locale)];
}