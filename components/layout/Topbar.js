import { tr } from "../../lib/i18n";
import LanguageSwitcher from "./LanguageSwitcher";

/* Displays page navigation, language and appearance actions. */
export default function Topbar({
  dark,
  lang,
  onOpenSettings,
  onToggleDark,
  onToggleMenu,
}) {
  /* Returns translated text for the selected language. */
  function t(key) {
    return tr(lang, key);
  }

  const brandName = t("brandName");
  const avatarText = brandName
    .trim()
    .slice(0, 1)
    .toUpperCase();

  return (
    <header className="topbar">
      <div className="topLeft">
        <button
          type="button"
          className="mobileMenu"
          onClick={onToggleMenu}
          aria-label={t("toggleSidebar")}
        >
          ☰
        </button>

        <span className="crumb">
          {t("planner")} / {t("today")}
        </span>
      </div>

      <div className="topActions">
        {/* Allows the user to change the application language. */}
        <LanguageSwitcher />

        <button
          type="button"
          className="iconBtn"
          onClick={onToggleDark}
          aria-label={
            dark ? t("lightMode") : t("darkMode")
          }
        >
          {dark ? "☀" : "☾"}
        </button>

        <button
          type="button"
          className="iconBtn"
          onClick={onOpenSettings}
          aria-label={t("settings")}
        >
          ⚙
        </button>

        <div className="avatar" aria-hidden="true">
          {avatarText}
        </div>
      </div>
    </header>
  );
}