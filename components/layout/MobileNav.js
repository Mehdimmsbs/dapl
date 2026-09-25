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
    symbol: "+",
    add: true,
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

/* Displays the shared mobile navigation. */
export default function MobileNav({
  activePage,
}) {
  const { t } = useLanguage();

  return (
    <nav className="mobileNav">
      {NAV_ITEMS.map((item) => {
        const classNames = [
          item.add ? "add" : "",
          activePage === item.id
            ? "active"
            : "",
        ]
          .filter(Boolean)
          .join(" ");

        return (
          <a
            key={item.id}
            href={item.href}
            className={classNames}
          >
            {item.symbol}

            <span>
              {t(item.id)}
            </span>
          </a>
        );
      })}
    </nav>
  );
}