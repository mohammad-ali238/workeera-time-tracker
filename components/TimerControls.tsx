"use client";

import type { Timer } from "@/lib/types";
import { PlayIcon, PauseIcon, StopIcon } from "./icons";

interface Props {
  timer: Timer;
  onStart: () => void;
  onPause: () => void;
  onStop: () => void;
}

export function TimerControls({ timer, onStart, onPause, onStop }: Props) {
  const isRunning = timer.status === "running";
  const showStop = isRunning || timer.status === "paused";
  const primaryLabel =
    timer.status === "paused" || timer.status === "stopped"
      ? "Resume"
      : "Start";

  return (
    <div className="flex items-center gap-2">
      {isRunning ? (
        <button
          onClick={onPause}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-warning px-4 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          <PauseIcon width={14} height={14} />
          Pause
        </button>
      ) : (
        <button
          onClick={onStart}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-accent px-4 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          <PlayIcon width={12} height={12} />
          {primaryLabel}
        </button>
      )}

      {showStop && (
        <button
          onClick={onStop}
          aria-label="Stop"
          className="flex items-center justify-center gap-2 rounded-lg bg-danger/10 px-4 py-3 text-sm font-medium text-danger transition-colors hover:bg-danger/20"
        >
          <StopIcon width={14} height={14} />
          <span className="hidden sm:inline">Stop</span>
        </button>
      )}
    </div>
  );
}