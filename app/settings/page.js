"use client";

import AppShell from "../../components/layout/AppShell";
import { useLanguage } from "../../components/providers/LanguageProvider";
import AutoBackupSettings from "../../components/settings/AutoBackupSettings";
import { useRouter } from "next/navigation";
import BackupSettings from "../../components/settings/BackupSettings";
import SettingsForm from "../../components/settings/SettingsForm";

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
            <main className="content">
                <div className="hero">
                    <div>
                        <div className="kicker">
                            {t("settings")}
                        </div>

                        <h1>
                            {t("settingsTitle")}
                        </h1>

                        <p>
                            {t("settingsSub")}
                        </p>
                    </div>
                </div>

                <section className="card settingsPage">
                    <SettingsForm
                        onSubmit={saveSettings}
                    />
                </section>

                <BackupSettings />
                <AutoBackupSettings />
            </main>
        </AppShell>
    );
}