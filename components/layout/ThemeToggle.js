"use client";

import { useLanguage } from "../providers/LanguageProvider";
import AppIcon from "../ui/AppIcon";
import styles from "../../styles/components/_theme-toggle.module.scss";

export default function ThemeToggle({ sidebar = false }) {
  const { dark, toggleDark, t } = useLanguage();
  const label = t(dark ? "lightMode" : "darkMode");

  return (
    <button
      type="button"
      className={sidebar ? "navThemeButton" : styles.toggle}
      onClick={toggleDark}
      aria-label={label}
      data-tooltip={label}
    >
      <AppIcon name={dark ? "sun" : "moon"} size={22} />
      <span className={sidebar ? "navLabel" : undefined}>{label}</span>
    </button>
  );
}
