"use client";

import { useLanguage } from "../providers/LanguageProvider";
import AppIcon from "../ui/AppIcon";
import BrandLogo from "../ui/BrandLogo";
import Link from "next/link";

const NAV_ITEMS = [
  {
    id: "newTask",
    href: "/?new=1",
    icon: "add",
  },
  {
    id: "today",
    href: "/",
    icon: "home",
  },
  {
    id: "calendar",
    href: "/calendar",
    icon: "calendar",
  },
  {
    id: "routines",
    href: "/routines",
    icon: "routines",
  },
  {
    id: "settings",
    href: "/settings",
    icon: "settings",
  },
];

export default function AppSidebar({
  activePage,
  collapsed,
  displayDate,
  onToggle,
}) {
  const { t } = useLanguage();

  return (
    <aside className="sidebar">
      <div className="brand">
        <Link
          href="/"
          className="brandIdentity"
          aria-label={t("brandName")}
        >
          <BrandLogo />

          <div className="brandText">
            <strong>{t("brandName")}</strong>
            <span>{t("planner")}</span>
          </div>
        </Link>

        <button
          type="button"
          className="collapseBtn"
          onClick={onToggle}
          aria-label={t("toggleSidebar")}
          aria-expanded={!collapsed}
        >
          <AppIcon
            name={collapsed ? "chevron-right" : "chevron-left"}
            size={18}
          />
        </button>
      </div>

      <nav className="nav">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className={activePage === item.id ? "active" : ""}
          >
            <AppIcon name={item.icon} />

            <span>{t(item.id)}</span>
          </Link>
        ))}
      </nav>

      {displayDate && (
        <div className="sideFooter">
          <small>{t("today")}</small>
          <strong>{displayDate}</strong>
        </div>
      )}
    </aside>
  );
}