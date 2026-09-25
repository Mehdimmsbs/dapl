import { formatDate } from "../../lib/date";
import { tr } from "../../lib/i18n";
import Modal from "../ui/Modal";

/* Displays all information stored for one task. */
export default function TaskDetailsModal({
    task,
    data,
    calendar,
    lang,
    onClose,
    onEdit,
    onRemove,
    canEdit = true,
}) {
    function t(key, variables) {
        return tr(lang, key, variables);
    }

    const priorityLabels = {
        essential: t("essentialLabel"),
        important: t("importantLabel"),
        normal: t("normal"),
    };

    const unitLabels = {
        minute: t("unitMinute"),
        hour: t("unitHour"),
        percent: t("unitPercent"),
        item: t("unitItem"),
        page: t("unitPage"),
    };

    const prerequisiteTitles = (
        task.prerequisites || []
    )
        .map((id) =>
            data.tasks.find(
                (item) =>
                    String(item.id) === String(id),
            ),
        )
        .filter(Boolean)
        .map((item) => item.title);

    return (
        <Modal title={t("taskDetails")} close={onClose}>
            <div className="taskDetails">
                <h3>{task.title}</h3>

                {task.description && (
                    <p>{task.description}</p>
                )}

                <dl>
                    <div>
                        <dt>{t("taskDate")}</dt>
                        <dd>
                            {formatDate(
                                task.date,
                                calendar,
                                lang,
                            )}
                        </dd>
                    </div>

                    <div>
                        <dt>{t("status")}</dt>
                        <dd>
                            {task.completed
                                ? t("done")
                                : t("remaining")}
                        </dd>
                    </div>

                    <div>
                        <dt>{t("priority")}</dt>
                        <dd>
                            {priorityLabels[task.priority] ||
                                priorityLabels.normal}
                        </dd>
                    </div>

                    <div>
                        <dt>{t("schedule")}</dt>
                        <dd>
                            {task.scheduleType === "time"
                                ? `${task.startTime} – ${task.endTime}`
                                : t("day")}
                        </dd>
                    </div>

                    <div>
                        <dt>{t("unit")}</dt>
                        <dd>
                            {task.activityValue || 0}{" "}
                            {unitLabels[task.activityUnit] ||
                                task.activityUnit}
                        </dd>
                    </div>

                    <div>
                        <dt>{t("prerequisite")}</dt>
                        <dd>
                            {prerequisiteTitles.length
                                ? prerequisiteTitles.join(", ")
                                : t("none")}
                        </dd>
                    </div>

                    {task.carriedFromDate && (
                        <div>
                            <dt>{t("carriedFrom")}</dt>
                            <dd>
                                {formatDate(
                                    task.carriedFromDate,
                                    calendar,
                                    lang,
                                )}
                            </dd>
                        </div>
                    )}
                </dl>

                <div className="modalActions">
                    {canEdit && (
                        <button
                            type="button"
                            className="ghost"
                            onClick={onEdit}
                        >
                            {t("edit")}
                        </button>
                    )}

                    <button
                        type="button"
                        className="miniBtn dangerBtn"
                        onClick={onRemove}
                    >
                        {t("delete")}
                    </button>
                </div>
            </div>
        </Modal>
    );
}