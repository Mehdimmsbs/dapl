"use client";

import Link from "next/link";
import { Moon, Sun } from "lucide-react";
import { authClient } from "../../lib/auth-client";
import { useLanguage } from "../providers/LanguageProvider";
import BrandLogo from "../ui/BrandLogo";
import LanguageSwitcher from "./LanguageSwitcher";
import styles from "../../styles/pages/_welcome.module.scss";
import controls from "../../styles/pages/_public-header.module.scss";

export default function PublicHeader({ guide = false, back = false, copy }) {
  const { t, dark, toggleDark } = useLanguage();
  const { data: session, isPending } = authClient.useSession();

  return (
    <header className={`${styles.header} ${controls.header}`}>
      <Link
        href="/welcome"
        className={styles.brand}
        aria-label={t("brandName")}
      >
        <BrandLogo width={60} />
        <strong>My Day</strong>
      </Link>
      <nav className={controls.actions} aria-label={t("planner")}>
        <LanguageSwitcher className={styles.sharedLanguage} />
        <button
          type="button"
          className={controls.theme}
          onClick={toggleDark}
          aria-label={t(dark ? "lightMode" : "darkMode")}
          title={t(dark ? "lightMode" : "darkMode")}
        >
          {dark ? (
            <Sun size={20} aria-hidden="true" />
          ) : (
            <Moon size={20} aria-hidden="true" />
          )}
        </button>
        <Link
          href={guide || back ? "/welcome" : "/welcome/guide"}
          className={controls.link}
        >
          {guide || back ? copy.back : copy.guide}
        </Link>
        {isPending ? (
          <span role="status">{t("accountLoading")}</span>
        ) : session ? (
          <Link href="/account" className={controls.account}>
            {session.user.name || t("accountTitle")}
          </Link>
        ) : (
          <>
            <Link href="/account" className={controls.link}>
              {t("accountLogin")}
            </Link>
            <Link href="/account?mode=register" className={controls.account}>
              {t("accountRegister")}
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
