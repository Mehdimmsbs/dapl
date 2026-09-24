"use client";

import {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    KEY,
    SETTINGS,
    seed,
    defaultSettings,
} from "./data";

import {
    tr,
    translations,
} from "../lib/i18n";

import {
    formatDate,
    calendarParts,
    addDays,
    monthTitle,
    weekdayIndex,
    monthDates,
} from "../lib/date";

import LanguageSwitcher from "../components/layout/LanguageSwitcher";
import Modal from "../components/ui/Modal";

const WEEKDAYS = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
];

/* Safely reads JSON data from local storage. */
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

/* Returns today's local date in ISO format. */
function getLocalIsoDate() {
    const now = new Date();

    const localDate = new Date(
        now.getTime() -
        now.getTimezoneOffset() * 60000,
    );

    return localDate
        .toISOString()
        .slice(0, 10);
}

/* Finds a date inside the previous or next calendar month. */
function getAdjacentMonthDate(
    currentDate,
    direction,
    calendar,
) {
    const currentMonth = monthTitle(
        currentDate,
        calendar,
        "en",
    );

    let candidate = addDays(
        currentDate,
        direction * 20,
    );

    while (
        monthTitle(
            candidate,
            calendar,
            "en",
        ) === currentMonth
    ) {
        candidate = addDays(
            candidate,
            direction,
        );
    }

    return candidate;
}

