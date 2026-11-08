"use client";

import { useState } from "react";
import type { Timer } from "@/lib/types";
import {
  formatEntryDate,
  formatEntryTime,
  formatDurationShort,
} from "@/lib/time";
import { ChevronDownIcon, TrashIcon } from "./icons";

interface Props {
  timer: Timer;
  onRemoveEntry: (index: number) => void;
}

export function EntryHistory({ timer, onRemoveEntry }: Props) {
  const [expanded, setExpanded] = useState(false);
  const count = timer.entries.length;
  const isRunning = timer.status === "running";

  if (count === 0 && !isRunning) {
    return (
      <p className="mt-3 border-t border-border pt-3 text-center text-xs text-muted">
        No entries yet.
      </p>
    );
  }

  return (
    <div className="mt-3 border-t border-border pt-3">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between text-xs font-medium text-muted transition-colors hover:text-foreground"
      >
        <span>
          History ({count})
          {isRunning && (
            <span className="ml-2 inline-flex items-center gap-1 text-accent">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              in progress
            </span>
          )}
        </span>
        <ChevronDownIcon
          width={14}
          height={14}
          className={`transition-transform ${expanded ? "rotate-180" : ""}`}
        />
      </button>

      {expanded && (
        <ul className="mt-2 space-y-1">
          {timer.entries.map((entry, i) => (
            <li
              key={`${entry.start}-${i}`}
              className="flex items-start justify-between gap-2 rounded-md px-2 py-1.5 text-xs hover:bg-border/30"
            >
              <div className="min-w-0">
                <div className="text-foreground">
                  <span className="text-muted">
                    {formatEntryDate(entry.start, timer.settings.timezone)}
                  </span>{" "}
                  <span className="font-mono tabular-nums">
                    {formatEntryTime(entry.start, timer.settings.timezone)}–
                    {formatEntryTime(entry.end, timer.settings.timezone)}
                  </span>{" "}
                  <span className="text-muted">·</span>{" "}
                  <span className="font-medium">
                    {formatDurationShort(entry.end - entry.start)}
                  </span>
                  {entry.manual && (
                    <span className="ml-1.5 rounded bg-border/60 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-muted">
                      manual
                    </span>
                  )}
                </div>
                {entry.note && (
                  <div className="mt-0.5 truncate text-muted">{entry.note}</div>
                )}
              </div>
              <button
                onClick={() => onRemoveEntry(i)}
                aria-label="Delete entry"
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-muted hover:bg-danger/10 hover:text-danger"
              >
                <TrashIcon width={12} height={12} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}