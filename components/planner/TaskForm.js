"use client";

import { useState } from "react";
import { tr } from "../../lib/i18n";
import { formatDate } from "../../lib/date";
import Modal from "../ui/Modal";

/* Displays the form for creating or editing a task. */
export default function TaskForm({
  lang,
  calendar = "gregorian",
  data,
  date,
  task,
  onClose,
  onSave,
}) {
  const [taskDate, setTaskDate] = useState(
    task?.date || date,
  );

  function t(key, variables) {
    return tr(lang, key, variables);
  }

  function handleScheduleChange(event) {
    const timeFields =
      event.currentTarget.form.querySelector(".timeFields");

    if (timeFields) {
      timeFields.hidden = event.target.value !== "time";
    }
  }

  function handleDateChange(event) {
    setTaskDate(event.target.value);
  }

  const modalTitle = task
    ? t("editTask")
    : t("addFor", {
      date: formatDate(taskDate, calendar, lang),
    });

  const availablePrerequisites = data.tasks.filter(
    (item) =>
      !item.completed &&
      item.date === taskDate &&
      String(item.id) !== String(task?.id),
  );

  return (
    <Modal title={modalTitle} close={onClose}>
      <form className="form" onSubmit={onSave}>
        <input
          type="hidden"
          name="id"
          value={task?.id || ""}
        />

        <label>
          {t("title")}
          <input
            name="title"
            required
            autoFocus
            defaultValue={task?.title || ""}
          />
        </label>

        <label>
          {t("description")}
          <textarea
            name="description"
            rows="3"
            defaultValue={task?.description || ""}
          />
        </label>

        <label>
          {t("taskDate")}
          <input
            name="date"
            type="date"
            required
            value={taskDate}
            onChange={handleDateChange}
          />
        </label>

        <label>
          {t("priority")}
          <select
            name="priority"
            defaultValue={task?.priority || "normal"}
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
          </select>
        </label>

        <label>
          {t("schedule")}
          <select
            name="scheduleType"
            defaultValue={task?.scheduleType || "day"}
            onChange={handleScheduleChange}
          >
            <option value="day">
              {t("day")}
            </option>

            <option value="time">
              {t("atTime")}
            </option>
          </select>
        </label>

        <div
          className="two timeFields"
          hidden={task?.scheduleType !== "time"}
        >
          <label>
            {t("start")}
            <input
              name="startTime"
              type="time"
              defaultValue={task?.startTime || ""}
            />
          </label>

          <label>
            {t("end")}
            <input
              name="endTime"
              type="time"
              defaultValue={task?.endTime || ""}
            />
          </label>
        </div>

        <label>
          {t("prerequisite")}
          <select
            name="prerequisite"
            defaultValue={task?.prerequisites?.[0] || ""}
          >
            <option value="">
              {t("none")}
            </option>

            {availablePrerequisites.map((item) => (
              <option key={item.id} value={item.id}>
                {item.title}
              </option>
            ))}
          </select>
        </label>

        <label>
          {t("unit")}
          <select
            name="unit"
            defaultValue={task?.activityUnit || "minute"}
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

        <button className="primary" type="submit">
          {t("save")}
        </button>
      </form>
    </Modal>
  );
}