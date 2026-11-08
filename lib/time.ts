import { formatInTimeZone } from "date-fns-tz";
import type { Timer } from "./types";

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

/** Always HH:MM:SS — used on the big timer digits. */
export function formatDuration(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

/** "2h 15m", "45m 12s", "9s" — used in summaries and exports. */
export function formatDurationShort(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

/** Total elapsed including the currently running segment. */
export function getElapsed(timer: Timer, now: number): number {
  if (timer.status === "running" && timer.startedAt) {
    return timer.accumulatedMs + (now - timer.startedAt);
  }
  return timer.accumulatedMs;
}

/** "14:23:07" in the given IANA timezone. */
export function formatTimeInZone(epochMs: number, tz: string): string {
  try {
    return formatInTimeZone(new Date(epochMs), tz, "HH:mm:ss");
  } catch {
    return formatInTimeZone(new Date(epochMs), "UTC", "HH:mm:ss");
  }
}

/** "Asia/Karachi" → "Karachi". */
export function getTimezoneLabel(tz: string): string {
  const parts = tz.split("/");
  return parts[parts.length - 1].replace(/_/g, " ");
}

export function getBrowserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

/** "Mon, 14 Oct" in the given IANA timezone. */
export function formatEntryDate(ms: number, tz: string): string {
  try {
    return formatInTimeZone(new Date(ms), tz, "EEE, d MMM");
  } catch {
    return formatInTimeZone(new Date(ms), "UTC", "EEE, d MMM");
  }
}

/** "10:15" in the given IANA timezone. */
export function formatEntryTime(ms: number, tz: string): string {
  try {
    return formatInTimeZone(new Date(ms), tz, "HH:mm");
  } catch {
    return formatInTimeZone(new Date(ms), "UTC", "HH:mm");
  }
}