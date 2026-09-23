import { tr } from "../../lib/i18n";
import Modal from "../ui/Modal";

/* Displays the form for completing a task. */
export default function CompletionModal({
  taskId,
  lang,
  onClose,
  onSubmit,
}) {
  /* Returns translated text for the active language. */
  function t(key, variables) {
    return tr(lang, key, variables);
  }

  return (
    <Modal title={t("result")} close={onClose}>
      <form className="form" onSubmit={onSubmit}>
        <input
          type="hidden"
          name="id"
          value={taskId}
        />

        <label>
          {t("activity")}

          <input
            name="value"
            type="number"
            min="0"
            placeholder="0"
          />
        </label>

        <label>
          {t("description")}

          <textarea
            name="desc"
            rows="5"
          />
        </label>

        <button className="primary">
          {t("saveResult")}
        </button>
      </form>
    </Modal>
  );
}