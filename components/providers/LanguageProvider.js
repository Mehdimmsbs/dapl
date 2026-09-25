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

/* Returns a supported font size. */
function normalizeFontSize(fontSize) {
  return FONT_SIZES.includes(fontSize)
    ? fontSize
    : "medium";
}

/* Combines stored preferences with application defaults. */
function normalizeSettings(storedSettings = {}) {
  return {
    ...defaultSettings,
    ...storedSettings,

    language: normalizeLocale(
      storedSettings.language,
    ),

    fontSize: normalizeFontSize(
      storedSettings.fontSize,
    ),
  };
}

/* Applies global preferences to the HTML document. */
function applyDocumentPreferences(
  settings,
  dark,
) {
  if (typeof document === "undefined") {
    return;
  }

  const locale = normalizeLocale(
    settings.language,
  );

  const localeConfig =
    getLocaleConfig(locale);

  const messages =
    translations[locale];

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
}

/* Provides language, calendar and appearance settings globally. */
export function LanguageProvider({
  children,
}) {
  const [settings, setSettings] =
    useState(defaultSettings);

  const [dark, setDark] =
    useState(false);

  const [hydrated, setHydrated] =
    useState(false);

  /* Loads saved preferences before displaying the application. */
  useEffect(() => {
    const nextSettings =
      normalizeSettings(
        readStorage(
          STORAGE_KEYS.settings,
          {},
        ),
      );

    const nextDark =
      readStorageText(
        STORAGE_KEYS.darkMode,
      ) === "1";

    applyDocumentPreferences(
      nextSettings,
      nextDark,
    );

    setSettings(nextSettings);
    setDark(nextDark);
    setHydrated(true);
  }, []);

  /* Synchronizes preferences between browser tabs. */
  useEffect(() => {
    function handleStorageChange(event) {
      if (
        event.key !== STORAGE_KEYS.settings &&
        event.key !== STORAGE_KEYS.darkMode
      ) {
        return;
      }

      const nextSettings =
        normalizeSettings(
          readStorage(
            STORAGE_KEYS.settings,
            {},
          ),
        );

      const nextDark =
        readStorageText(
          STORAGE_KEYS.darkMode,
        ) === "1";

      applyDocumentPreferences(
        nextSettings,
        nextDark,
      );

      setSettings((currentSettings) => {
        const currentValue =
          JSON.stringify(
            normalizeSettings(
              currentSettings,
            ),
          );

        const nextValue =
          JSON.stringify(nextSettings);

        return currentValue === nextValue
          ? currentSettings
          : nextSettings;
      });

      setDark((currentDark) =>
        currentDark === nextDark
          ? currentDark
          : nextDark,
      );
    }

    window.addEventListener(
      "storage",
      handleStorageChange,
    );

    return () => {
      window.removeEventListener(
        "storage",
        handleStorageChange,
      );
    };
  }, []);

  /* Saves preferences and updates the document. */
  useEffect(() => {
    if (!hydrated) {
      return;
    }

    writeStorage(
      STORAGE_KEYS.settings,
      settings,
    );

    writeStorageText(
      STORAGE_KEYS.darkMode,
      dark ? "1" : "0",
    );

    applyDocumentPreferences(
      settings,
      dark,
    );
  }, [
    settings,
    dark,
    hydrated,
  ]);

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

  /* Changes the language and its calendar defaults. */
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
    const locale =
      normalizeLocale(
        settings.language,
      );

    return {
      locale,
      settings,
      updateSettings,

      direction:
        getLocaleConfig(
          locale,
        ).direction,

      calendar:
        settings.calendar,

      languages:
        SUPPORTED_LOCALES.map(
          (languageCode) => ({
            code: languageCode,

            name:
              translations[
                languageCode
              ].languageName,
          }),
        ),

      changeLocale,
      dark,
      setDark,

      toggleDark: () => {
        setDark(
          (currentDark) =>
            !currentDark,
        );
      },

      hydrated,

      t: (key, variables) =>
        tr(
          locale,
          key,
          variables,
        ),
    };
  }, [
    settings,
    updateSettings,
    changeLocale,
    dark,
    hydrated,
  ]);

  /*
   * Prevents the default English interface from flashing
   * before stored preferences are loaded.
   */
  if (!hydrated) {
    return null;
  }

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