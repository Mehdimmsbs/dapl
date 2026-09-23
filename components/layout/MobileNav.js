import { tr } from "../../lib/i18n";

/* Displays the main navigation on mobile devices. */
export default function MobileNav({ lang }) {
  /* Returns translated text for the active language. */
  function t(key) {
    return tr(lang, key);
  }

  return (
    <nav className="mobileNav">
      <a href="/">
        ⌂
        <span>{t("today")}</span>
      </a>

      <a href="/calendar">
        ▦
        <span>{t("calendar")}</span>
      </a>

      <a href="/?new=1" className="add">
        +
        <span>{t("newTask")}</span>
      </a>

      <a href="/routines">
        ↻
        <span>{t("routines")}</span>
      </a>

      <a href="/settings">
        ⚙
        <span>{t("settings")}</span>
      </a>
    </nav>
  );
}