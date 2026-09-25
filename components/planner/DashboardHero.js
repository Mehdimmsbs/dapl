import { formatWeekday } from "../../lib/date";
import { tr } from "../../lib/i18n";

/* Displays the dashboard title, date and add-task action. */
export default function DashboardHero({
  date,
  displayDate,
  secondaryDate,
  lang,
  onAddTask,
}) {
  /* Returns translated text for the active language. */
  function t(key, variables) {
    return tr(lang, key, variables);
  }

  return (
    <div className="hero">
      <div>
        <div className="kicker">
          {formatWeekday(date, lang)} · {displayDate}
        </div>

        <h1>{t("focus")}</h1>
        <p>{t("focusSub")}</p>

        {secondaryDate && (
          <span className="secondaryDate">
            {secondaryDate}
          </span>
        )}
      </div>

      <button
        type="button"
        className="primary"
        onClick={onAddTask}
      >
        + {t("newTask")}
      </button>
    </div>
  );
}