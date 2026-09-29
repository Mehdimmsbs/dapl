"use client";

import { formatDate } from "../../lib/date";
import { useLanguage } from "../providers/LanguageProvider";
import Modal from "../ui/Modal";

export default function CalendarTaskListModal({
    date,
    settings,
    tasks,
    canAdd,
    onAdd,
    onOpenTask,
    onRemoveTask,
    onClose,
}) {
    const { t } = useLanguage();

    const priorityLabel = (priority) =>
        t(priority === "normal" ? "normal" : `${priority}Label`);

    return (
        <Modal
            title={formatDate(date, settings.calendar, settings.language)}
            close={onClose}
        >
            <div className="calendarDayModal">
                <div className="calendarDaySummary">
                    <strong>{t("completedOf", {
                        n: tasks.filter((task) => task.completed).length,
                        n2: tasks.length,
                    })}</strong>
                </div>

                <div className="calendarTaskList">
                    {tasks.map((task) => (
                        <div className="calendarTaskEntry" key={task.id}>
                            <button
                                type="button"
                                className="calendarTaskOpen"
                                onClick={() => onOpenTask(task.id)}
                            >
                                <span className={`calendarTaskPriority ${task.priority}`} />

                                <span className="calendarTaskContent">
                                    <strong>{task.title}</strong>
                                    <small>
                                        {task.scheduleType === "time"
                                            ? `${task.startTime} – ${task.endTime}`
                                            : t("day")}
                                    </small>
                                </span>

                                <span className="calendarTaskBadges">
                                    <span className={`calendarPriorityBadge ${task.priority}`}>
                                        {priorityLabel(task.priority)}
                                    </span>
                                    {task.completed && (
                                        <span className="calendarDoneBadge">{t("done")}</span>
                                    )}
                                </span>
                            </button>

                            <button
                                type="button"
                                className="calendarTaskDelete"
                                aria-label={`${t("delete")}: ${task.title}`}
                                onClick={() => onRemoveTask(task.id)}
                            >
                                ×
                            </button>
                        </div>
                    ))}

                    {!tasks.length && <div className="empty">{t("noTasks")}</div>}
                </div>

                {canAdd && (
                    <button type="button" className="primary" onClick={onAdd}>
                        + {t("newTask")}
                    </button>
                )}
            </div>
        </Modal>
    );
}