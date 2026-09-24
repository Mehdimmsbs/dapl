import { STORAGE_KEYS } from "../lib/storage";

/* Keeps old imports compatible with the new storage layer. */
export const KEY =
  STORAGE_KEYS.planner;

export const SETTINGS =
  STORAGE_KEYS.settings;

export const seed = {
  tasks: [],
};

export const defaultSettings = {
  language: "en",
  fontSize: "medium",
  calendar: "gregorian",
  secondaryCalendar: "none",
  firstDay: "monday",
  hijriMethod: "ummalqura",
};