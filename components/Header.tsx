"use client";

import { SunIcon, MoonIcon, DownloadIcon } from "./icons";
import { useTheme } from "@/hooks/useTheme";

interface Props {
  onExport?: () => void;
  exportEnabled?: boolean;
}

export function Header({ onExport, exportEnabled = false }: Props) {
  const { toggle } = useTheme();

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-surface/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-accent">
            <span className="text-xs font-bold text-white">w</span>
          </div>
          <span className="font-semibold tracking-tight text-foreground lowercase">
            Workeera Tracker
          </span>
        </div>
        <div className="flex items-center gap-1">
          {onExport && (
            <button
              onClick={onExport}
              disabled={!exportEnabled}
              aria-label="Export timesheet"
              className="flex h-9 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium text-muted transition-colors hover:bg-border/50 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-muted"
            >
              <DownloadIcon width={14} height={14} />
              <span className="hidden sm:inline">Export</span>
            </button>
          )}
          <button
            onClick={toggle}
            aria-label="Toggle theme"
            className="flex h-9 w-9 items-center justify-center rounded-md text-muted transition-colors hover:bg-border/50 hover:text-foreground"
          >
            <SunIcon className="hidden dark:block" />
            <MoonIcon className="block dark:hidden" />
          </button>
        </div>
      </div>
    </header>
  );
}
