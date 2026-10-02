"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";

import { defaultSettings } from "../../app/data";
import useStoredState from "../../hooks/useStoredState";
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
const FONT_SIZES = ["small", "medium", "large"];

function normalizeSettings(value) {
  const stored = value && typeof value === "object"
    ? value
    : {};

  return {
    ...defaultSettings,
    ...stored,
    language: normalizeLocale(
      stored.language ?? defaultSettings.language,
    ),
    fontSize: FONT_SIZES.includes(stored.fontSize)
      ? stored.fontSize
      : defaultSettings.fontSize,
  };
}

function applyDocumentPreferences(settings, dark) {
  const config = getLocaleConfig(settings.language);
  const messages = translations[settings.language];
  const root = document.documentElement;

  root.lang = settings.language;
  root.dir = config.direction;
  root.dataset.fontSize = settings.fontSize;
  root.classList.toggle("dark", dark);

  document.title = messages.metaTitle;

  document.querySelector('meta[name="description"]')
    ?.setAttribute("content", messages.metaDescription);
}

/* Shares the same language interface in normal and recovery views. */
function PreferencesContext({
  children,
  settings,
  dark,
  hydrated,
  updateSettings,
  setDark,
}) {
  useLayoutEffect(() => {
    if (hydrated) {
      applyDocumentPreferences(settings, dark);
    }
  }, [settings, dark, hydrated]);

  const changeLocale = useCallback((nextLocale) => {
    const language = normalizeLocale(nextLocale);
    const config = getLocaleConfig(language);

    return updateSettings((current) => ({
      ...current,
      language,
      calendar: config.calendar,
      secondaryCalendar: config.secondaryCalendar,
      firstDay: config.firstDay,
    }));
  }, [updateSettings]);

  const toggleDark = useCallback(
    () => setDark((current) => !current),
    [setDark],
  );

  const value = useMemo(() => ({
    locale: settings.language,
    settings,
    updateSettings,
    direction: getLocaleConfig(settings.language).direction,
    calendar: settings.calendar,
    languages: SUPPORTED_LOCALES.map((code) => ({
      code,
      name: translations[code].languageName,
    })),
    changeLocale,
    dark,
    setDark,
    toggleDark,
    hydrated,
    t: (key, variables) =>
      tr(settings.language, key, variables),
  }), [
    settings,
    updateSettings,
    changeLocale,
    dark,
    setDark,
    toggleDark,
    hydrated,
  ]);

  if (!hydrated) return null;

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

/* Uses IndexedDB as the source of saved preferences. */
function DatabaseLanguageProvider({ children }) {
  const [storedSettings, saveSettings, settingsLoaded] =
    useStoredState(STORAGE_KEYS.settings, defaultSettings);

  const [dark, saveDark, darkLoaded] =
    useStoredState(STORAGE_KEYS.darkMode, false);

  const hydrated = settingsLoaded && darkLoaded;

  const settings = useMemo(
    () => normalizeSettings(storedSettings),
    [storedSettings],
  );

  const updateSettings = useCallback((next) => {
    return saveSettings((stored) => {
      const current = normalizeSettings(stored);

      return normalizeSettings(
        typeof next === "function"
          ? next(current)
          : { ...current, ...next },
      );
    });
  }, [saveSettings]);

  const setDark = useCallback((next) => {
    return saveDark((current) => {
      const value = typeof next === "function"
        ? next(current)
        : next;

      return Boolean(value);
    });
  }, [saveDark]);

  /* Keeps a small fallback for the recovery screen. */
  useEffect(() => {
    if (!hydrated) return;

    writeStorage(STORAGE_KEYS.settings, settings);
    writeStorageText(STORAGE_KEYS.darkMode, dark ? "1" : "0");
  }, [settings, dark, hydrated]);

  return (
    <PreferencesContext
      settings={settings}
      dark={dark}
      hydrated={hydrated}
      updateSettings={updateSettings}
      setDark={setDark}
    >
      {children}
    </PreferencesContext>
  );
}

/* Displays recovery without attempting to load missing DB records. */
function RecoveryLanguageProvider({ children }) {
  const [preferences, setPreferences] = useState(null);

  useEffect(() => {
    setPreferences({
      settings: normalizeSettings(
        readStorage(STORAGE_KEYS.settings, defaultSettings),
      ),
      dark: readStorageText(STORAGE_KEYS.darkMode) === "1",
    });
  }, []);

  const ignoreUpdate = useCallback(() => { }, []);

  return (
    <PreferencesContext
      settings={preferences?.settings ?? defaultSettings}
      dark={preferences?.dark ?? false}
      hydrated={preferences !== null}
      updateSettings={ignoreUpdate}
      setDark={ignoreUpdate}
    >
      {children}
    </PreferencesContext>
  );
}

export function LanguageProvider({
  children,
  recoveryMode = false,
}) {
  return recoveryMode
    ? (
      <RecoveryLanguageProvider>
        {children}
      </RecoveryLanguageProvider>
    )
    : (
      <DatabaseLanguageProvider>
        {children}
      </DatabaseLanguageProvider>
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