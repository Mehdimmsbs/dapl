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

    return (
        <Modal
            title={formatDate(
                date,
                settings.calendar,
                settings.language,
            )}
            close={onClose}
        >
            <div className="calendarTaskList">
                {tasks.map((task) => (
                    <div
                        className="calendarTask calendarTaskEntry"
                        key={task.id}
                    >
                        <button
                            type="button"
                            className="calendarTaskOpen"
                            onClick={() => {
                                onOpenTask(task.id);
                            }}
                        >
                            <b>{task.title}</b>

                            <span>
                                {task.completed
                                    ? "✓ "
                                    : ""}

                                {task.scheduleType === "time"
                                    ? `${task.startTime} – ${task.endTime}`
                                    : t("day")}
                            </span>
                        </button>

                        <button
                            type="button"
                            className="miniBtn dangerBtn"
                            aria-label={`${t("delete")}: ${task.title}`}
                            onClick={() => {
                                onRemoveTask(task.id);
                            }}
                        >
                            ×
                        </button>
                    </div>
                ))}

                {!tasks.length && (
                    <div className="empty">
                        {t("noTasks")}
                    </div>
                )}
            </div>

            {canAdd && (
                <button
                    type="button"
                    className="primary full"
                    onClick={onAdd}
                >
                    + {t("newTask")}
                </button>
            )}
        </Modal>
    );
}