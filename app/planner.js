"use client";

import AppShell from "../components/layout/AppShell";
import CompletionModal from "../components/planner/CompletionModal";
import DashboardHero from "../components/planner/DashboardHero";
import DashboardSidebar from "../components/planner/DashboardSidebar";
import SettingsModal from "../components/planner/SettingsModal";
import TaskForm from "../components/planner/TaskForm";
import TodayTasksCard from "../components/planner/TodayTasksCard";
import usePlannerDashboard from "../hooks/usePlannerDashboard";
import TaskDetailsModal from "../components/planner/TaskDetailsModal";

/* Composes the dashboard from focused components. */
export default function Planner() {
  const planner =
    usePlannerDashboard();

  const { settings } = planner;

  return (
    <>
      <AppShell
        activePage="today"
        displayDate={
          planner.displayDate
        }
        onOpenSettings={() => {
          planner.setModal(
            "settings",
          );
        }}
      >
        <main className="content">
          <DashboardHero
            date={planner.date}
            displayDate={
              planner.displayDate
            }
            secondaryDate={
              planner.secondaryDate
            }
            lang={
              settings.language
            }
            onAddTask={() => {
              planner.setModal("add");
            }}
          />

          <div className="dashboardGrid">
            <TodayTasksCard
              data={planner.data}
              tasks={planner.tasks}
              visibleTasks={
                planner.visibleTasks
              }
              onViewTask={
                planner.openDetailsModal
              }
              displayDate={
                planner.displayDate
              }
              filter={
                planner.filter
              }
              completedCount={
                planner.completedCount
              }
              essentialCount={
                planner.essentialCount
              }
              importantCount={
                planner.importantCount
              }
              normalCount={
                planner.normalCount
              }
              completionPercent={
                planner.completionPercent
              }
              lang={
                settings.language
              }
              onFilterChange={
                planner.setFilter
              }
              onToggleTask={
                planner.toggleTask
              }
              onCompleteTask={
                planner.openCompletionModal
              }
              onEditTask={
                planner.openEditModal
              }
              onRemoveTask={
                planner.removeTask
              }
            />

            <DashboardSidebar
              tasks={planner.tasks}
              todayRoutines={
                planner.todayRoutines
              }
              carryTasks={
                planner.carryTasks
              }
              carryToday={
                planner.carryToday
              }
              carryTomorrow={
                planner.carryTomorrow
              }
              calendar={
                settings.calendar
              }
              completedCount={
                planner.completedCount
              }
              essentialCount={
                planner.essentialCount
              }
              importantTotal={
                planner.importantTotal
              }
              lang={
                settings.language
              }
              onAddTask={() => {
                planner.setModal("add");
              }}
              onCarryTask={
                planner.carryTask
              }
              onOpenSettings={() => {
                planner.setModal(
                  "settings",
                );
              }}
            />
          </div>
        </main>
      </AppShell>

      {(
        planner.modal === "add" ||
        planner.modal?.type ===
        "edit"
      ) && (
          <TaskForm
            lang={settings.language}
            calendar={settings.calendar}
            data={planner.data}
            date={planner.date}
            task={
              planner.editingTask
            }
            onClose={() => {
              planner.setModal(null);
            }}
            onSave={
              planner.saveTask
            }
          />
        )}

      {planner.modal?.type === "details" &&
        planner.detailsTask && (
          <TaskDetailsModal
            task={planner.detailsTask}
            data={planner.data}
            calendar={settings.calendar}
            lang={settings.language}
            onClose={() => {
              planner.setModal(null);
            }}
            onEdit={() => {
              planner.openEditModal(
                planner.detailsTask.id,
              );
            }}
            onRemove={() => {
              planner.removeTask(
                planner.detailsTask,
              );
            }}
          />
        )}

      {planner.modal?.type ===
        "complete" && (
          <CompletionModal
            lang={settings.language}
            taskId={
              planner.modal.id
            }
            onClose={() => {
              planner.setModal(null);
            }}
            onSubmit={
              planner.completeTask
            }
          />
        )}

      {planner.modal ===
        "settings" && (
          <SettingsModal
            lang={settings.language}
            settings={settings}
            onClose={() => {
              planner.setModal(null);
            }}
            onSubmit={
              planner.saveSettings
            }
          />
        )}
    </>
  );
}