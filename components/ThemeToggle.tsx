"use client";

import { useSyncExternalStore } from "react";

type Theme = "light" | "dark";

const THEME_KEY = "cancertime-theme";
const THEME_EVENT = "cancertime-theme-change";

function getTheme(): Theme {
  if (typeof document === "undefined") return "light";
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

function getSavedTheme(): Theme | null {
  try {
    const savedTheme = window.localStorage.getItem(THEME_KEY);
    return savedTheme === "light" || savedTheme === "dark" ? savedTheme : null;
  } catch {
    return null;
  }
}

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
}

function subscribe(callback: () => void) {
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  const handleSystemChange = () => {
    if (!getSavedTheme()) {
      applyTheme(media.matches ? "dark" : "light");
      callback();
    }
  };
  const handleStorage = (event: StorageEvent) => {
    if (event.key !== THEME_KEY) return;
    const savedTheme = getSavedTheme();
    applyTheme(savedTheme ?? (media.matches ? "dark" : "light"));
    callback();
  };

  window.addEventListener(THEME_EVENT, callback);
  window.addEventListener("storage", handleStorage);
  media.addEventListener("change", handleSystemChange);

  return () => {
    window.removeEventListener(THEME_EVENT, callback);
    window.removeEventListener("storage", handleStorage);
    media.removeEventListener("change", handleSystemChange);
  };
}

function getServerTheme(): Theme {
  return "light";
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getTheme, getServerTheme);
  const isDark = theme === "dark";

  function toggleTheme() {
    const nextTheme: Theme = isDark ? "light" : "dark";
    applyTheme(nextTheme);
    try {
      window.localStorage.setItem(THEME_KEY, nextTheme);
    } catch {
      // The selected theme still applies for this page if storage is unavailable.
    }
    window.dispatchEvent(new Event(THEME_EVENT));
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      aria-pressed={isDark}
      className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border border-line bg-surface px-3 text-sm font-bold text-ink shadow-sm outline-none hover:border-teal hover:text-teal focus-visible:ring-4 focus-visible:ring-teal/20"
    >
      {isDark ? (
        <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
      ) : (
        <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M20.5 15.2A8.5 8.5 0 0 1 8.8 3.5a8.5 8.5 0 1 0 11.7 11.7Z" />
        </svg>
      )}
      <span className="hidden min-[375px]:inline">{isDark ? "Light" : "Dark"}</span>
    </button>
  );
}
