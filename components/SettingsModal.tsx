"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Timer, TimerSettings } from "@/lib/types";
import { CURRENCIES } from "@/lib/currency";
import { getAllTimezones } from "@/lib/timezones";
import { useFocusTrap } from "@/hooks/useFocusTrap";

interface Props {
  timer: Timer | null;
  onClose: () => void;
  onSave: (id: string, patch: Partial<TimerSettings>) => void;
}

interface Draft {
  projectName: string;
  clientName: string;
  timezone: string;
  currency: string;
  hourlyRate: string;
  deadline: string;
  maxMinutes: string;
  autoStop: boolean;
}

function toDraft(s: TimerSettings): Draft {
  return {
    projectName: s.projectName,
    clientName: s.clientName,
    timezone: s.timezone,
    currency: s.currency,
    hourlyRate: s.hourlyRate > 0 ? String(s.hourlyRate) : "",
    deadline: s.deadline ?? "",
    maxMinutes: s.maxMinutes ? String(s.maxMinutes) : "",
    autoStop: s.autoStop,
  };
}

export function SettingsModal({ timer, onClose, onSave }: Props) {
  const open = timer !== null;
  const [draft, setDraft] = useState<Draft | null>(null);
  const [tzFilter, setTzFilter] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useFocusTrap(containerRef, open, onClose);

  const allTimezones = useMemo(() => getAllTimezones(), []);

  useEffect(() => {
    if (open && timer) {
      setDraft(toDraft(timer.settings));
      setTzFilter("");
    } else {
      setDraft(null);
    }
  }, [open, timer]);

  const filteredTimezones = useMemo(() => {
    const q = tzFilter.trim().toLowerCase();
    if (!q) return allTimezones;
    return allTimezones.filter((tz) => tz.toLowerCase().includes(q));
  }, [allTimezones, tzFilter]);

  if (!open || !timer || !draft) return null;

  function update<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((d) => (d ? { ...d, [key]: value } : d));
  }

  function handleSave() {
    if (!timer || !draft) return;
    const rate = parseFloat(draft.hourlyRate);
    const maxMin = parseInt(draft.maxMinutes, 10);
    onSave(timer.id, {
      projectName: draft.projectName.trim(),
      clientName: draft.clientName.trim(),
      timezone: draft.timezone,
      currency: draft.currency,
      hourlyRate: Number.isFinite(rate) && rate > 0 ? rate : 0,
      deadline: draft.deadline || undefined,
      maxMinutes: Number.isFinite(maxMin) && maxMin > 0 ? maxMin : undefined,
      autoStop: draft.autoStop,
    });
    onClose();
  }

  const autoStopDisabled =
    !draft.maxMinutes || parseInt(draft.maxMinutes, 10) <= 0;

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
        aria-labelledby="settings-title"
        className="flex max-h-[92dvh] w-full max-w-md flex-col rounded-t-xl border border-border bg-surface shadow-xl outline-none sm:rounded-xl"
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 id="settings-title" className="text-sm font-semibold text-foreground">
            Timer settings
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
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">
              Project name
            </label>
            <input
              value={draft.projectName}
              onChange={(e) => update("projectName", e.target.value)}
              placeholder="e.g. Landing page redesign"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted">
              Client name
            </label>
            <input
              value={draft.clientName}
              onChange={(e) => update("clientName", e.target.value)}
              placeholder="e.g. Acme Corp"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">
                Currency
              </label>
              <select
                value={draft.currency}
                onChange={(e) => update("currency", e.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} ({c.symbol})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">
                Hourly rate
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                value={draft.hourlyRate}
                onChange={(e) => update("hourlyRate", e.target.value)}
                placeholder="0"
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted">
              Timezone
            </label>
            <input
              value={tzFilter}
              onChange={(e) => setTzFilter(e.target.value)}
              placeholder="Search timezones…"
              className="mb-2 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
            />
            <select
              value={draft.timezone}
              onChange={(e) => update("timezone", e.target.value)}
              size={5}
              className="w-full rounded-md border border-border bg-background px-2 py-1 text-sm text-foreground outline-none focus:border-accent"
            >
              {filteredTimezones.length === 0 && (
                <option disabled>No match</option>
              )}
              {filteredTimezones.map((tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted">
              Deadline (optional)
            </label>
            <input
              type="date"
              value={draft.deadline}
              onChange={(e) => update("deadline", e.target.value)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted">
              Max time in minutes (optional)
            </label>
            <input
              type="number"
              min="0"
              step="1"
              inputMode="numeric"
              value={draft.maxMinutes}
              onChange={(e) => update("maxMinutes", e.target.value)}
              placeholder="e.g. 120"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
            />
          </div>

          <label
            className={`flex items-start gap-3 rounded-md border border-border p-3 ${
              autoStopDisabled ? "opacity-50" : ""
            }`}
          >
            <input
              type="checkbox"
              checked={draft.autoStop}
              disabled={autoStopDisabled}
              onChange={(e) => update("autoStop", e.target.checked)}
              className="mt-0.5 h-4 w-4 accent-[var(--accent)]"
            />
            <span className="text-xs text-muted">
              <span className="block font-medium text-foreground">
                Auto-stop at max time
              </span>
              Requires a max time value above.
            </span>
          </label>
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
            Save
          </button>
        </div>
      </div>
    </div>
  );
}