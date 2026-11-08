"use client";

import { formatDuration, formatTimeInZone, getTimezoneLabel } from "@/lib/time";
import { ClockIcon } from "./icons";

interface Props {
  elapsed: number;
  timezone: string;
  now: number;
}

export function TimerDisplay({ elapsed, timezone, now }: Props) {
  return (
    <div className="my-8 text-center">
      <div className="font-mono text-5xl font-semibold tracking-tight tabular-nums text-foreground sm:text-6xl">
        {formatDuration(elapsed)}
      </div>
      <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted">
        <ClockIcon width={12} height={12} />
        <span className="font-mono tabular-nums">
          {formatTimeInZone(now, timezone)}
        </span>
        <span className="opacity-60">·</span>
        <span>{getTimezoneLabel(timezone)}</span>
      </div>
    </div>
  );
}