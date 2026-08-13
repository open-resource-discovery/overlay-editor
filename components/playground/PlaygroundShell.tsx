"use client";

import { useEffect } from "react";
import { useTheme } from "@/src/lib/card-view";
import { AppHeader } from "@/components/playground/AppHeader";

/**
 * Top-level chrome for every page below the root layout. Renders the shared
 * `<AppHeader>` and the routed page content under a `.ord-ui` root so the
 * design-system tokens resolve.
 *
 * Instead of mounting `<ThemeRoot>` from `@open-resource-discovery/ui-components`
 * (which keeps its own per-hook React state and never re-reads localStorage —
 * see PR #4 commit bfe6c0a), we read theme straight from the overlay-editor
 * lib's Zustand-backed `useTheme` and mirror `dark` onto our own root + the
 * `<html>` element. This matches the pattern a2a-editor uses internally and
 * keeps `useTheme()` callers across the app in lockstep.
 */
export function PlaygroundShell({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.classList.toggle("dark", resolvedTheme === "dark");
  }, [resolvedTheme]);

  return (
    <div
      className={
        "ord-ui text-foreground flex h-full min-h-0 flex-1 flex-col" +
        (resolvedTheme === "dark" ? " dark" : "")
      }
    >
      <AppHeader />
      {children}
    </div>
  );
}
