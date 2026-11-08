import type { Timer } from "./types";

const STORAGE_KEY = "workeera-timers-v1";

export function loadTimers(): Timer[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    return parsed as Timer[];
  } catch {
    return null;
  }
}

export function saveTimers(timers: Timer[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(timers));
  } catch {
    // quota exceeded or private mode — silently ignore
  }
}