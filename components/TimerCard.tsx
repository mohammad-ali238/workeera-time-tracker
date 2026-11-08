"use client";

import { useEffect, useRef, useState } from "react";
import type { Timer } from "@/lib/types";
import { TimerDisplay } from "./TimerDisplay";
import { TimerControls } from "./TimerControls";
import { EntryHistory } from "./EntryHistory";
import { SettingsIcon, TrashIcon, PlusIcon } from "./icons";
import { getElapsed, formatDurationShort } from "@/lib/time";
import { calculateCost, formatCost } from "@/lib/currency";

interface Props {
  timer: Timer;
  onStart: () => void;
  onPause: () => void;
  onStop: () => void;
  onOpenSettings: () => void;
  onDelete: () => void;
  showDelete: boolean;
  onAddManual: () => void;
  onRemoveEntry: (index: number) => void;
}

export function TimerCard({
  timer,
  onStart,
  onPause,
  onStop,
  onOpenSettings,
  onDelete,
  showDelete,
  onAddManual,
  onRemoveEntry,
}: Props) {
  const [now, setNow] = useState<number>(() => Date.now());
  const prevElapsedRef = useRef<number>(0);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const elapsed = getElapsed(timer, now);
  const cost = calculateCost(elapsed, timer.settings.hourlyRate);
  const isRunning = timer.status === "running";

  const maxMs = timer.settings.maxMinutes
    ? timer.settings.maxMinutes * 60_000
    : null;
  const overBudget = maxMs !== null && elapsed > maxMs;
  const overBudgetMs = maxMs !== null && overBudget ? elapsed - maxMs : 0;
  const remainingMs = maxMs !== null ? Math.max(0, maxMs - elapsed) : null;

  useEffect(() => {
    const prev = prevElapsedRef.current;
    prevElapsedRef.current = elapsed;
    if (
      timer.settings.autoStop &&
      maxMs !== null &&
      timer.status === "running" &&
      prev < maxMs &&
      elapsed >= maxMs
    ) {
      onStop();
    }
  }, [elapsed, maxMs, timer.settings.autoStop, timer.status, onStop]);

  const rateLabel =
    timer.settings.hourlyRate > 0
      ? `${formatCost(timer.settings.hourlyRate, timer.settings.currency)}/hr`
      : "No rate set";

  return (
    <div
      data-running={isRunning || undefined}
      className={`rounded-xl border bg-surface p-5 transition-colors sm:p-6 ${
        overBudget
          ? "border-danger/50"
          : isRunning
          ? "border-accent/40"
          : "border-border"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            {isRunning && (
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="absolute inline-flex h-full w-full rounded-full bg-accent opacity-75 motion-safe:animate-ping" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
              </span>
            )}
            <h2 className="truncate text-sm font-semibold text-foreground">
              {timer.settings.projectName || "Untitled timer"}
            </h2>
          </div>
          {timer.settings.clientName && (
            <p className="mt-0.5 truncate text-xs text-muted">
              {timer.settings.clientName}
            </p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {showDelete && (
            <button
              onClick={onDelete}
              aria-label="Delete timer"
              className="-mt-1 flex h-8 w-8 items-center justify-center rounded-md text-muted transition-colors hover:bg-danger/10 hover:text-danger"
            >
              <TrashIcon width={16} height={16} />
            </button>
          )}
          <button
            onClick={onOpenSettings}
            aria-label="Timer settings"
            className="-mr-1 -mt-1 flex h-8 w-8 items-center justify-center rounded-md text-muted transition-colors hover:bg-border/60 hover:text-foreground"
          >
            <SettingsIcon width={16} height={16} />
          </button>
        </div>
      </div>

      <TimerDisplay
        elapsed={elapsed}
        timezone={timer.settings.timezone}
        now={now}
      />

      <div className={`text-center text-sm ${maxMs !== null ? "mb-1" : "mb-5"}`}>
        <span className="font-mono font-semibold tabular-nums text-foreground">
          {formatCost(cost, timer.settings.currency)}
        </span>
        <span className="ml-2 text-muted">{rateLabel}</span>
      </div>

      {maxMs !== null && (
        <div className="mb-4 text-center text-xs">
          {overBudget ? (
            <span className="font-medium text-danger">
              +{formatDurationShort(overBudgetMs)} over budget
            </span>
          ) : (
            <span className="text-muted">
              {formatDurationShort(remainingMs ?? 0)} left
            </span>
          )}
        </div>
      )}

      <TimerControls
        timer={timer}
        onStart={onStart}
        onPause={onPause}
        onStop={onStop}
      />

      <button
        onClick={onAddManual}
        className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-medium text-muted transition-colors hover:bg-border/30 hover:text-foreground"
      >
        <PlusIcon width={12} height={12} />
        Add time manually
      </button>

      <EntryHistory timer={timer} onRemoveEntry={onRemoveEntry} />
    </div>
  );
}