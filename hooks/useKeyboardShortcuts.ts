"use client";

import { useEffect } from "react";

interface Options {
  onToggleTimer: () => void;
  onOpenExport: () => void;
  enabled: boolean;
}

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT" ||
    target.isContentEditable
  );
}

export function useKeyboardShortcuts({
  onToggleTimer,
  onOpenExport,
  enabled,
}: Options) {
  useEffect(() => {
    if (!enabled) return;

    function onKeyDown(e: KeyboardEvent) {
      if (isTypingTarget(e.target)) return;
      if (!e.altKey || !e.shiftKey) return;

      // Alt+Shift+S — start/stop the most recently active timer
      if (e.code === "KeyS") {
        e.preventDefault();
        onToggleTimer();
        return;
      }

      // Alt+Shift+E — open export
      if (e.code === "KeyE") {
        e.preventDefault();
        onOpenExport();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [enabled, onToggleTimer, onOpenExport]);
}