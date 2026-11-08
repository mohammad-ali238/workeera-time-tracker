"use client";

import { useEffect, useRef, useState } from "react";
import type { Timer } from "@/lib/types";
import { formatDurationShort } from "@/lib/time";
import { useFocusTrap } from "@/hooks/useFocusTrap";

interface Props {
  timer: Timer | null;
  onClose: () => void;
  onSave: (startMs: number, endMs: number, note: string) => void;
}

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

function toDateInput(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function minsToTime(mins: number): string {
  const m = ((mins % 1440) + 1440) % 1440;
  return `${pad(Math.floor(m / 60))}:${pad(m % 60)}`;
}

function computeDefaults(): { date: string; start: string; end: string } {
  const now = new Date();
  const roundedEnd =
    Math.floor((now.getHours() * 60 + now.getMinutes()) / 15) * 15;
  const startMins = roundedEnd - 60;
  if (startMins >= 0) {
    return {
      date: toDateInput(now),
      start: minsToTime(startMins),
      end: minsToTime(roundedEnd),
    };
  }
  return { date: toDateInput(now), start: "09:00", end: "10:00" };
}

function parseLocal(dateStr: string, timeStr: string): number | null {
  if (!dateStr || !timeStr) return null;
  const [y, m, d] = dateStr.split("-").map(Number);
  const [h, min] = timeStr.split(":").map(Number);
  if (!y || !m || !d || isNaN(h) || isNaN(min)) return null;
  const ms = new Date(y, m - 1, d, h, min).getTime();
  return Number.isFinite(ms) ? ms : null;
}

const MAX_DURATION_MS = 24 * 60 * 60 * 1000;
const FUTURE_TOLERANCE_MS = 5 * 60 * 1000;

export function ManualEntryModal({ timer, onClose, onSave }: Props) {
  const open = timer !== null;
  const [date, setDate] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [note, setNote] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useFocusTrap(containerRef, open, onClose);

  useEffect(() => {
    if (open) {
      const d = computeDefaults();
      setDate(d.date);
      setStart(d.start);
      setEnd(d.end);
      setNote("");
      setSubmitted(false);
    }
  }, [open]);

  if (!open || !timer) return null;

  const startMs = parseLocal(date, start);
  const endMs = parseLocal(date, end);

  let error: string | null = null;
  if (!date || !start || !end) {
    error = "Please fill in date, start time, and end time.";
  } else if (startMs === null || endMs === null) {
    error = "Invalid date or time.";
  } else if (endMs <= startMs) {
    error = "End time must be after start time.";
  } else if (endMs - startMs > MAX_DURATION_MS) {
    error = "An entry can't be longer than 24 hours.";
  } else if (endMs > Date.now() + FUTURE_TOLERANCE_MS) {
    error = "End time can't be in the future.";
  }

  const preview =
    startMs !== null && endMs !== null && endMs > startMs
      ? formatDurationShort(endMs - startMs)
      : null;

  function handleSave() {
    setSubmitted(true);
    if (error || startMs === null || endMs === null) return;
    onSave(startMs, endMs, note);
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={containerRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="manual-title"
        className="flex max-h-[92dvh] w-full max-w-md flex-col rounded-t-xl border border-border bg-surface shadow-xl outline-none sm:rounded-xl"
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 id="manual-title" className="text-sm font-semibold text-foreground">
            Add time manually
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted hover:bg-border/60 hover:text-foreground"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
          <p className="text-xs leading-relaxed text-muted">
            Log time you forgot to track. Entered in your local timezone and
            shown in this timer&apos;s timezone ({timer.settings.timezone}).
          </p>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">
                Start
              </label>
              <input
                type="time"
                value={start}
                onChange={(e) => setStart(e.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">
                End
              </label>
              <input
                type="time"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
              />
            </div>
          </div>

          {preview && (
            <p className="text-xs text-muted">
              Duration:{" "}
              <span className="font-mono font-semibold text-foreground">
                {preview}
              </span>
            </p>
          )}

          <div>
            <label className="mb-1 block text-xs font-medium text-muted">
              Note (optional)
            </label>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Client call, forgot to start timer"
              maxLength={200}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
            />
          </div>

          {submitted && error && (
            <p className="rounded-md bg-danger/10 px-3 py-2 text-xs text-danger">
              {error}
            </p>
          )}
        </div>

        <div className="flex gap-2 border-t border-border px-5 py-4">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-border/40"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            Add entry
          </button>
        </div>
      </div>
    </div>
  );
}