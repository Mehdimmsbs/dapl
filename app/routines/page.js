"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  KEY,
  SETTINGS,
  defaultSettings,
  seed,
} from "../data";

import LanguageSwitcher from "../../components/layout/LanguageSwitcher";
import Modal from "../../components/ui/Modal";

import {
  tr,
  translations,
} from "../../lib/i18n";

const ROUTINES_STORAGE_KEY =
  "personal-daily-planner-routines-v8";

const DARK_MODE_STORAGE_KEY =
  "pdp-dark";

const ROUTINE_DAYS = [
  "saturday",
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
];

const JAVASCRIPT_WEEKDAYS = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

const ACTIVITY_UNITS = [
  "minute",
  "hour",
  "percent",
  "item",
  "page",
];

/* Converts legacy localized values into stable identifiers. */
const LEGACY_UNIT_MAP = {
  "\u062f\u0642\u06cc\u0642\u0647":
    "minute",
  "\u0633\u0627\u0639\u062a":
    "hour",
  "\u062f\u0631\u0635\u062f":
    "percent",
  "\u0645\u0648\u0631\u062f":
    "item",
  "\u0635\u0641\u062d\u0647":
    "page",
};

/* Creates a fresh routine form value. */
function createEmptyRoutine() {
  return {
    id: null,
    title: "",
    description: "",
    priority: "normal",
    scheduleType: "day",
    startTime: "",
    endTime: "",
    unit: "minute",
    enabled: true,
    days: [...ROUTINE_DAYS],
  };
}

/* Returns a stable activity unit identifier. */
function normalizeUnit(unit) {
  if (ACTIVITY_UNITS.includes(unit)) {
    return unit;
  }

  return (
    LEGACY_UNIT_MAP[unit] ||
    "minute"
  );
}

/* Safely reads JSON from local storage. */
function readJson(key, fallback) {
  try {
    const storedValue =
      localStorage.getItem(key);

    return storedValue
      ? JSON.parse(storedValue)
      : fallback;
  } catch {
    return fallback;
  }
}

/* Safely writes JSON and notifies other views. */
function writeJson(key, value) {
  try {
    localStorage.setItem(
      key,
      JSON.stringify(value),
    );

    window.dispatchEvent(
      new Event("pdp-storage"),
    );
  } catch {
    /* Keeps the UI usable when storage is unavailable. */
  }
}

/* Returns today's local date in ISO format. */
function getLocalIsoDate() {
  const now = new Date();

  const localDate = new Date(
    now.getTime() -
    now.getTimezoneOffset() *
    60000,
  );

  return localDate
    .toISOString()
    .slice(0, 10);
}