/* Displays the multilingual calendar page. */
export default function CalendarPage() {
    const [data, setData] =
        useState(seed);

    const [settings, setSettings] =
        useState(defaultSettings);

    const [anchor, setAnchor] =
        useState(getLocalIsoDate);

    const [selected, setSelected] =
        useState(null);

    const [modal, setModal] =
        useState(null);

    const [hydrated, setHydrated] =
        useState(false);

    /* Loads saved tasks and settings. */
    useEffect(() => {
        setData(
            readJson(KEY, seed),
        );

        setSettings({
            ...defaultSettings,
            ...readJson(SETTINGS, {}),
        });

        setHydrated(true);
    }, []);

    /* Saves task changes after initial hydration. */
    useEffect(() => {
        if (!hydrated) {
            return;
        }

        localStorage.setItem(
            KEY,
            JSON.stringify(data),
        );

        window.dispatchEvent(
            new Event("pdp-storage"),
        );
    }, [data, hydrated]);

    /* Reloads settings after a language change. */
    useEffect(() => {
        function reloadSettings() {
            setSettings({
                ...defaultSettings,
                ...readJson(SETTINGS, {}),
            });
        }

        window.addEventListener(
            "dapl:settings-changed",
            reloadSettings,
        );

        return () => {
            window.removeEventListener(
                "dapl:settings-changed",
                reloadSettings,
            );
        };
    }, []);

    /* Updates the document language and direction. */
    useEffect(() => {
        const activeLanguage =
            translations[settings.language] ??
            translations.en;

        document.documentElement.lang =
            settings.language;

        document.documentElement.dir =
            activeLanguage.dir;
    }, [settings.language]);

    /* Returns translated text with optional variables. */
    function t(key, variables = {}) {
        return tr(
            settings.language,
            key,
            variables,
        );
    }

    /* Creates all dates belonging to the visible month. */
    const days = useMemo(
        () =>
            monthDates(
                anchor,
                settings.calendar,
            ),
        [anchor, settings.calendar],
    );

    /* Groups tasks by their ISO date. */
    const tasksByDate = useMemo(() => {
        return data.tasks.reduce(
            (groupedTasks, task) => {
                if (!groupedTasks[task.date]) {
                    groupedTasks[task.date] = [];
                }

                groupedTasks[task.date].push(
                    task,
                );

                return groupedTasks;
            },
            {},
        );
    }, [data.tasks]);

    const firstDayOfMonth =
        days[0];

    const weekStartIndex =
        settings.firstDay === "sunday"
            ? 0
            : 6;

    const leadingEmptyCells =
        firstDayOfMonth
            ? (
                weekdayIndex(
                    firstDayOfMonth,
                ) -
                weekStartIndex +
                7
            ) % 7
            : 0;

    const calendarCells = [
        ...Array(
            leadingEmptyCells,
        ).fill(null),
        ...days,
    ];

    /* Returns the tasks belonging to one date. */
    function getTasksForDate(date) {
        return tasksByDate[date] ?? [];
    }

    /* Opens either the task list or add-task form. */
    function chooseDate(date) {
        setSelected(date);

        const existingTasks =
            getTasksForDate(date);

        setModal(
            existingTasks.length > 0
                ? "day"
                : "add",
        );
    }

    /* Moves the calendar to another month. */
    function shiftMonth(direction) {
        const nextAnchor =
            getAdjacentMonthDate(
                anchor,
                direction,
                settings.calendar,
            );

        setAnchor(nextAnchor);
    }

    /* Adds a newly created calendar task. */
    function addTask(task) {
        setData((currentData) => ({
            ...currentData,
            tasks: [
                ...currentData.tasks,
                task,
            ],
        }));

        setModal(null);
    }

    return (
        <div className="appShell">
            {/* Displays desktop navigation. */}
            <aside className="sidebar">
                <div className="brand">
                    <div className="brandMark">
                        ✓
                    </div>

                    <div className="brandText">
                        <b>{t("brandName")}</b>
                        <span>
                            {t("planner")}
                        </span>
                    </div>
                </div>

                <nav className="nav">
                    <a href="/">
                        ⌂{" "}
                        <span>
                            {t("today")}
                        </span>
                    </a>

                    <a
                        className="active"
                        href="/calendar"
                    >
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

                    <a href="/routines">
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
                {/* Displays page navigation and language selection. */}
                <header className="topbar">
                    <span className="crumb">
                        {t("planner")} /{" "}
                        {t("calendar")}
                    </span>

                    <div className="topActions">
                        <LanguageSwitcher />
                    </div>
                </header>

                <main className="content">
                    {/* Displays the calendar heading. */}
                    <div className="hero">
                        <div>
                            <div className="kicker">
                                {t("calendar")}
                            </div>

                            <h1>
                                {t("calendarTitle")}
                            </h1>

                            <p>
                                {t("calendarSub")}
                            </p>
                        </div>
                    </div>

                    <section className="card calendarWrap">
                        <div className="calendarToolbar">
                            <div className="monthTitle">
                                <h1>
                                    {monthTitle(
                                        anchor,
                                        settings.calendar,
                                        settings.language,
                                    )}
                                </h1>

                                <span>
                                    {days.length}{" "}
                                    {t("days")}
                                </span>
                            </div>

                            <div className="monthActions">
                                <button
                                    type="button"
                                    className="ghost"
                                    onClick={() =>
                                        shiftMonth(-1)
                                    }
                                >
                                    {t("monthPrev")}
                                </button>

                                <button
                                    type="button"
                                    className="ghost"
                                    onClick={() =>
                                        setAnchor(
                                            getLocalIsoDate(),
                                        )
                                    }
                                >
                                    {t("monthToday")}
                                </button>

                                <button
                                    type="button"
                                    className="ghost"
                                    onClick={() =>
                                        shiftMonth(1)
                                    }
                                >
                                    {t("monthNext")}
                                </button>
                            </div>
                        </div>

                        <div className="calGrid">
                            {/* Displays translated weekday names. */}
                            {Array.from(
                                { length: 7 },
                                (_, index) => {
                                    const weekdayIndexValue =
                                        (
                                            weekStartIndex +
                                            index
                                        ) % 7;

                                    const weekday =
                                        WEEKDAYS[
                                        weekdayIndexValue
                                        ];

                                    return (
                                        <div
                                            className="calHead"
                                            key={weekday}
                                        >
                                            {t(weekday)}
                                        </div>
                                    );
                                },
                            )}

                            {/* Displays every visible calendar day. */}
                            {calendarCells.map(
                                (date, index) => {
                                    if (!date) {
                                        return (
                                            <div
                                                className="calBlank"
                                                key={`blank-${index}`}
                                            />
                                        );
                                    }

                                    const tasks =
                                        getTasksForDate(date);

                                    const hasEssential =
                                        tasks.some(
                                            (task) =>
                                                task.priority ===
                                                "essential",
                                        );

                                    const hasImportant =
                                        tasks.some(
                                            (task) =>
                                                task.priority ===
                                                "important",
                                        );

                                    const hasCompleted =
                                        tasks.some(
                                            (task) =>
                                                task.completed,
                                        );

                                    return (
                                        <button
                                            type="button"
                                            key={date}
                                            className={`calDay ${date === selected
                                                    ? "selected"
                                                    : ""
                                                }`}
                                            onClick={() =>
                                                chooseDate(date)
                                            }
                                        >
                                            <span className="dayNum">
                                                {
                                                    calendarParts(
                                                        date,
                                                        settings.calendar,
                                                        settings.language,
                                                    ).day
                                                }
                                            </span>

                                            <div className="dots">
                                                {hasEssential && (
                                                    <i className="dot r" />
                                                )}

                                                {hasImportant && (
                                                    <i className="dot p" />
                                                )}

                                                {hasCompleted && (
                                                    <i className="dot g" />
                                                )}
                                            </div>

                                            {tasks.length > 0 && (
                                                <span className="count">
                                                    {t(
                                                        "dayCount",
                                                        {
                                                            n: tasks.length,
                                                        },
                                                    )}
                                                </span>
                                            )}
                                        </button>
                                    );
                                },
                            )}
                        </div>
                    </section>
                </main>

                <CalendarMobileNav
                    lang={settings.language}
                />
            </div>

            {/* Displays tasks belonging to the selected day. */}
            {modal === "day" &&
                selected && (
                    <Modal
                        title={formatDate(
                            selected,
                            settings.calendar,
                            settings.language,
                        )}
                        close={() =>
                            setModal(null)
                        }
                    >
                        <div className="calendarTaskList">
                            {getTasksForDate(
                                selected,
                            ).map((task) => (
                                <div
                                    className="calendarTask"
                                    key={task.id}
                                >
                                    <b>{task.title}</b>

                                    <span>
                                        {task.completed
                                            ? "✓ "
                                            : ""}

                                        {task.scheduleType ===
                                            "time"
                                            ? `${task.startTime} – ${task.endTime}`
                                            : t("day")}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <button
                            type="button"
                            className="primary full"
                            onClick={() =>
                                setModal("add")
                            }
                        >
                            + {t("newTask")}
                        </button>
                    </Modal>
                )}

            {/* Displays the add-task form. */}
            {modal === "add" &&
                selected && (
                    <AddCalendarTask
                        date={selected}
                        lang={settings.language}
                        calendar={
                            settings.calendar
                        }
                        onSave={addTask}
                        onClose={() =>
                            setModal(null)
                        }
                    />
                )}
        </div>
    );
}

/* Displays the calendar task creation form. */
function AddCalendarTask({
    date,
    lang,
    calendar,
    onSave,
    onClose,
}) {
    const [scheduleType, setScheduleType] =
        useState("day");

    /* Returns translated form text. */
    function t(key, variables = {}) {
        return tr(
            lang,
            key,
            variables,
        );
    }

    /* Creates and sends a new task. */
    function saveTask(event) {
        event.preventDefault();

        const formData =
            new FormData(
                event.currentTarget,
            );

        const title = String(
            formData.get("title") ?? "",
        ).trim();

        if (!title) {
            return;
        }

        const task = {
            id: Date.now(),
            title,
            description: String(
                formData.get(
                    "description",
                ) ?? "",
            ).trim(),
            date,
            priority:
                formData.get("priority"),
            scheduleType,
            startTime:
                scheduleType === "time"
                    ? formData.get(
                        "startTime",
                    )
                    : "",
            endTime:
                scheduleType === "time"
                    ? formData.get("endTime")
                    : "",
            completed: false,
            activityUnit:
                formData.get("unit"),
            activityValue: 0,
            prerequisites: [],
        };

        onSave(task);
    }

    return (
        <Modal
            title={t("addFor", {
                date: formatDate(
                    date,
                    calendar,
                    lang,
                ),
            })}
            close={onClose}
        >
            <form
                className="form"
                onSubmit={saveTask}
            >
                <label>
                    {t("title")}

                    <input
                        name="title"
                        required
                        autoFocus
                    />
                </label>

                <label>
                    {t("description")}

                    <textarea
                        name="description"
                        rows="3"
                    />
                </label>

                <label>
                    {t("priority")}

                    <select
                        name="priority"
                        defaultValue="normal"
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
                        value={scheduleType}
                        onChange={(event) =>
                            setScheduleType(
                                event.target.value,
                            )
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

                {scheduleType ===
                    "time" && (
                        <div className="two timeFields">
                            <label>
                                {t("start")}

                                <input
                                    name="startTime"
                                    type="time"
                                    required
                                />
                            </label>

                            <label>
                                {t("end")}

                                <input
                                    name="endTime"
                                    type="time"
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
                        defaultValue="minute"
                    >
                        <option value="minute">
                            {t("unitMinute")}
                        </option>

                        <option value="hour">
                            {t("unitHour")}
                        </option>

                        <option value="percent">
                            {t("unitPercent")}
                        </option>

                        <option value="item">
                            {t("unitItem")}
                        </option>

                        <option value="page">
                            {t("unitPage")}
                        </option>
                    </select>
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

/* Displays mobile navigation for the calendar page. */
function CalendarMobileNav({
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
                <span>{t("today")}</span>
            </a>

            <a
                className="active"
                href="/calendar"
            >
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

            <a href="/routines">
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