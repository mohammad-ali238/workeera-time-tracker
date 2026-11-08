"use client";

import { useRef } from "react";
import type { Timer } from "@/lib/types";
import { exportCSV, exportPDF, timersHaveEntries } from "@/lib/export";
import { DownloadIcon } from "./icons";
import { useFocusTrap } from "@/hooks/useFocusTrap";

interface Props {
  open: boolean;
  timers: Timer[];
  onClose: () => void;
}

export function ExportModal({ open, timers, onClose }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useFocusTrap(containerRef, open, onClose);

  if (!open) return null;

  const hasEntries = timersHaveEntries(timers);
  const totalEntries = timers.reduce((n, t) => n + t.entries.length, 0);
  const totalProjects = timers.filter((t) => t.entries.length > 0).length;

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
        aria-labelledby="export-title"
        className="flex max-h-[92dvh] w-full max-w-md flex-col rounded-t-xl border border-border bg-surface shadow-xl outline-none sm:rounded-xl"
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 id="export-title" className="text-sm font-semibold text-foreground">
            Export timesheet
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted hover:bg-border/60 hover:text-foreground"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4 px-5 py-4">
          <p className="text-xs leading-relaxed text-muted">
            {hasEntries ? (
              <>
                Ready to export{" "}
                <span className="font-medium text-foreground">
                  {totalEntries} {totalEntries === 1 ? "entry" : "entries"}
                </span>{" "}
                from{" "}
                <span className="font-medium text-foreground">
                  {totalProjects} {totalProjects === 1 ? "timer" : "timers"}
                </span>
                .
              </>
            ) : (
              "You haven't logged any time yet. Start or add an entry first."
            )}
          </p>

          <button
            onClick={() => {
              exportCSV(timers);
            }}
            disabled={!hasEntries}
            className="flex w-full items-center justify-between gap-3 rounded-lg border border-border px-4 py-3 text-left transition-colors hover:border-accent/60 hover:bg-border/20 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-border disabled:hover:bg-transparent"
          >
            <span>
              <span className="block text-sm font-medium text-foreground">
                CSV spreadsheet
              </span>
              <span className="block text-xs text-muted">
                One row per entry. Opens in Excel, Sheets, Numbers.
              </span>
            </span>
            <DownloadIcon width={16} height={16} className="shrink-0 text-muted" />
          </button>

          <button
            onClick={() => {
              exportPDF(timers);
            }}
            disabled={!hasEntries}
            className="flex w-full items-center justify-between gap-3 rounded-lg border border-border px-4 py-3 text-left transition-colors hover:border-accent/60 hover:bg-border/20 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-border disabled:hover:bg-transparent"
          >
            <span>
              <span className="block text-sm font-medium text-foreground">
                PDF timesheet
              </span>
              <span className="block text-xs text-muted">
                Grouped by client with totals per currency.
              </span>
            </span>
            <DownloadIcon width={16} height={16} className="shrink-0 text-muted" />
          </button>
        </div>

        <div className="border-t border-border px-5 py-4">
          <button
            onClick={onClose}
            className="w-full rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-border/40"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}