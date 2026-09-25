"use client";

import LanguageSwitcher from "./LanguageSwitcher";
import { useLanguage } from "../providers/LanguageProvider";

/* Displays shared language and appearance actions. */
export default function Topbar({
  activePage,
  onOpenSettings,
  onToggleMenu,
}) {
  const {
    dark,
    t,
    toggleDark,
  } = useLanguage();

  const avatarText = t("brandName")
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
          {t("planner")} /{" "}
          {t(activePage)}
        </span>
      </div>

      <div className="topActions">
        <LanguageSwitcher />

        <button
          type="button"
          className="iconBtn"
          onClick={toggleDark}
          aria-label={
            dark
              ? t("lightMode")
              : t("darkMode")
          }
        >
          {dark ? "☀" : "☾"}
        </button>

        {onOpenSettings ? (
          <button
            type="button"
            className="iconBtn"
            onClick={onOpenSettings}
            aria-label={t("settings")}
          >
            ⚙
          </button>
        ) : (
          <a
            className="iconBtn"
            href="/settings"
            aria-label={t("settings")}
          >
            ⚙
          </a>
        )}

        <div
          className="avatar"
          aria-hidden="true"
        >
          {avatarText}
        </div>
      </div>
    </header>
  );
}