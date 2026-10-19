"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import PublicHeader from "../../components/layout/PublicHeader";
import AccountSettings from "../../components/settings/AccountSettings";
import { useLanguage } from "../../components/providers/LanguageProvider";
import { WaveBackdrop } from "../welcome/OrbitScene";
import { messages } from "../welcome/messages";
import styles from "../../styles/pages/_welcome.module.scss";
import controls from "../../styles/pages/_public-header.module.scss";

function AccountContent() {
  const params = useSearchParams();
  const mode = params.get("mode") === "register" ? "register" : "login";
  const { t, locale } = useLanguage();
  const copy = messages[locale] ?? messages.en;
  return <div className={styles.welcome}>
    <WaveBackdrop />
    <PublicHeader back copy={copy} />
    <main className={`${controls.accountMain} settingsControls`}>
      <h1>{t("accountTitle")}</h1>
      <AccountSettings key={mode} initialMode={mode} showAuthForm />
      <Link href="/" className={styles.primary}>{copy.open}</Link>
    </main>
  </div>;
}

export default function AccountPage() {
  return <Suspense fallback={null}><AccountContent /></Suspense>;
}
