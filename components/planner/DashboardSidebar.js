import { tr } from "../../lib/i18n";
import CarryOverCard from "./CarryOverCard";

/* Displays statistics, quick actions and today's routines. */
export default function DashboardSidebar({
  tasks,
  todayRoutines,
  carryTasks,
  carryToday,
  carryTomorrow,
  calendar,
  completedCount,
  essentialCount,
  importantTotal,
  lang,
  onAddTask,
  onCarryTask,
  onOpenSettings,
}) {
  /* Returns translated text for the active language. */
  function t(key, variables) {
    return tr(lang, key, variables);
  }

  return (
    <aside>
      <div className="stats">
        <div className="stat purple">
          <div className="num">{tasks.length}</div>
          <small>{t("total")}</small>
        </div>

        <div className="stat yellow">
          <div className="num">
            {importantTotal}/7
          </div>
          <small>{t("important")}</small>
        </div>

        <div className="stat red">
          <div className="num">
            {essentialCount}/3
          </div>
          <small>{t("essential")}</small>
        </div>

        <div className="stat green">
          <div className="num">
            {completedCount}
          </div>
          <small>{t("done")}</small>
        </div>
      </div>
      <CarryOverCard
        tasks={carryTasks}
        today={carryToday}
        tomorrow={carryTomorrow}
        calendar={calendar}
        lang={lang}
        onMoveTask={onCarryTask}
      />

      <div className="card quick">
        <div className="cardHeader">
          <h2>{t("quick")}</h2>
        </div>

        <div className="quickGrid">
          <button type="button" onClick={onAddTask}>
            <b>+ {t("newTask")}</b>
          </button>

          <button
            type="button"
            onClick={() => {
              window.location.href = "/calendar";
            }}
          >
            <b>▦ {t("calendar")}</b>
          </button>

          <button
            type="button"
            onClick={() => {
              window.location.href = "/routines";
            }}
          >
            <b>↻ {t("routines")}</b>
          </button>

          <button
            type="button"
            onClick={onOpenSettings}
          >
            <b>⚙ {t("settings")}</b>
          </button>
        </div>
      </div>

      <div className="card routineMini">
        <div className="cardHeader">
          <div>
            <h2>↻ {t("routines")}</h2>

            <p>
              {todayRoutines.length} {t("routines")}
            </p>
          </div>

          <button
            type="button"
            className="ghost"
            onClick={() => {
              window.location.href = "/routines";
            }}
          >
            {t("edit")}
          </button>
        </div>

        <div className="routineMiniList">
          {todayRoutines
            .slice(0, 5)
            .map((routine) => {
              const routineTask = tasks.find(
                (task) =>
                  task.routineId === routine.id,
              );

              return (
                <div
                  className="routineMiniItem"
                  key={routine.id}
                >
                  <span
                    className={`routineStatus ${routineTask?.completed
                      ? "done"
                      : ""
                      }`}
                  >
                    {routineTask?.completed
                      ? "✓"
                      : "○"}
                  </span>

                  <div>
                    <b>{routine.title}</b>

                    <small>
                      {routine.scheduleType === "time"
                        ? `${routine.startTime} – ${routine.endTime}`
                        : t("day")}
                    </small>
                  </div>
                </div>
              );
            })}

          {!todayRoutines.length && (
            <div className="empty">
              {t("noRoutines")}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}