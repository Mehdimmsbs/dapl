"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import PublicHeader from "../../components/layout/PublicHeader";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  CalendarDays,
  Check,
  RefreshCw,
  Settings,
  ShieldCheck,
} from "lucide-react";
import { useLanguage } from "../../components/providers/LanguageProvider";
import OrbitScene, { WaveBackdrop } from "./OrbitScene";
import { messages } from "./messages";
import styles from "../../styles/pages/_welcome.module.scss";

const ITEMS = [
  { id: "today", href: "/", Icon: Check, color: "violet" },
  { id: "calendar", href: "/calendar", Icon: CalendarDays, color: "peach" },
  { id: "routines", href: "/routines", Icon: RefreshCw, color: "mint" },
  { id: "settings", href: "/settings", Icon: Settings, color: "rose" },
];

export default function WelcomePage() {
  const { locale } = useLanguage();
  const copy = messages[locale] ?? messages.en;
  const router = useRouter();
  const [leaving, setLeaving] = useState("");
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);

  function enter(event, href, id) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
      return;
    event.preventDefault();
    if (leaving) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      router.push(href);
      return;
    }
    setLeaving(id);
    timer.current = setTimeout(() => router.push(href), 240);
  }

  return (
    <div className={`${styles.welcome} ${leaving ? styles.leaving : ""}`}>
      <WaveBackdrop />
      <a className={styles.skip} href="#welcome-main">
        {copy.explore}
      </a>
      <PublicHeader copy={copy} />

      <main id="welcome-main">
        <section className={styles.hero}>
          <div className={styles.heroText}>
            <p className={styles.eyebrow}>
              <span />
              {copy.eyebrow}
            </p>
            <h1>
              {copy.title}
              <br />
              <em>{copy.accent}</em>
            </h1>
            <p className={styles.intro}>{copy.intro}</p>
            <Link
              className={styles.primary}
              href="/"
              onClick={(event) => enter(event, "/", "open")}
            >
              {copy.open}
              <ArrowUpRight size={22} />
            </Link>
            <ul className={styles.traits}>
              {copy.traits.map((text) => (
                <li key={text}>
                  <Check size={15} />
                  {text}
                </li>
              ))}
            </ul>
          </div>
          <OrbitScene copy={copy} locale={locale} onEnter={enter} />
        </section>

        <section className={styles.features} aria-labelledby="welcome-features">
          <div className={styles.sectionHeading}>
            <span>01 — MY DAY</span>
            <h2 id="welcome-features">{copy.section}</h2>
            <p>{copy.sectionSub}</p>
          </div>
          <div className={styles.featureGrid}>
            {ITEMS.map(({ id, href, Icon, color }) => (
              <Link
                key={id}
                href={href}
                onClick={(event) => enter(event, href, id)}
                className={`${styles.feature} ${styles[color]}`}
              >
                <span className={styles.icon}>
                  <Icon size={24} />
                </span>
                <h3>{copy[id]}</h3>
                <p>{copy[`${id}Sub`]}</p>
                <ArrowUpRight size={20} />
              </Link>
            ))}
          </div>
        </section>
        <aside className={styles.privacy}>
          <ShieldCheck size={28} />
          <div>
            <p>{copy.privacy}</p>
            <small>{copy.backups}</small>
          </div>
        </aside>
      </main>
      <footer className={styles.footer}>
        <strong>My Day</strong>
        <p>{copy.footer}</p>
        <span>EN · DE · فارسی · العربية</span>
      </footer>
      <p className={styles.srOnly} role="status">
        {leaving ? copy.loading : ""}
      </p>
    </div>
  );
}
