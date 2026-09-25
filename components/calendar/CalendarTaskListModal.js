"use client";

import { formatDate } from "../../lib/date";
import Modal from "../ui/Modal";
import { useLanguage } from "../providers/LanguageProvider";

/* Displays tasks belonging to one calendar day. */
export default function CalendarTaskListModal({
    date,
    settings,
    tasks,
    onAdd,
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
                        className="calendarTask"
                        key={task.id}
                    >
                        <b>{task.title}</b>

                        <span>
                            {task.completed
                                ? "✓ "
                                : ""}

                            {task.scheduleType ===
                                "time"
                                ? `${task.startTime} – ${task.endTime}`
                                : t("day")}
                        </span>
                    </div>
                ))}
            </div>

            <button
                type="button"
                className="primary full"
                onClick={onAdd}
            >
                + {t("newTask")}
            </button>
        </Modal>
    );
}