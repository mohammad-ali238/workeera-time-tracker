"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Timer, TimerEntry, TimerSettings } from "@/lib/types";
import { MAX_TIMERS } from "@/lib/types";
import { loadTimers, saveTimers } from "@/lib/storage";
import { getBrowserTimezone } from "@/lib/time";
import { DEFAULT_CURRENCY } from "@/lib/currency";

function makeId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `t_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function defaultSettings(): TimerSettings {
  return {
    projectName: "",
    clientName: "",
    timezone: getBrowserTimezone(),
    currency: DEFAULT_CURRENCY,
    hourlyRate: 0,
    deadline: undefined,
    maxMinutes: undefined,
    autoStop: false,
  };
}

function makeTimer(): Timer {
  return {
    id: makeId(),
    settings: defaultSettings(),
    status: "idle",
    startedAt: null,
    accumulatedMs: 0,
    entries: [],
    createdAt: Date.now(),
  };
}

export function useTimers() {
  const [timers, setTimers] = useState<Timer[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const didLoad = useRef(false);

  useEffect(() => {
    if (didLoad.current) return;
    didLoad.current = true;
    const loaded = loadTimers();
    if (loaded && loaded.length > 0) setTimers(loaded);
    else setTimers([makeTimer()]);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveTimers(timers);
  }, [timers, hydrated]);

  const addTimer = useCallback(() => {
    setTimers((prev) => {
      if (prev.length === 0) return [makeTimer()];
      if (prev.length >= MAX_TIMERS) return prev;
      const anyActivity = prev.some(
        (t) =>
          t.status !== "idle" || t.accumulatedMs > 0 || t.entries.length > 0
      );
      if (!anyActivity) return prev;
      return [...prev, makeTimer()];
    });
  }, []);

  const updateSettings = useCallback(
    (id: string, patch: Partial<TimerSettings>) => {
      setTimers((prev) =>
        prev.map((t) =>
          t.id === id ? { ...t, settings: { ...t.settings, ...patch } } : t
        )
      );
    },
    []
  );

  const start = useCallback((id: string) => {
    setTimers((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        if (t.status === "running") return t;
        return { ...t, status: "running", startedAt: Date.now() };
      })
    );
  }, []);

  const pause = useCallback((id: string) => {
    setTimers((prev) =>
      prev.map((t) => {
        if (t.id !== id || t.status !== "running" || !t.startedAt) return t;
        const now = Date.now();
        return {
          ...t,
          status: "paused",
          startedAt: null,
          accumulatedMs: t.accumulatedMs + (now - t.startedAt),
          entries: [...t.entries, { start: t.startedAt, end: now }],
        };
      })
    );
  }, []);

  const stop = useCallback((id: string) => {
    setTimers((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        if (t.status === "running" && t.startedAt) {
          const now = Date.now();
          return {
            ...t,
            status: "stopped",
            startedAt: null,
            accumulatedMs: t.accumulatedMs + (now - t.startedAt),
            entries: [...t.entries, { start: t.startedAt, end: now }],
          };
        }
        return { ...t, status: "stopped", startedAt: null };
      })
    );
  }, []);

  const remove = useCallback((id: string) => {
    setTimers((prev) => {
      const next = prev.filter((t) => t.id !== id);
      return next.length === 0 ? [makeTimer()] : next;
    });
  }, []);

  const addManualEntry = useCallback(
    (id: string, startMs: number, endMs: number, note?: string) => {
      if (!Number.isFinite(startMs) || !Number.isFinite(endMs)) return;
      if (endMs <= startMs) return;
      setTimers((prev) =>
        prev.map((t) => {
          if (t.id !== id) return t;
          const duration = endMs - startMs;
          const entry: TimerEntry = {
            start: startMs,
            end: endMs,
            note: note?.trim() || undefined,
            manual: true,
          };
          const nextEntries = [...t.entries, entry].sort(
            (a, b) => a.start - b.start
          );
          return {
            ...t,
            accumulatedMs: t.accumulatedMs + duration,
            entries: nextEntries,
          };
        })
      );
    },
    []
  );

  const removeEntry = useCallback((id: string, index: number) => {
    setTimers((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const entry = t.entries[index];
        if (!entry) return t;
        const duration = entry.end - entry.start;
        return {
          ...t,
          accumulatedMs: Math.max(0, t.accumulatedMs - duration),
          entries: t.entries.filter((_, i) => i !== index),
        };
      })
    );
  }, []);

  const canAdd =
    timers.length < MAX_TIMERS &&
    (timers.length === 0 ||
      timers.some(
        (t) =>
          t.status !== "idle" || t.accumulatedMs > 0 || t.entries.length > 0
      ));

  return {
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
  };
}