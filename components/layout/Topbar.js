"use client";

import Link from "next/link";
import { authClient } from "../../lib/auth-client";
import { useLanguage } from "../providers/LanguageProvider";
import AppIcon from "../ui/AppIcon";
import LanguageSwitcher from "./LanguageSwitcher";
import styles from "../../styles/components/_topbar-account.module.scss";

export default function Topbar({ activePage, onToggleMenu, mobileMenuOpen }) {
  const { dark, t, toggleDark } = useLanguage();
  const { data: session, isPending } = authClient.useSession();
  const accountName = session?.user?.name?.trim() || t("accountTitle");

  return (
    <header className="topbar">
      <div className="topLeft">
        <button
          type="button"
          className="mobileMenu"
          onClick={onToggleMenu}
          aria-label={t("toggleSidebar")}
          aria-expanded={mobileMenuOpen}
        >
          <AppIcon name="menu" size={22} />
        </button>
        <nav className="breadcrumb" aria-label={t("planner")}>
          <Link href="/">{t("planner")}</Link>
          <span aria-hidden="true">/</span>
          <strong>{t(activePage)}</strong>
        </nav>
      </div>
      <div className="topActions">
        <LanguageSwitcher />
        <span className="topbarDivider" aria-hidden="true" />
        <button
          type="button"
          className="iconBtn themeButton"
          onClick={toggleDark}
          aria-label={t(dark ? "lightMode" : "darkMode")}
        >
          <AppIcon name={dark ? "sun" : "moon"} size={22} />
        </button>
        {isPending ? (
          <span className={styles.loading} role="status">
            {t("accountLoading")}
          </span>
        ) : (
          <Link
            href="/account"
            className={styles.account}
            title={session ? accountName : t("accountLogin")}
          >
            <span className={styles.name} dir="auto">
              {session ? accountName : t("accountLogin")}
            </span>
            <AppIcon name="chevron-right" size={15} />
          </Link>
        )}
      </div>
    </header>
  );
}
