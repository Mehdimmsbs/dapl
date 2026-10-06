"use client";

import AppShell from "../../components/layout/AppShell";
import { useLanguage } from "../../components/providers/LanguageProvider";
import AutoBackupSettings from "../../components/settings/AutoBackupSettings";
import BackupDirectorySettings from "../../components/settings/BackupDirectorySettings";
import { useRouter } from "next/navigation";
import BackupSettings from "../../components/settings/BackupSettings";
import SettingsForm from "../../components/settings/SettingsForm";
import AccountSettings from "../../components/settings/AccountSettings";
import NotificationSettings from "../../components/settings/NotificationSettings";

/* Composes the settings route from shared components. */
export default function SettingsPage() {
  const { t } = useLanguage();
  const router = useRouter();

  /* Navigates after SettingsForm finishes saving preferences. */
  function saveSettings() {
    router.push("/");
  }

  return (
    <AppShell activePage="settings">
      <main className="content settingsControls">
        <div className="hero">
          <div>
            <div className="kicker">{t("settings")}</div>

            <h1>{t("settingsTitle")}</h1>

            <p>{t("settingsSub")}</p>
          </div>
        </div>

        <AccountSettings />
        <NotificationSettings />
        <section
          className="card settingsPage"
          aria-labelledby="preferences-title"
        >
          <header className="settingsPageHeader">
            <h2 id="preferences-title">{t("preferencesTitle")}</h2>

            <p>{t("preferencesDescription")}</p>
          </header>

          <SettingsForm onSubmit={saveSettings} />
        </section>
        <BackupSettings />
        <AutoBackupSettings />
        <BackupDirectorySettings />
      </main>
    </AppShell>
  );
}
