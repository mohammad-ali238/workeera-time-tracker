"use client";

import { useEffect } from "react";
import type { Timer } from "@/lib/types";
import { formatDuration, getElapsed } from "@/lib/time";

const BASE_TITLE = "Workeera Tracker";

export function useDocumentTitle(timers: Timer[], hydrated: boolean) {
  useEffect(() => {
    if (!hydrated) return;

    function update() {
      const running = timers.filter((t) => t.status === "running");
      if (running.length === 0) {
        if (document.title !== BASE_TITLE) document.title = BASE_TITLE;
        return;
      }
      const elapsed = getElapsed(running[0], Date.now());
      const next = `⏱ ${formatDuration(elapsed)} — ${BASE_TITLE}`;
      if (document.title !== next) document.title = next;
    }

    update();
    const id = setInterval(update, 1000);
    return () => {
      clearInterval(id);
      document.title = BASE_TITLE;
    };
  }, [timers, hydrated]);
}
