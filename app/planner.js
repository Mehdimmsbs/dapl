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
  formatDate,
  isoToday,
} from "../lib/date";

import { tr } from "../lib/i18n";

import AppSidebar from "../components/layout/AppSidebar";
import MobileNav from "../components/layout/MobileNav";
import Topbar from "../components/layout/Topbar";

import CompletionModal from "../components/planner/CompletionModal";
import DashboardHero from "../components/planner/DashboardHero";
import DashboardSidebar from "../components/planner/DashboardSidebar";
import SettingsModal from "../components/planner/SettingsModal";
import TaskForm from "../components/planner/TaskForm";
import TodayTasksCard from "../components/planner/TodayTasksCard";

const ROUTINES_STORAGE_KEY =
  "personal-daily-planner-routines-v8";

const DARK_MODE_STORAGE_KEY = "pdp-dark";
const SELECTED_DATE_STORAGE_KEY = "pdp-selected-date";

const WEEKDAYS = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

/* Controls planner data, settings and dashboard interactions. */
export default function Planner() {
  const [data, setData] = useState(seed);
  const [settings, setSettings] =
    useState(defaultSettings);
  const [date, setDate] = useState(isoToday);
  const [modal, setModal] = useState(null);
  const [filter, setFilter] = useState("all");
  const [hydrated, setHydrated] = useState(false);
  const [dark, setDark] = useState(false);
  const [collapsed, setCollapsed] =
    useState(false);
  const [routines, setRoutines] = useState([]);

  /* Returns translated text for the active language. */
  function t(key, variables) {
    return tr(settings.language, key, variables);
  }

  /* Loads saved planner data after the browser mounts. */
  useEffect(() => {
    try {
      const savedData = localStorage.getItem(KEY);
      const savedSettings =
        localStorage.getItem(SETTINGS);
      const savedRoutines = localStorage.getItem(
        ROUTINES_STORAGE_KEY,
      );

      if (savedData) {
        setData(JSON.parse(savedData));
      }

      if (savedSettings) {
        setSettings({
          ...defaultSettings,
          ...JSON.parse(savedSettings),
        });
      }

      if (savedRoutines) {
        setRoutines(JSON.parse(savedRoutines));
      }

      setDark(
        localStorage.getItem(
          DARK_MODE_STORAGE_KEY,
        ) === "1",
      );
    } catch (error) {
      console.error(
        "Could not load planner data.",
        error,
      );
    }

    setHydrated(true);
  }, []);

  /* Saves planner data and visual preferences locally. */
  useEffect(() => {
    if (!hydrated) {
      return;
    }

    localStorage.setItem(
      KEY,
      JSON.stringify(data),
    );

    localStorage.setItem(
      SETTINGS,
      JSON.stringify(settings),
    );

    localStorage.setItem(
      DARK_MODE_STORAGE_KEY,
      dark ? "1" : "0",
    );

    document.documentElement.lang =
      settings.language;

    document.documentElement.classList.toggle(
      "dark",
      dark,
    );
  }, [data, settings, dark, hydrated]);

  /* Synchronizes planner state with the language provider. */
  useEffect(() => {
    function handleSettingsChange(event) {
      setSettings((currentSettings) => ({
        ...currentSettings,
        ...event.detail,
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

  /* Restores calendar navigation and URL actions. */
  useEffect(() => {
    const selectedDate = localStorage.getItem(
      SELECTED_DATE_STORAGE_KEY,
    );

    if (selectedDate) {
      setDate(selectedDate);

      localStorage.removeItem(
        SELECTED_DATE_STORAGE_KEY,
      );
    }

    const query = new URLSearchParams(
      window.location.search,
    );

    if (query.get("new") === "1") {
      setModal("add");
    }
  }, []);

  const todayWeekday =
    WEEKDAYS[
      new Date(`${date}T12:00:00`).getDay()
    ];

  const todayRoutines = routines.filter(
    (routine) =>
      routine.enabled &&
      (routine.days || []).includes(todayWeekday),
  );

  const tasks = useMemo(
    () =>
      data.tasks.filter(
        (task) => task.date === date,
      ),
    [data.tasks, date],
  );

  const visibleTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (filter === "remaining") {
        return !task.completed;
      }

      if (filter === "essential") {
        return task.priority === "essential";
      }

      if (filter === "important") {
        return task.priority === "important";
      }

      if (filter === "normal") {
        return task.priority === "normal";
      }

      return true;
    });
  }, [tasks, filter]);

  const completedCount = tasks.filter(
    (task) => task.completed,
  ).length;

  const importantTotal = tasks.filter(
    (task) => task.priority !== "normal",
  ).length;

  const importantCount = tasks.filter(
    (task) => task.priority === "important",
  ).length;

  const essentialCount = tasks.filter(
    (task) => task.priority === "essential",
  ).length;

  const normalCount = tasks.filter(
    (task) => task.priority === "normal",
  ).length;

  const completionPercent = tasks.length
    ? Math.round(
        (completedCount / tasks.length) * 100,
      )
    : 0;

  const displayDate = formatDate(
    date,
    settings.calendar,
    settings.language,
  );

  const secondaryDate =
    settings.secondaryCalendar !== "none"
      ? formatDate(
          date,
          settings.secondaryCalendar,
          settings.language,
          true,
        )
      : "";

  const editingTask =
    modal?.type === "edit"
      ? data.tasks.find(
          (task) => task.id === modal.id,
        )
      : null;

  /* Toggles task completion when prerequisites are finished. */
  function toggleTask(task) {
    const isBlocked = (
      task.prerequisites || []
    ).some((prerequisiteId) => {
      const prerequisiteTask = data.tasks.find(
        (item) => item.id === prerequisiteId,
      );

      return !prerequisiteTask?.completed;
    });

    if (isBlocked) {
      return;
    }

    setData((currentData) => ({
      ...currentData,
      tasks: currentData.tasks.map((item) => {
        if (item.id !== task.id) {
          return item;
        }

        const completed = !item.completed;

        return {
          ...item,
          completed,
          completedAt: completed
            ? new Date().toISOString()
            : null,
        };
      }),
    }));
  }

  /* Creates a new task or updates an existing task. */
  function saveTask(event) {
    event.preventDefault();

    const form = new FormData(event.currentTarget);
    const prerequisite = form.get("prerequisite");
    const priority = form.get("priority");
    const taskId = form.get("id");
    const numericTaskId = taskId
      ? Number(taskId)
      : null;

    const currentImportantCount = tasks.filter(
      (task) =>
        task.priority !== "normal" &&
        String(task.id) !== String(taskId),
    ).length;

    const currentEssentialCount = tasks.filter(
      (task) =>
        task.priority === "essential" &&
        String(task.id) !== String(taskId),
    ).length;

    if (
      priority !== "normal" &&
      currentImportantCount >= 7
    ) {
      window.alert(t("maxImportant"));
      return;
    }

    if (
      priority === "essential" &&
      currentEssentialCount >= 3
    ) {
      window.alert(t("maxEssential"));
      return;
    }

    const scheduleType = form.get("scheduleType");

    const existingTask = numericTaskId
      ? data.tasks.find(
          (task) => task.id === numericTaskId,
        )
      : null;

    const nextTask = {
      id: numericTaskId || Date.now(),
      title: form.get("title"),
      description: form.get("description") || "",
      date,
      priority,
      scheduleType,
      startTime:
        scheduleType === "time"
          ? form.get("startTime") || ""
          : "",
      endTime:
        scheduleType === "time"
          ? form.get("endTime") || ""
          : "",
      completed: existingTask?.completed || false,
      activityUnit: form.get("unit"),
      activityValue:
        existingTask?.activityValue || 0,
      prerequisites: prerequisite
        ? [Number(prerequisite)]
        : [],
    };

    setData((currentData) => ({
      ...currentData,
      tasks: numericTaskId
        ? currentData.tasks.map((task) =>
            task.id === numericTaskId
              ? {
                  ...task,
                  ...nextTask,
                }
              : task,
          )
        : [...currentData.tasks, nextTask],
    }));

    setModal(null);
  }

  /* Deletes a task and removes its prerequisite references. */
  function removeTask(task) {
    const confirmed = window.confirm(
      t("confirmDeleteTask"),
    );

    if (!confirmed) {
      return;
    }

    setData((currentData) => ({
      ...currentData,
      tasks: currentData.tasks
        .filter((item) => item.id !== task.id)
        .map((item) => ({
          ...item,
          prerequisites: (
            item.prerequisites || []
          ).filter(
            (prerequisiteId) =>
              prerequisiteId !== task.id,
          ),
        })),
    }));

    setModal(null);
  }

  /* Saves completion details for the selected task. */
  function completeTask(event) {
    event.preventDefault();

    const form = new FormData(event.currentTarget);
    const taskId = Number(form.get("id"));
    const activityValue = Number(
      form.get("value") || 0,
    );
    const description = form.get("desc");

    setData((currentData) => ({
      ...currentData,
      tasks: currentData.tasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              completed: true,
              activityValue,
              description:
                description || task.description,
              completedAt:
                new Date().toISOString(),
            }
          : task,
      ),
    }));

    setModal(null);
  }

  /* Saves preferences and informs the language provider. */
  function saveSettings(event) {
    event.preventDefault();

    const form = new FormData(event.currentTarget);

    const nextSettings = {
      language: form.get("language"),
      calendar: form.get("calendar"),
      secondaryCalendar: form.get(
        "secondaryCalendar",
      ),
      firstDay: form.get("firstDay"),
      hijriMethod: form.get("hijriMethod"),
    };

    setSettings((currentSettings) => ({
      ...currentSettings,
      ...nextSettings,
    }));

    window.dispatchEvent(
      new CustomEvent("dapl:settings-changed", {
        detail: nextSettings,
      }),
    );

    setModal(null);
  }

  /* Opens the completion modal for a task. */
  function openCompletionModal(taskId) {
    setModal({
      type: "complete",
      id: taskId,
    });
  }

  /* Opens the edit modal for a task. */
  function openEditModal(taskId) {
    setModal({
      type: "edit",
      id: taskId,
    });
  }

  return (
    <>
      <div
        className={`appShell ${
          collapsed ? "sideCollapsed" : ""
        }`}
      >
        <AppSidebar
          collapsed={collapsed}
          displayDate={displayDate}
          lang={settings.language}
          onToggle={() =>
            setCollapsed((value) => !value)
          }
        />

        <div className="main">
          <Topbar
            dark={dark}
            lang={settings.language}
            onToggleMenu={() =>
              setCollapsed((value) => !value)
            }
            onToggleDark={() =>
              setDark((value) => !value)
            }
            onOpenSettings={() =>
              setModal("settings")
            }
          />

          <main className="content">
            <DashboardHero
              date={date}
              displayDate={displayDate}
              secondaryDate={secondaryDate}
              lang={settings.language}
              onAddTask={() => setModal("add")}
            />

            <div className="dashboardGrid">
              <TodayTasksCard
                data={data}
                tasks={tasks}
                visibleTasks={visibleTasks}
                displayDate={displayDate}
                filter={filter}
                completedCount={completedCount}
                essentialCount={essentialCount}
                importantCount={importantCount}
                normalCount={normalCount}
                completionPercent={
                  completionPercent
                }
                lang={settings.language}
                onFilterChange={setFilter}
                onToggleTask={toggleTask}
                onCompleteTask={
                  openCompletionModal
                }
                onEditTask={openEditModal}
                onRemoveTask={removeTask}
              />

              <DashboardSidebar
                tasks={tasks}
                todayRoutines={todayRoutines}
                completedCount={completedCount}
                essentialCount={essentialCount}
                importantTotal={importantTotal}
                lang={settings.language}
                onAddTask={() => setModal("add")}
                onOpenSettings={() =>
                  setModal("settings")
                }
              />
            </div>
          </main>

          <MobileNav lang={settings.language} />
        </div>
      </div>

      {(modal === "add" ||
        modal?.type === "edit") && (
        <TaskForm
          lang={settings.language}
          data={data}
          date={date}
          task={editingTask}
          onClose={() => setModal(null)}
          onSave={saveTask}
        />
      )}

      {modal?.type === "complete" && (
        <CompletionModal
          taskId={modal.id}
          lang={settings.language}
          onClose={() => setModal(null)}
          onSubmit={completeTask}
        />
      )}

      {modal === "settings" && (
        <SettingsModal
          settings={settings}
          lang={settings.language}
          onClose={() => setModal(null)}
          onSubmit={saveSettings}
        />
      )}
    </>
  );
}