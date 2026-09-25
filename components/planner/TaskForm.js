"use client";

import { useMemo, useState } from "react";

import {
  addDays,
  formatDate,
  getLocalIsoDate,
} from "../../lib/date";
import { tr } from "../../lib/i18n";
import SelectField from "../ui/SelectField";
import Modal from "../ui/Modal";

/* Displays the form for creating, carrying or editing a task. */
export default function TaskForm({
  lang,
  calendar = "gregorian",
  data,
  date,
  task,
  initialMode = "new",
  onClose,
  onSave,
}) {
  const today = getLocalIsoDate();
  const tomorrow = addDays(today, 1);
  const initialTask = task || {};

  const [mode, setMode] = useState(initialMode);
  const [carryId, setCarryId] = useState("");

  const [taskDate, setTaskDate] = useState(
    initialTask.date ||
    (initialMode === "carry" ? today : date),
  );

  const [title, setTitle] = useState(
    initialTask.title || "",
  );

  const [description, setDescription] = useState(
    initialTask.description || "",
  );

  const [priority, setPriority] = useState(
    initialTask.priority || "normal",
  );

  const [scheduleType, setScheduleType] = useState(
    initialTask.scheduleType || "day",
  );

  const [startTime, setStartTime] = useState(
    initialTask.startTime || "",
  );

  const [endTime, setEndTime] = useState(
    initialTask.endTime || "",
  );

  const [prerequisite, setPrerequisite] = useState(
    initialTask.prerequisites?.[0] || "",
  );

  const [unit, setUnit] = useState(
    initialTask.activityUnit || "minute",
  );

  function t(key, variables) {
    return tr(lang, key, variables);
  }

  /* Finds unfinished tasks from today and the previous two days. */
  const overdueTasks = useMemo(() => {
    const carryFrom = addDays(today, -2);

    return data.tasks
      .filter(
        (item) =>
          !item.completed &&
          item.date >= carryFrom &&
          item.date <= today &&
          String(item.id) !== String(initialTask.id),
      )
      .sort((firstTask, secondTask) =>
        firstTask.date.localeCompare(secondTask.date),
      );
  }, [data.tasks, initialTask.id, today]);

  const availablePrerequisites = data.tasks.filter(
    (item) =>
      !item.completed &&
      item.date === taskDate &&
      String(item.id) !== String(task?.id) &&
      String(item.id) !== String(carryId),
  );

  /* Clears values when returning from Carry over to New task. */
  function resetNewTask() {
    setCarryId("");
    setTaskDate(date);
    setTitle("");
    setDescription("");
    setPriority("normal");
    setScheduleType("day");
    setStartTime("");
    setEndTime("");
    setPrerequisite("");
    setUnit("minute");
  }

  /* Changes between a new task and an unfinished task. */
  function changeMode(event) {
    const nextMode = event.target.value;

    setMode(nextMode);

    if (nextMode === "carry") {
      setCarryId("");
      setTaskDate(today);
      return;
    }

    resetNewTask();
  }

  /* Prefills fields from the selected unfinished task. */
  function chooseCarryTask(event) {
    const selectedId = event.target.value;

    const selectedTask = overdueTasks.find(
      (item) =>
        String(item.id) === String(selectedId),
    );

    setCarryId(selectedId);

    if (!selectedTask) {
      return;
    }

    setTitle(selectedTask.title || "");
    setDescription(selectedTask.description || "");
    setPriority(selectedTask.priority || "normal");
    setScheduleType(
      selectedTask.scheduleType || "day",
    );
    setStartTime(selectedTask.startTime || "");
    setEndTime(selectedTask.endTime || "");
    setPrerequisite("");
    setUnit(
      selectedTask.activityUnit || "minute",
    );
  }

  const modalTitle = task
    ? t("editTask")
    : t("addFor", {
      date: formatDate(
        taskDate,
        calendar,
        lang,
      ),
    });

  return (
    <Modal title={modalTitle} close={onClose}>
      <form className="form" onSubmit={onSave}>
        <input
          type="hidden"
          name="id"
          value={task?.id || ""}
        />

        <input
          type="hidden"
          name="carryId"
          value={
            mode === "carry"
              ? carryId
              : ""
          }
        />

        {!task && (
          <label>
            {t("taskSource")}

            <SelectField
              value={mode}
              onChange={changeMode}
            >
              <option value="new">
                {t("newTaskSource")}
              </option>

              <option value="carry">
                {t("carryTaskSource")}
              </option>
            </SelectField>
          </label>
        )}

        {!task && mode === "carry" && (
          <label>
            {t("carryTaskLabel")}

            <SelectField
              value={carryId}
              onChange={chooseCarryTask}
              required
            >
              <option value="">
                {t("selectCarryTask")}
              </option>

              {overdueTasks.map((item) => (
                <option
                  key={item.id}
                  value={item.id}
                >
                  {item.title} —{" "}
                  {formatDate(
                    item.date,
                    calendar,
                    lang,
                  )}
                </option>
              ))}
            </SelectField>
          </label>
        )}

        <label>
          {t("taskDate")}

          <input
            name="date"
            type="date"
            required
            value={taskDate}
            min={
              mode === "carry"
                ? today
                : undefined
            }
            max={
              mode === "carry"
                ? tomorrow
                : undefined
            }
            onChange={(event) => {
              setTaskDate(event.target.value);
            }}
          />

          {mode === "carry" && (
            <small className="formHint">
              {t("carryTargets")}
            </small>
          )}
        </label>

        <label>
          {t("title")}

          <input
            name="title"
            required
            autoFocus={mode === "new"}
            value={title}
            onChange={(event) => {
              setTitle(event.target.value);
            }}
          />
        </label>

        <label>
          {t("description")}

          <textarea
            name="description"
            rows="3"
            value={description}
            onChange={(event) => {
              setDescription(
                event.target.value,
              );
            }}
          />
        </label>

        <label>
          {t("priority")}

          <SelectField
            name="priority"
            value={priority}
            onChange={(event) => {
              setPriority(event.target.value);
            }}
          >
            <option value="normal">
              {t("normal")}
            </option>

            <option value="important">
              {t("importantLabel")}
            </option>

            <option value="essential">
              {t("essentialLabel")}
            </option>
          </SelectField>
        </label>

        <label>
          {t("schedule")}

          <SelectField
            name="scheduleType"
            value={scheduleType}
            onChange={(event) => {
              setScheduleType(
                event.target.value,
              );
            }}
          >
            <option value="day">
              {t("day")}
            </option>

            <option value="time">
              {t("atTime")}
            </option>
          </SelectField>
        </label>

        {scheduleType === "time" && (
          <div className="two timeFields">
            <label>
              {t("start")}

              <input
                name="startTime"
                type="time"
                required
                value={startTime}
                onChange={(event) => {
                  setStartTime(
                    event.target.value,
                  );
                }}
              />
            </label>

            <label>
              {t("end")}

              <input
                name="endTime"
                type="time"
                required
                value={endTime}
                onChange={(event) => {
                  setEndTime(
                    event.target.value,
                  );
                }}
              />
            </label>
          </div>
        )}

        <label>
          {t("prerequisite")}

          <SelectField
            name="prerequisite"
            value={prerequisite}
            onChange={(event) => {
              setPrerequisite(
                event.target.value,
              );
            }}
          >
            <option value="">
              {t("none")}
            </option>

            {availablePrerequisites.map(
              (item) => (
                <option
                  key={item.id}
                  value={item.id}
                >
                  {item.title}
                </option>
              ),
            )}
          </SelectField>
        </label>

        <label>
          {t("unit")}

          <SelectField
            name="unit"
            value={unit}
            onChange={(event) => {
              setUnit(event.target.value);
            }}
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
          </SelectField>
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