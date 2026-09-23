import { tr } from "../../lib/i18n";

/* Displays one task and its available actions. */
export default function TaskItem({
  task,
  data,
  toggle,
  complete,
  edit,
  remove,
  lang,
}) {
  /* Finds an unfinished prerequisite that blocks this task. */
  const blockedTask = (task.prerequisites || [])
    .map((id) => data.tasks.find((item) => item.id === id))
    .find((item) => item && !item.completed);

  /* Creates translated labels for each priority. */
  const priorityLabels = {
    essential: tr(lang, "essentialLabel"),
    important: tr(lang, "importantLabel"),
    normal: tr(lang, "normal"),
  };

  return (
    <div className={`task ${task.completed ? "done" : ""}`}>
      <button
        type="button"
        className="check"
        onClick={() => toggle(task)}
      >
        {task.completed ? "✓" : blockedTask ? "🔒" : "○"}
      </button>

      <div className="taskInfo">
        <div className="taskTitle">{task.title}</div>

        <div className="taskMeta">
          {task.scheduleType === "time"
            ? `⏰ ${task.startTime} – ${task.endTime}`
            : `◷ ${tr(lang, "day")}`}

          {blockedTask
            ? ` · ${tr(lang, "prereqNeeds", {
                x: blockedTask.title,
              })}`
            : ""}
        </div>

        {task.description && (
          <div className="taskDesc">
            {task.description}
          </div>
        )}
      </div>

      <span className={`tag ${task.priority}`}>
        {priorityLabels[task.priority]}
      </span>

      <div className="taskActions">
        <button
          type="button"
          className="miniBtn"
          onClick={edit}
          title={tr(lang, "edit")}
        >
          ✎
        </button>

        <button
          type="button"
          className="miniBtn dangerBtn"
          onClick={remove}
          title={tr(lang, "delete")}
        >
          ×
        </button>

        {!task.completed && !blockedTask && (
          <button
            type="button"
            className="completeBtn"
            onClick={complete}
          >
            {tr(lang, "saveResult")}
          </button>
        )}
      </div>
    </div>
  );
}