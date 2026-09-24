"use client";

import { useLanguage } from "../providers/LanguageProvider";
import AppIcon from "../ui/AppIcon";
import LanguageSwitcher from "./LanguageSwitcher";

export default function Topbar({
  activePage,
  onOpenSettings,
  onToggleMenu,
}) {
  const { dark, t, toggleDark } = useLanguage();

  const avatarText =
    t("brandName").trim().slice(0, 1).toUpperCase() || "M";

  const profileContent = (
    <>
      <span className="avatar" aria-hidden="true">
        {avatarText}
      </span>

      <AppIcon
        name="chevron-down"
        size={15}
        className="profileChevron"
      />
    </>
  );

  return (
    <header className="topbar">
      <div className="topLeft">
        <button
          type="button"
          className="mobileMenu"
          onClick={onToggleMenu}
          aria-label={t("toggleSidebar")}
        >
          <AppIcon name="menu" size={22} />
        </button>

        <nav className="breadcrumb" aria-label="Breadcrumb">
          <a href="/">{t("planner")}</a>

          <span aria-hidden="true">/</span>

          <strong>{t(activePage)}</strong>
        </nav>
      </div>

      <div className="topActions">
        <LanguageSwitcher />

        <span
          className="topbarDivider"
          aria-hidden="true"
        />

        <button
          type="button"
          className="iconBtn themeButton"
          onClick={toggleDark}
          aria-label={dark ? t("lightMode") : t("darkMode")}
        >
          <AppIcon
            name={dark ? "sun" : "moon"}
            size={22}
          />
        </button>

        {onOpenSettings ? (
          <button
            type="button"
            className="profileButton"
            onClick={onOpenSettings}
            aria-label={t("settings")}
          >
            {profileContent}
          </button>
        ) : (
          <a
            href="/settings"
            className="profileButton"
            aria-label={t("settings")}
          >
            {profileContent}
          </a>
        )}
      </div>
    </header>
  );
}