/* Manages recurring routines and daily tasks. */
export default function RoutinesPage() {
  const [settings, setSettings] =
    useState(defaultSettings);

  const [routines, setRoutines] =
    useState([]);

  const [filter, setFilter] =
    useState("all");

  const [
    editingRoutine,
    setEditingRoutine,
  ] = useState(null);

  const [dark, setDark] =
    useState(false);

  const [collapsed, setCollapsed] =
    useState(false);

  const [hydrated, setHydrated] =
    useState(false);

  /* Returns translated text for the active language. */
  function t(
    key,
    variables = {},
  ) {
    return tr(
      settings.language,
      key,
      variables,
    );
  }

  /* Formats routine days for the active language. */
  function formatRoutineDays(
    routineDays,
  ) {
    const translatedDays =
      routineDays.map((day) =>
        t(day),
      );

    try {
      return new Intl.ListFormat(
        settings.language,
        {
          style: "long",
          type: "conjunction",
        },
      ).format(translatedDays);
    } catch {
      return translatedDays.join(
        ", ",
      );
    }
  }

  /* Loads settings and routines after hydration. */
  useEffect(() => {
    const storedSettings =
      readJson(SETTINGS, {});

    const storedRoutines =
      readJson(
        ROUTINES_STORAGE_KEY,
        [],
      );

    setSettings({
      ...defaultSettings,
      ...storedSettings,
    });

    setRoutines(
      storedRoutines.map(
        (routine) => ({
          ...routine,
          unit: normalizeUnit(
            routine.unit,
          ),
        }),
      ),
    );

    setDark(
      localStorage.getItem(
        DARK_MODE_STORAGE_KEY,
      ) === "1",
    );

    setHydrated(true);
  }, []);

  /* Reacts to global settings changes. */
  useEffect(() => {
    function handleSettingsChange(
      event,
    ) {
      const updatedSettings =
        event.detail ||
        readJson(SETTINGS, {});

      setSettings(
        (currentSettings) => ({
          ...currentSettings,
          ...updatedSettings,
        }),
      );
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

  /* Saves routines after initial loading. */
  useEffect(() => {
    if (!hydrated) {
      return;
    }

    writeJson(
      ROUTINES_STORAGE_KEY,
      routines,
    );
  }, [routines, hydrated]);

  /* Applies direction and dark mode. */
  useEffect(() => {
    if (!hydrated) {
      return;
    }

    const language =
      translations[
      settings.language
      ] || translations.en;

    document.documentElement.lang =
      settings.language;

    document.documentElement.dir =
      language.dir;

    document.documentElement.classList.toggle(
      "dark",
      dark,
    );

    localStorage.setItem(
      DARK_MODE_STORAGE_KEY,
      dark ? "1" : "0",
    );
  }, [
    settings.language,
    dark,
    hydrated,
  ]);

  const visibleRoutines =
    useMemo(() => {
      if (filter === "all") {
        return routines;
      }

      return routines.filter(
        (routine) =>
          (
            routine.days || []
          ).includes(filter),
      );
    }, [routines, filter]);

  /* Opens a fresh routine form. */
  function openNewRoutine() {
    setEditingRoutine(
      createEmptyRoutine(),
    );
  }

  /* Creates or updates a routine. */
  function saveRoutine(form) {
    const normalizedRoutine = {
      ...form,

      id:
        form.id ||
        Date.now(),

      title: String(
        form.title || "",
      ).trim(),

      description: String(
        form.description || "",
      ).trim(),

      unit: normalizeUnit(
        form.unit,
      ),

      days:
        Array.isArray(
          form.days,
        ) && form.days.length
          ? form.days
          : [...ROUTINE_DAYS],

      startTime:
        form.scheduleType ===
          "time"
          ? form.startTime
          : "",

      endTime:
        form.scheduleType ===
          "time"
          ? form.endTime
          : "",
    };

    if (
      !normalizedRoutine.title ||
      !normalizedRoutine.days
        .length
    ) {
      return;
    }

    setRoutines(
      (currentRoutines) => {
        if (!form.id) {
          return [
            ...currentRoutines,
            normalizedRoutine,
          ];
        }

        return currentRoutines.map(
          (routine) =>
            String(
              routine.id,
            ) ===
              String(form.id)
              ? normalizedRoutine
              : routine,
        );
      },
    );

    setEditingRoutine(null);
  }

  /* Deletes a routine after confirmation. */
  function deleteRoutine(
    routineId,
  ) {
    const confirmed =
      window.confirm(
        t(
          "confirmDeleteRoutine",
        ),
      );

    if (!confirmed) {
      return;
    }

    setRoutines(
      (currentRoutines) =>
        currentRoutines.filter(
          (routine) =>
            String(
              routine.id,
            ) !==
            String(routineId),
        ),
    );
  }

  /* Enables or disables a routine. */
  function toggleRoutine(
    routineId,
  ) {
    setRoutines(
      (currentRoutines) =>
        currentRoutines.map(
          (routine) =>
            String(
              routine.id,
            ) ===
              String(routineId)
              ? {
                ...routine,
                enabled:
                  !routine.enabled,
              }
              : routine,
        ),
    );
  }

  /* Creates today's tasks from active routines. */
  function applyToday() {
    const now = new Date();

    const today =
      getLocalIsoDate();

    const weekday =
      JAVASCRIPT_WEEKDAYS[
      now.getDay()
      ];

    const plannerData =
      readJson(KEY, seed);

    const existingTasks =
      Array.isArray(
        plannerData.tasks,
      )
        ? plannerData.tasks
        : [];

    const newTasks = routines
      .filter(
        (routine) =>
          routine.enabled &&
          (
            routine.days || []
          ).includes(weekday),
      )
      .filter(
        (routine) =>
          !existingTasks.some(
            (task) =>
              task.date ===
              today &&
              String(
                task.routineId,
              ) ===
              String(
                routine.id,
              ),
          ),
      )
      .map(
        (
          routine,
          index,
        ) => ({
          id:
            Date.now() +
            index,

          title:
            routine.title,

          description:
            routine.description ||
            "",

          date: today,

          priority:
            routine.priority,

          scheduleType:
            routine.scheduleType,

          startTime:
            routine.scheduleType ===
              "time"
              ? routine.startTime
              : "",

          endTime:
            routine.scheduleType ===
              "time"
              ? routine.endTime
              : "",

          completed: false,

          activityUnit:
            normalizeUnit(
              routine.unit,
            ),

          activityValue: 0,
          prerequisites: [],
          source: "routine",

          routineId:
            routine.id,
        }),
      );

    if (!newTasks.length) {
      window.alert(
        t("routineNothing"),
      );

      return;
    }

    writeJson(KEY, {
      ...plannerData,

      tasks: [
        ...existingTasks,
        ...newTasks,
      ],
    });

    window.alert(
      t("routineApplied", {
        n: newTasks.length,
      }),
    );
  }

  return (
    <div
      className={`appShell ${collapsed
          ? "sideCollapsed"
          : ""
        }`}
    >
      {/* Displays desktop navigation. */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brandMark">
            ✓
          </div>

          <div className="brandText">
            <b>
              {t("brandName")}
            </b>

            <span>
              {t("planner")}
            </span>
          </div>

          <button
            type="button"
            className="collapseBtn"
            onClick={() =>
              setCollapsed(
                (current) =>
                  !current,
              )
            }
            aria-label={t(
              "toggleSidebar",
            )}
          >
            {collapsed
              ? "»"
              : "«"}
          </button>
        </div>

        <nav className="nav">
          <a href="/">
            ⌂{" "}
            <span>
              {t("today")}
            </span>
          </a>

          <a href="/calendar">
            ▦{" "}
            <span>
              {t("calendar")}
            </span>
          </a>

          <a href="/?new=1">
            ＋{" "}
            <span>
              {t("newTask")}
            </span>
          </a>

          <a
            className="active"
            href="/routines"
          >
            ↻{" "}
            <span>
              {t("routines")}
            </span>
          </a>

          <a href="/settings">
            ⚙{" "}
            <span>
              {t("settings")}
            </span>
          </a>
        </nav>
      </aside>

      <div className="main">
        {/* Displays language and theme controls. */}
        <header className="topbar">
          <div className="topLeft">
            <button
              type="button"
              className="mobileMenu"
              onClick={() =>
                setCollapsed(
                  (current) =>
                    !current,
                )
              }
              aria-label={t(
                "toggleSidebar",
              )}
            >
              ☰
            </button>

            <span className="crumb">
              {t("planner")} /{" "}
              {t("routines")}
            </span>
          </div>

          <div className="topActions">
            <LanguageSwitcher />

            <button
              type="button"
              className="iconBtn"
              onClick={() =>
                setDark(
                  (current) =>
                    !current,
                )
              }
              aria-label={
                dark
                  ? t(
                    "lightMode",
                  )
                  : t(
                    "darkMode",
                  )
              }
            >
              {dark
                ? "☀"
                : "☾"}
            </button>
          </div>
        </header>

        <main className="content">
          {/* Displays the routines page heading. */}
          <div className="hero">
            <div>
              <div className="kicker">
                {t("routines")}
              </div>

              <h1>
                {t(
                  "routineTitle",
                )}
              </h1>

              <p>
                {t(
                  "routineSub",
                )}
              </p>
            </div>

            <div className="heroActions">
              <button
                type="button"
                className="ghost"
                onClick={
                  applyToday
                }
              >
                ↻{" "}
                {t(
                  "applyToday",
                )}
              </button>

              <button
                type="button"
                className="primary"
                onClick={
                  openNewRoutine
                }
              >
                ＋{" "}
                {t(
                  "newRoutine",
                )}
              </button>
            </div>
          </div>

          <section className="card routinesPage">
            {/* Filters routines by weekday. */}
            <div className="routineFilters">
              <button
                type="button"
                className={
                  filter === "all"
                    ? "on"
                    : ""
                }
                onClick={() =>
                  setFilter(
                    "all",
                  )
                }
              >
                {t("allDays")}
              </button>

              {ROUTINE_DAYS.map(
                (day) => (
                  <button
                    type="button"
                    key={day}
                    className={
                      filter ===
                        day
                        ? "on"
                        : ""
                    }
                    onClick={() =>
                      setFilter(
                        day,
                      )
                    }
                  >
                    {t(day)}
                  </button>
                ),
              )}
            </div>

            {/* Displays matching routines. */}
            <div className="routineList">
              {visibleRoutines.map(
                (routine) => (
                  <div
                    className={`routineItem ${routine.enabled
                        ? ""
                        : "disabled"
                      }`}
                    key={
                      routine.id
                    }
                  >
                    <div className="routineMain">
                      <div className="routineIcon">
                        ↻
                      </div>

                      <div>
                        <b>
                          {
                            routine.title
                          }
                        </b>

                        <span>
                          {routine.scheduleType ===
                            "time"
                            ? `${routine.startTime} – ${routine.endTime}`
                            : t(
                              "day",
                            )}

                          {" · "}

                          {formatRoutineDays(
                            routine.days ||
                            [],
                          )}
                        </span>

                        {routine.description && (
                          <small className="routineDesc">
                            {
                              routine.description
                            }
                          </small>
                        )}
                      </div>
                    </div>

                    <div className="routineActions">
                      <span
                        className={`tag ${routine.priority}`}
                      >
                        {routine.priority ===
                          "essential"
                          ? t(
                            "essentialLabel",
                          )
                          : routine.priority ===
                            "important"
                            ? t(
                              "importantLabel",
                            )
                            : t(
                              "normal",
                            )}
                      </span>

                      <button
                        type="button"
                        className="miniBtn"
                        onClick={() =>
                          toggleRoutine(
                            routine.id,
                          )
                        }
                        title={t(
                          "enabled",
                        )}
                      >
                        {routine.enabled
                          ? "✓"
                          : "○"}
                      </button>

                      <button
                        type="button"
                        className="miniBtn"
                        onClick={() =>
                          setEditingRoutine(
                            {
                              ...routine,
                            },
                          )
                        }
                        title={t(
                          "edit",
                        )}
                      >
                        ✎
                      </button>

                      <button
                        type="button"
                        className="miniBtn dangerBtn"
                        onClick={() =>
                          deleteRoutine(
                            routine.id,
                          )
                        }
                        title={t(
                          "delete",
                        )}
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ),
              )}

              {!visibleRoutines.length && (
                <div className="empty">
                  {t(
                    "noRoutines",
                  )}
                </div>
              )}
            </div>
          </section>
        </main>

        <RoutinesMobileNav
          lang={
            settings.language
          }
        />
      </div>

      {/* Displays the routine form modal. */}
      {editingRoutine && (
        <RoutineModal
          key={
            editingRoutine.id ||
            "new-routine"
          }
          lang={
            settings.language
          }
          routine={
            editingRoutine
          }
          onClose={() =>
            setEditingRoutine(
              null,
            )
          }
          onSave={
            saveRoutine
          }
        />
      )}
    </div>
  );
}

/* Displays the routine creation and editing form. */
function RoutineModal({
  lang,
  routine,
  onClose,
  onSave,
}) {
  const [form, setForm] =
    useState(() => ({
      ...createEmptyRoutine(),
      ...routine,

      unit: normalizeUnit(
        routine.unit,
      ),

      days: [
        ...(
          routine.days ||
          ROUTINE_DAYS
        ),
      ],
    }));

  /* Returns translated form text. */
  function t(
    key,
    variables = {},
  ) {
    return tr(
      lang,
      key,
      variables,
    );
  }

  /* Updates one routine form field. */
  function handleChange(event) {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setForm(
      (currentForm) => ({
        ...currentForm,

        [name]:
          type ===
            "checkbox"
            ? checked
            : value,
      }),
    );
  }

  /* Adds or removes one repeat day. */
  function toggleDay(day) {
    setForm(
      (currentForm) => ({
        ...currentForm,

        days:
          currentForm.days.includes(
            day,
          )
            ? currentForm.days.filter(
              (
                currentDay,
              ) =>
                currentDay !==
                day,
            )
            : [
              ...currentForm.days,
              day,
            ],
      }),
    );
  }

  /* Validates and submits the routine form. */
  function handleSubmit(event) {
    event.preventDefault();

    onSave({
      ...form,

      title:
        form.title.trim(),

      description:
        form.description.trim(),
    });
  }

  return (
    <Modal
      title={
        routine.id
          ? t(
            "editRoutine",
          )
          : t(
            "newRoutine",
          )
      }
      close={onClose}
    >
      <form
        className="form"
        onSubmit={
          handleSubmit
        }
      >
        <label>
          {t("title")}

          <input
            name="title"
            value={form.title}
            onChange={
              handleChange
            }
            required
            autoFocus
          />
        </label>

        <label>
          {t(
            "routineDescription",
          )}

          <textarea
            name="description"
            rows="3"
            value={
              form.description
            }
            onChange={
              handleChange
            }
          />
        </label>

        <label>
          {t("priority")}

          <select
            name="priority"
            value={
              form.priority
            }
            onChange={
              handleChange
            }
          >
            <option value="normal">
              {t("normal")}
            </option>

            <option value="important">
              {t(
                "importantLabel",
              )}
            </option>

            <option value="essential">
              {t(
                "essentialLabel",
              )}
            </option>
          </select>
        </label>

        <label>
          {t("schedule")}

          <select
            name="scheduleType"
            value={
              form.scheduleType
            }
            onChange={
              handleChange
            }
          >
            <option value="day">
              {t("day")}
            </option>

            <option value="time">
              {t("atTime")}
            </option>
          </select>
        </label>

        {form.scheduleType ===
          "time" && (
            <div className="two timeFields">
              <label>
                {t("start")}

                <input
                  name="startTime"
                  type="time"
                  value={
                    form.startTime
                  }
                  onChange={
                    handleChange
                  }
                  required
                />
              </label>

              <label>
                {t("end")}

                <input
                  name="endTime"
                  type="time"
                  value={
                    form.endTime
                  }
                  onChange={
                    handleChange
                  }
                  required
                />
              </label>
            </div>
          )}

        <label>
          {t("unit")}

          {/* Stores stable values and translates labels. */}
          <select
            name="unit"
            value={form.unit}
            onChange={
              handleChange
            }
          >
            <option value="minute">
              {t(
                "unitMinute",
              )}
            </option>

            <option value="hour">
              {t(
                "unitHour",
              )}
            </option>

            <option value="percent">
              {t(
                "unitPercent",
              )}
            </option>

            <option value="item">
              {t(
                "unitItem",
              )}
            </option>

            <option value="page">
              {t(
                "unitPage",
              )}
            </option>
          </select>
        </label>

        <div className="weekPicker">
          <b>
            {t(
              "routineDays",
            )}
          </b>

          {ROUTINE_DAYS.map(
            (day) => (
              <button
                type="button"
                key={day}
                className={`dayChoice ${form.days.includes(
                  day,
                )
                    ? "on"
                    : ""
                  }`}
                onClick={() =>
                  toggleDay(
                    day,
                  )
                }
              >
                {t(day)}
              </button>
            ),
          )}
        </div>

        <label className="switchRow">
          <span>
            {t("enabled")}
          </span>

          <input
            name="enabled"
            type="checkbox"
            checked={
              form.enabled
            }
            onChange={
              handleChange
            }
          />
        </label>

        <button
          className="primary"
          type="submit"
        >
          {t("save")}
        </button>
      </form>
    </Modal>
  );
}

/* Displays mobile navigation for the routines page. */
function RoutinesMobileNav({
  lang,
}) {
  /* Returns translated navigation text. */
  function t(key) {
    return tr(lang, key);
  }

  return (
    <nav className="mobileNav">
      <a href="/">
        ⌂
        <span>
          {t("today")}
        </span>
      </a>

      <a href="/calendar">
        ▦
        <span>
          {t("calendar")}
        </span>
      </a>

      <a
        href="/?new=1"
        className="add"
      >
        +
        <span>
          {t("newTask")}
        </span>
      </a>

      <a
        className="active"
        href="/routines"
      >
        ↻
        <span>
          {t("routines")}
        </span>
      </a>

      <a href="/settings">
        ⚙
        <span>
          {t("settings")}
        </span>
      </a>
    </nav>
  );
}