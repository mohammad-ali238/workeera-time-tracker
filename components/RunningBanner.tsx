"use client";

import { useEffect, useState } from "react";
import type { Timer } from "@/lib/types";
import { getElapsed, formatDurationShort } from "@/lib/time";
import { calculateCost, formatCost } from "@/lib/currency";

interface Props {
  timers: Timer[];
}

export function RunningBanner({ timers }: Props) {
  const [now, setNow] = useState<number>(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const running = timers.filter((t) => t.status === "running");
  if (running.length === 0) return null;

  const currencies = new Set(running.map((t) => t.settings.currency));
  const sameCurrency = currencies.size === 1;
  const totalCost = running.reduce(
    (sum, t) => sum + calculateCost(getElapsed(t, now), t.settings.hourlyRate),
    0
  );
  const anyRate = running.some((t) => t.settings.hourlyRate > 0);
  const totalElapsed = running.reduce(
    (sum, t) => sum + getElapsed(t, now),
    0
  );

  function scrollToFirst() {
    const el = document.querySelector('[data-running="true"]');
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div
      aria-live="polite"
      className="sticky top-14 z-20 border-b border-accent/30 bg-accent-soft"
    >
      <button
        onClick={scrollToFirst}
        className="mx-auto flex w-full max-w-3xl items-center justify-between gap-3 px-4 py-2 text-xs sm:px-6"
      >
        <span className="flex items-center gap-2 text-foreground">
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
          </span>
          <span className="font-medium">
            {running.length} {running.length === 1 ? "timer" : "timers"} running
          </span>
        </span>
        <span className="flex items-center gap-2 font-mono tabular-nums text-foreground">
          {sameCurrency && anyRate ? (
            <span className="font-semibold text-accent">
              + {formatCost(totalCost, running[0].settings.currency)}
            </span>
          ) : (
            <span className="text-muted">{formatDurationShort(totalElapsed)}</span>
          )}
          <span className="hidden text-muted sm:inline">· tap to jump</span>
        </span>
      </button>
    </div>
  );
}