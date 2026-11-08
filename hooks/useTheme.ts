"use client";

import { useCallback, useEffect, useState } from "react";

const THEME_KEY = "workeera-theme";

export function useTheme() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggle = useCallback(() => {
    setIsDark((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle("dark", next);
      try {
        localStorage.setItem(THEME_KEY, next ? "dark" : "light");
      } catch {}
      return next;
    });
  }, []);

  return { isDark, toggle };
}