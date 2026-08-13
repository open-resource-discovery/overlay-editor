// Zustand-backed theme store. Mirrors `@open-resource-discovery/a2a-editor`'s
// useTheme: a single module-level store so the wrapper component, the host
// renderer (metadata-renderer/src/lib/overlay/index.tsx), and any other
// consumer all share one source of truth.
//
// Persisted as a plain string under the `ord-ui-theme` key — same key
// ui-components ThemeRoot writes to, so existing user preference carries.

import { create } from "zustand";

export type Theme = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

interface ThemeState {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
}

const STORAGE_KEY = "ord-ui-theme";

function readStoredTheme(): Theme {
  if (typeof window === "undefined") return "system";
  try {
    const v = window.localStorage?.getItem(STORAGE_KEY);
    return v === "light" || v === "dark" || v === "system" ? v : "system";
  } catch {
    return "system";
  }
}

function getSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function")
    return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function resolveTheme(theme: Theme): ResolvedTheme {
  return theme === "system" ? getSystemTheme() : theme;
}

const initial = readStoredTheme();

export const useThemeStore = create<ThemeState>((set) => ({
  theme: initial,
  resolvedTheme: resolveTheme(initial),
  setTheme: (theme) => {
    const resolvedTheme = resolveTheme(theme);
    if (typeof window !== "undefined") {
      try {
        window.localStorage?.setItem(STORAGE_KEY, theme);
      } catch {
        // localStorage may be unavailable (private mode, sandboxed test runners) — silent.
      }
    }
    set({ theme, resolvedTheme });
  },
}));

// Single global listener for OS theme changes — only re-resolves when the
// stored preference is "system". Mirror of a2a-editor's pattern.
if (typeof window !== "undefined" && typeof window.matchMedia === "function") {
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  mq.addEventListener("change", () => {
    const { theme } = useThemeStore.getState();
    if (theme !== "system") return;
    useThemeStore.setState({ resolvedTheme: getSystemTheme() });
  });
}

/**
 * Access and mutate the overlay-editor theme. Backed by a module-level
 * Zustand store so every caller stays in sync.
 *
 * Mirrors `useTheme` from `@open-resource-discovery/a2a-editor` exactly.
 */
export function useTheme(): {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
} {
  const theme = useThemeStore((s) => s.theme);
  const resolvedTheme = useThemeStore((s) => s.resolvedTheme);
  const setTheme = useThemeStore((s) => s.setTheme);
  return { theme, resolvedTheme, setTheme };
}
