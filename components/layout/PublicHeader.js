"use client";

import Link from "next/link";
import { authClient } from "../../lib/auth-client";
import { useLanguage } from "../providers/LanguageProvider";
import BrandLogo from "../ui/BrandLogo";
import LanguageSwitcher from "./LanguageSwitcher";
import styles from "../../styles/pages/_welcome.module.scss";
import controls from "../../styles/pages/_public-header.module.scss";

export default function PublicHeader() {
  const { t } = useLanguage();
  const { data: session, isPending } = authClient.useSession();

  const accountName = session?.user?.name?.trim() || t("accountTitle");

  return (
    <header className={`${styles.header} ${controls.header}`}>
      <Link
        href="/welcome"
        className={styles.brand}
        aria-label={t("brandName")}
      >
        <BrandLogo width={60} />
        <strong>{t("brandName")}</strong>
      </Link>

      <nav className={controls.actions} aria-label={t("planner")}>
        <LanguageSwitcher className={styles.sharedLanguage} />

        {isPending ? (
          <span role="status">{t("accountLoading")}</span>
        ) : (
          <Link href="/account" className={controls.account}>
            <span dir="auto">
              {session?.user ? accountName : t("accountLogin")}
            </span>
          </Link>
        )}
      </nav>
    </header>
  );
}
