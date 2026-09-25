"use client";

import AppShell from "../../components/layout/AppShell";
import { useLanguage } from "../../components/providers/LanguageProvider";
import RoutineFormModal from "../../components/routines/RoutineFormModal";
import RoutineList from "../../components/routines/RoutineList";
import useRoutinesPage from "../../hooks/useRoutinesPage";

/* Composes the routines feature from focused components. */
export default function RoutinesPage() {
  const { t } = useLanguage();

  const routinesPage =
    useRoutinesPage();

  return (
    <>
      <AppShell activePage="routines">
        <main className="content">
          <div className="hero">
            <div>
              <div className="kicker">
                {t("routines")}
              </div>

              <h1>
                {t("routineTitle")}
              </h1>

              <p>
                {t("routineSub")}
              </p>
            </div>

            <div className="heroActions">
              <button
                type="button"
                className="ghost"
                onClick={
                  routinesPage.applyToday
                }
              >
                ↻ {t("applyToday")}
              </button>

              <button
                type="button"
                className="primary"
                onClick={
                  routinesPage.openNewRoutine
                }
              >
                ＋ {t("newRoutine")}
              </button>
            </div>
          </div>

          <RoutineList
            filter={
              routinesPage.filter
            }
            routines={
              routinesPage.visibleRoutines
            }
            formatDays={
              routinesPage.formatRoutineDays
            }
            onDelete={
              routinesPage.deleteRoutine
            }
            onEdit={
              routinesPage.setEditingRoutine
            }
            onFilterChange={
              routinesPage.setFilter
            }
            onToggle={
              routinesPage.toggleRoutine
            }
          />
        </main>
      </AppShell>

      {routinesPage.editingRoutine && (
        <RoutineFormModal
          key={
            routinesPage
              .editingRoutine
              .id ||
            "new-routine"
          }
          routine={
            routinesPage.editingRoutine
          }
          onClose={() => {
            routinesPage.setEditingRoutine(
              null,
            );
          }}
          onSave={
            routinesPage.saveRoutine
          }
        />
      )}
    </>
  );
}