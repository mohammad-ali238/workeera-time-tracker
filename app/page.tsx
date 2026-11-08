"use client";

import { useCallback, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { TimerCard } from "@/components/TimerCard";
import { SettingsModal } from "@/components/SettingsModal";
import { ManualEntryModal } from "@/components/ManualEntryModal";
import { ExportModal } from "@/components/ExportModal";
import { AddTimerButton } from "@/components/AddTimerButton";
import { RunningBanner } from "@/components/RunningBanner";
import { ConfirmModal } from "@/components/ConfirmModal";
import { useTimers } from "@/hooks/useTimers";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { timersHaveEntries } from "@/lib/export";

export default function Home() {
  const {
    timers,
    hydrated,
    canAdd,
    addTimer,
    updateSettings,
    start,
    pause,
    stop,
    remove,
    addManualEntry,
    removeEntry,
  } = useTimers();

  const [settingsFor, setSettingsFor] = useState<string | null>(null);
  const [manualEntryFor, setManualEntryFor] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [exportOpen, setExportOpen] = useState(false);

  useDocumentTitle(timers, hydrated);

  const activeTimer = timers.find((t) => t.id === settingsFor) ?? null;
  const manualTimer = timers.find((t) => t.id === manualEntryFor) ?? null;
  const deleteTimer = timers.find((t) => t.id === deleteTarget) ?? null;
  const hasStartedAny = timers.some(
    (t) =>
      t.status !== "idle" || t.accumulatedMs > 0 || t.entries.length > 0
  );
  const canExport = timersHaveEntries(timers);

  const toggleMostRecent = useCallback(() => {
    // Most recently active timer = the one with the latest entry or start.
    const sorted = [...timers].sort((a, b) => {
      const aTime = a.startedAt ?? a.entries.at(-1)?.end ?? a.createdAt;
      const bTime = b.startedAt ?? b.entries.at(-1)?.end ?? b.createdAt;
      return bTime - aTime;
    });
    const target = sorted[0];
    if (!target) return;
    if (target.status === "running") pause(target.id);
    else start(target.id);
  }, [timers, start, pause]);

  useKeyboardShortcuts({
    onToggleTimer: toggleMostRecent,
    onOpenExport: () => {
      if (canExport) setExportOpen(true);
    },
    enabled: hydrated,
  });

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <Header
        onExport={() => setExportOpen(true)}
        exportEnabled={canExport}
      />
      {hydrated && <RunningBanner timers={timers} />}
      <main
        id="main"
        className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6"
      >
        {hydrated ? (
          <div
            className={`grid gap-4 ${
              timers.length > 1 ? "md:grid-cols-2" : ""
            }`}
          >
            {timers.map((t) => (
              <TimerCard
                key={t.id}
                timer={t}
                onStart={() => start(t.id)}
                onPause={() => pause(t.id)}
                onStop={() => stop(t.id)}
                onOpenSettings={() => {
                  setManualEntryFor(null);
                  setSettingsFor(t.id);
                }}
                onDelete={() => setDeleteTarget(t.id)}
                showDelete={timers.length > 1}
                onAddManual={() => {
                  setSettingsFor(null);
                  setManualEntryFor(t.id);
                }}
                onRemoveEntry={(index) => removeEntry(t.id, index)}
              />
            ))}
            <div className={timers.length > 1 ? "md:col-span-2" : ""}>
              <AddTimerButton
                canAdd={canAdd}
                hasStartedAny={hasStartedAny}
                count={timers.length}
                onClick={addTimer}
              />
            </div>
          </div>
        ) : (
          <div className="h-72 animate-pulse rounded-xl border border-border bg-surface motion-reduce:animate-none" />
        )}
      </main>
      <Footer />

      <SettingsModal
        timer={activeTimer}
        onClose={() => setSettingsFor(null)}
        onSave={updateSettings}
      />

      <ManualEntryModal
        timer={manualTimer}
        onClose={() => setManualEntryFor(null)}
        onSave={(startMs, endMs, note) => {
          if (manualTimer) addManualEntry(manualTimer.id, startMs, endMs, note);
        }}
      />

      <ExportModal
        open={exportOpen}
        timers={timers}
        onClose={() => setExportOpen(false)}
      />

      <ConfirmModal
        open={deleteTimer !== null}
        title="Delete this timer?"
        message={`"${
          deleteTimer?.settings.projectName || "Untitled timer"
        }" and its recorded time will be removed. This cannot be undone.`}
        confirmLabel="Delete"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTimer) remove(deleteTimer.id);
          setDeleteTarget(null);
        }}
      />
    </div>
  );
}