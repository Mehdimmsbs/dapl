"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { defaultSettings } from "../../app/data";
import { translations, tr } from "../../lib/i18n";
import {
  STORAGE_KEYS,
  readStorage,
  readStorageText,
  writeStorage,
  writeStorageText,
} from "../../lib/storage";
import {
  SUPPORTED_LOCALES,
  getLocaleConfig,
  normalizeLocale,
} from "../../locales/config";

const LanguageContext = createContext(null);

const FONT_SIZES = [
  "small",
  "medium",
  "large",
];

function normalizeFontSize(fontSize) {
  return FONT_SIZES.includes(fontSize)
    ? fontSize
    : "medium";
}

/* Provides language, calendar and appearance settings globally. */
export function LanguageProvider({ children }) {
  const [settings, setSettings] =
    useState(defaultSettings);

  const [dark, setDark] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  /* Loads all global preferences after browser hydration. */
  useEffect(() => {
    const storedSettings = readStorage(
      STORAGE_KEYS.settings,
      {},
    );

    setSettings({
      ...defaultSettings,
      ...storedSettings,

      language: normalizeLocale(
        storedSettings.language,
      ),

      fontSize: normalizeFontSize(
        storedSettings.fontSize,
      ),
    });

    setDark(
      readStorageText(
        STORAGE_KEYS.darkMode,
      ) === "1",
    );

    setHydrated(true);
  }, []);

  /* Accepts settings updates from other mounted views. */
  useEffect(() => {
    function handleSettingsChange(event) {
      const incomingSettings =
        event.detail ??
        readStorage(
          STORAGE_KEYS.settings,
          {},
        );

      setSettings((currentSettings) => ({
        ...currentSettings,
        ...incomingSettings,

        language: normalizeLocale(
          incomingSettings.language ??
          currentSettings.language,
        ),

        fontSize: normalizeFontSize(
          incomingSettings.fontSize ??
          currentSettings.fontSize,
        ),
      }));
    }

    window.addEventListener(
      "dapl:settings-changed",
      handleSettingsChange,
    );

    return () => {
      window.removeEventListener(
        "dapl:settings-changed",
        handleSettingsChange,
      );
    };
  }, []);

  /* Saves preferences and updates the HTML document. */
  useEffect(() => {
    if (!hydrated) {
      return;
    }

    const locale = normalizeLocale(
      settings.language,
    );

    const localeConfig =
      getLocaleConfig(locale);

    const messages =
      translations[locale];

    writeStorage(
      STORAGE_KEYS.settings,
      settings,
    );

    writeStorageText(
      STORAGE_KEYS.darkMode,
      dark ? "1" : "0",
    );

    document.documentElement.lang =
      locale;

    document.documentElement.dir =
      localeConfig.direction;

    document.documentElement.dataset.fontSize =
      normalizeFontSize(
        settings.fontSize,
      );

    document.documentElement.classList.toggle(
      "dark",
      dark,
    );

    document.title =
      messages.metaTitle;

    const description =
      document.querySelector(
        'meta[name="description"]',
      );

    description?.setAttribute(
      "content",
      messages.metaDescription,
    );
  }, [settings, dark, hydrated]);

  /* Updates one or more global settings. */
  const updateSettings = useCallback(
    (nextSettings) => {
      setSettings((currentSettings) => {
        if (
          typeof nextSettings ===
          "function"
        ) {
          return nextSettings(
            currentSettings,
          );
        }

        return {
          ...currentSettings,
          ...nextSettings,
        };
      });
    },
    [],
  );

  /* Changes the locale and its calendar defaults. */
  const changeLocale = useCallback(
    (nextLocale) => {
      const locale =
        normalizeLocale(nextLocale);

      const localeConfig =
        getLocaleConfig(locale);

      updateSettings(
        (currentSettings) => ({
          ...currentSettings,
          language: locale,
          calendar:
            localeConfig.calendar,
          secondaryCalendar:
            localeConfig.secondaryCalendar,
          firstDay:
            localeConfig.firstDay,
        }),
      );
    },
    [updateSettings],
  );

  const value = useMemo(() => {
    const locale = normalizeLocale(
      settings.language,
    );

    return {
      locale,
      settings,
      updateSettings,
      direction:
        getLocaleConfig(locale).direction,
      calendar: settings.calendar,

      languages: SUPPORTED_LOCALES.map(
        (languageCode) => ({
          code: languageCode,
          name:
            translations[languageCode]
              .languageName,
        }),
      ),

      changeLocale,
      dark,
      setDark,

      toggleDark: () => {
        setDark(
          (currentDark) => !currentDark,
        );
      },

      hydrated,

      t: (key, variables) =>
        tr(locale, key, variables),
    };
  }, [
    settings,
    updateSettings,
    changeLocale,
    dark,
    hydrated,
  ]);

  return (
    <LanguageContext.Provider
      value={value}
    >
      {children}
    </LanguageContext.Provider>
  );
}

/* Returns the shared application language context. */
export function useLanguage() {
  const context =
    useContext(LanguageContext);

  if (!context) {
    throw new Error(
      "useLanguage must be used inside LanguageProvider",
    );
  }

  return context;
}