"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useLanguage } from "../../../components/providers/LanguageProvider";
import LanguageSwitcher from "../../../components/layout/LanguageSwitcher";
import BrandLogo from "../../../components/ui/BrandLogo";
import { messages } from "../messages";
import { WaveBackdrop } from "../OrbitScene";
import styles from "../welcome.module.scss";

export default function GuidePage() {
  const { locale } = useLanguage();
  const copy = messages[locale] ?? messages.en;
  return (
    <div className={styles.welcome}>
      <WaveBackdrop />
      <header className={styles.header}>
        <Link href="/welcome" className={styles.brand}>
          <BrandLogo width={60} />
          <strong>My Day</strong>
        </Link>
        <div className={styles.headerActions}>
          <LanguageSwitcher className={styles.sharedLanguage} />
          <Link href="/welcome" className={styles.headerLink}>
            {copy.back}
          </Link>
        </div>
      </header>
      <main className={styles.guideMain}>
        <p className={styles.eyebrow}>MY DAY / {copy.guide}</p>
        <h1>{copy.guideTitle}</h1>
        <p className={styles.intro}>{copy.guideIntro}</p>
        <ol className={styles.guideSteps}>
          {copy.steps.map(([title, text], i) => (
            <li key={title}>
              <span>{String(i + 1).padStart(2, "0")}</span>
              <h2>{title}</h2>
              <p>{text}</p>
            </li>
          ))}
        </ol>
        <h2 className={styles.faqTitle}>{copy.faqTitle}</h2>
        <div className={styles.faq}>
          {copy.faq.map(([question, answer]) => (
            <details key={question}>
              <summary>{question}</summary>
              <p>{answer}</p>
            </details>
          ))}
        </div>
        <Link href="/" className={styles.primary}>
          {copy.open}
          <ArrowUpRight size={20} />
        </Link>
      </main>
      <footer className={styles.footer}>
        <strong>My Day</strong>
        <p>{copy.footer}</p>
      </footer>
    </div>
  );
}
