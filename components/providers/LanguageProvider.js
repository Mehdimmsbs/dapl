"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { SETTINGS, defaultSettings } from "../../app/data";
import { translations, tr } from "../../lib/i18n";
import {
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  getLocaleConfig,
  normalizeLocale,
} from "../../locales/config";

const LanguageContext = createContext(null);

function readStoredSettings() {
  try {
    const storedSettings = localStorage.getItem(SETTINGS);

    if (!storedSettings) {
      return defaultSettings;
    }

    return {
      ...defaultSettings,
      ...JSON.parse(storedSettings),
    };
  } catch {
    return defaultSettings;
  }
}

export function LanguageProvider({ children }) {
  const [locale, setLocale] = useState(DEFAULT_LOCALE);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const storedSettings = readStoredSettings();

    setLocale(normalizeLocale(storedSettings.language));
    setHydrated(true);
  }, []);

  useEffect(() => {
    function handleSettingsChange(event) {
      const nextLocale = normalizeLocale(event.detail?.language);
      setLocale(nextLocale);
    }

    window.addEventListener("dapl:settings-changed", handleSettingsChange);

    return () => {
      window.removeEventListener(
        "dapl:settings-changed",
        handleSettingsChange,
      );
    };
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    const localeConfig = getLocaleConfig(locale);
    const messages = translations[locale];

    document.documentElement.lang = locale;
    document.documentElement.dir = localeConfig.direction;
    document.title = messages.metaTitle;

    const description = document.querySelector(
      'meta[name="description"]',
    );

    if (description) {
      description.setAttribute(
        "content",
        messages.metaDescription,
      );
    }
  }, [locale, hydrated]);

  function changeLocale(nextLocale) {
    const normalizedLocale = normalizeLocale(nextLocale);
    const localeConfig = getLocaleConfig(normalizedLocale);
    const currentSettings = readStoredSettings();

    const nextSettings = {
      ...currentSettings,
      language: normalizedLocale,
      calendar: localeConfig.calendar,
      secondaryCalendar: localeConfig.secondaryCalendar,
      firstDay: localeConfig.firstDay,
    };

    localStorage.setItem(
      SETTINGS,
      JSON.stringify(nextSettings),
    );

    setLocale(normalizedLocale);

    window.dispatchEvent(
      new CustomEvent("dapl:settings-changed", {
        detail: nextSettings,
      }),
    );
  }

  const value = useMemo(
    () => ({
      locale,
      direction: getLocaleConfig(locale).direction,
      calendar: getLocaleConfig(locale).calendar,
      languages: SUPPORTED_LOCALES.map((languageCode) => ({
        code: languageCode,
        name: translations[languageCode].languageName,
      })),
      changeLocale,
      t: (key, variables) => tr(locale, key, variables),
    }),
    [locale],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error(
      "useLanguage must be used inside LanguageProvider",
    );
  }

  return context;
}