import { tr } from "../../lib/i18n";
import TaskItem from "./TaskItem";

/* Displays today's tasks, progress and filter controls. */
export default function TodayTasksCard({
  data,
  tasks,
  visibleTasks,
  displayDate,
  filter,
  completedCount,
  essentialCount,
  importantCount,
  normalCount,
  completionPercent,
  lang,
  onFilterChange,
  onToggleTask,
  onCompleteTask,
  onEditTask,
  onRemoveTask,
}) {
  /* Returns translated text for the active language. */
  function t(key, variables) {
    return tr(lang, key, variables);
  }

  /* Activates a filter or resets it when selected again. */
  function toggleFilter(filterName) {
    onFilterChange(
      filter === filterName ? "all" : filterName,
    );
  }

  return (
    <section className="card todayCard">
      <div className="cardHeader">
        <div>
          <h2>{t("today")}</h2>

          <p>
            {t("completedOf", {
              n: completedCount,
              n2: tasks.length,
            })}
          </p>
        </div>

        <span className="datePill">
          {displayDate}
        </span>
      </div>

      <div className="progressRow">
        <span>{t("progress")}</span>
        <b>{completionPercent}%</b>
      </div>

      <div className="progress">
        <i
          style={{
            width: `${completionPercent}%`,
          }}
        />
      </div>

      <div className="filterBar">
        <button
          type="button"
          className={
            filter === "essential" ? "on" : ""
          }
          onClick={() => toggleFilter("essential")}
        >
          {t("essentialLabel")} <b>{essentialCount}</b>
        </button>

        <button
          type="button"
          className={
            filter === "important" ? "on" : ""
          }
          onClick={() => toggleFilter("important")}
        >
          {t("importantLabel")} <b>{importantCount}</b>
        </button>

        <button
          type="button"
          className={
            filter === "normal" ? "on" : ""
          }
          onClick={() => toggleFilter("normal")}
        >
          {t("normal")} <b>{normalCount}</b>
        </button>

        <button
          type="button"
          className={
            filter === "remaining" ? "on" : ""
          }
          onClick={() => toggleFilter("remaining")}
        >
          {t("remaining")}
        </button>
      </div>

      <div className="taskList">
        {visibleTasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            data={data}
            toggle={onToggleTask}
            complete={() => onCompleteTask(task.id)}
            edit={() => onEditTask(task.id)}
            remove={() => onRemoveTask(task)}
            lang={lang}
          />
        ))}

        {!visibleTasks.length && (
          <div className="empty">
            {t("noTasks")}
          </div>
        )}
      </div>
    </section>
  );
}