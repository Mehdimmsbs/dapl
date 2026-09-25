"use client";

import { useLanguage } from "../providers/LanguageProvider";
import AppIcon from "../ui/AppIcon";
import Link from "next/link";

const NAV_ITEMS = [
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
    id: "newTask",
    href: "/?new=1",
    icon: "add",
    featured: true,
  },
  {
    id: "routines",
    href: "/routines",
    icon: "routine",
  },
  {
    id: "settings",
    href: "/settings",
    icon: "settings",
  },
];

/* Displays the shared Aurora mobile navigation. */
export default function MobileNav({ activePage }) {
  const { t } = useLanguage();

  return (
    <nav
      className="mobileNav"
      aria-label={t("planner")}
    >
      {NAV_ITEMS.map((item) => {
        const isActive = activePage === item.id;

        const className = [
          isActive ? "active" : "",
          item.featured ? "featured" : "",
        ].filter(Boolean).join(" ");

        return (
          <Link
            key={item.id}
            href={item.href}
            className={className}
            aria-current={isActive ? "page" : undefined}
          >
            <span className="mobileNavIcon">
              <AppIcon
                name={item.icon}
                size={item.featured ? 25 : 21}
              />
            </span>

            <span className="mobileNavLabel">
              {t(item.id)}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}