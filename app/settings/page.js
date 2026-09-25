"use client";

import AppShell from "../../components/layout/AppShell";
import { useLanguage } from "../../components/providers/LanguageProvider";
import SettingsForm from "../../components/settings/SettingsForm";

/* Composes the settings route from shared components. */
export default function SettingsPage() {
    const { t } = useLanguage();

    /* Returns to the dashboard after saving. */
    function saveSettings(event) {
        event.preventDefault();
        window.location.assign("/");
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
            </main>
        </AppShell>
    );
}