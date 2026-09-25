"use client";

import { useLanguage } from "../providers/LanguageProvider";

const NAV_ITEMS = [
  {
    id: "today",
    href: "/",
    symbol: "⌂",
  },
  {
    id: "calendar",
    href: "/calendar",
    symbol: "▦",
  },
  {
    id: "newTask",
    href: "/?new=1",
    symbol: "＋",
  },
  {
    id: "routines",
    href: "/routines",
    symbol: "↻",
  },
  {
    id: "settings",
    href: "/settings",
    symbol: "⚙",
  },
];

/* Displays the shared desktop navigation. */
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
        <div className="brandMark">
          ✓
        </div>

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
        {NAV_ITEMS.map((item) => (
          <a
            key={item.id}
            href={item.href}
            className={
              activePage === item.id
                ? "active"
                : ""
            }
          >
            {item.symbol}

            <span>
              {t(item.id)}
            </span>
          </a>
        ))}
      </nav>

      {displayDate && (
        <div className="sideFooter">
          <small>
            {t("today")}
          </small>

          <strong>
            {displayDate}
          </strong>
        </div>
      )}
    </aside>
  );
}