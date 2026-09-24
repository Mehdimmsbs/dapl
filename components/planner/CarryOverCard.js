import { formatDate } from "../../lib/date";
import { tr } from "../../lib/i18n";

/* Displays unfinished tasks that can be moved forward. */
export default function CarryOverCard({
    tasks,
    today,
    tomorrow,
    calendar,
    lang,
    onMoveTask,
}) {
    function t(key, variables) {
        return tr(lang, key, variables);
    }

    return (
        <div className="card carryCard">
            <div className="cardHeader">
                <div>
                    <h2>{t("carryOver")}</h2>
                    <p>{t("carryWindow")}</p>
                </div>
            </div>

            <div className="routineMiniList">
                {tasks.map((task) => (
                    <div
                        className="routineMiniItem carryItem"
                        key={task.id}
                    >
                        <div>
                            <b>{task.title}</b>

                            <small>
                                {formatDate(
                                    task.date,
                                    calendar,
                                    lang,
                                    true,
                                )}
                            </small>
                        </div>

                        <div className="carryActions">
                            <button
                                type="button"
                                className="ghost"
                                disabled={task.date === today}
                                onClick={() => {
                                    onMoveTask(task.id, today);
                                }}
                            >
                                {t("moveToToday")}
                            </button>

                            <button
                                type="button"
                                className="ghost"
                                onClick={() => {
                                    onMoveTask(task.id, tomorrow);
                                }}
                            >
                                {t("moveToTomorrow")}
                            </button>
                        </div>
                    </div>
                ))}

                {!tasks.length && (
                    <div className="empty">
                        {t("noCarryTasks")}
                    </div>
                )}
            </div>
        </div>
    );
}