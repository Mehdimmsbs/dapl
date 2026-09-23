import { tr } from "../../lib/i18n";

/* Displays the desktop sidebar and primary navigation. */
export default function AppSidebar({
  collapsed,
  displayDate,
  lang,
  onToggle,
}) {
  /* Returns translated text for the selected language. */
  function t(key) {
    return tr(lang, key);
  }

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brandMark">✓</div>

        <div className="brandText">
          <b>{t("brandName")}</b>
          <span>{t("planner")}</span>
        </div>

        <button
          type="button"
          className="collapseBtn"
          onClick={onToggle}
          aria-label={t("toggleSidebar")}
        >
          {collapsed ? "»" : "«"}
        </button>
      </div>

      <nav className="nav">
        <a className="active" href="/">
          ⌂ <span>{t("today")}</span>
        </a>

        <a href="/calendar">
          ▦ <span>{t("calendar")}</span>
        </a>

        <a href="/?new=1">
          ＋ <span>{t("newTask")}</span>
        </a>

        <a href="/routines">
          ↻ <span>{t("routines")}</span>
        </a>

        <a href="/settings">
          ⚙ <span>{t("settings")}</span>
        </a>
      </nav>

      <div className="sideFooter">
        <small>{t("today")}</small>
        <strong>{displayDate}</strong>
      </div>
    </aside>
  );
}