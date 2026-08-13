"use client";

import { useEffect, useState } from "react";

type ShellComponent = React.ComponentType<{ children: React.ReactNode }>;

/**
 * Mounts {@link PlaygroundShell} on the client only because
 * `@open-resource-discovery/ui-components` and its `react-markdown`
 * transitive dep touch `document` at module load. During the chunk
 * wait we render a fixed-height skeleton header so the page below
 * doesn't visibly jump once the real header arrives.
 */
export function RootShell({ children }: { children: React.ReactNode }) {
  const [Shell, setShell] = useState<ShellComponent | null>(null);

  useEffect(() => {
    let alive = true;
    import("@/components/playground/PlaygroundShell").then((m) => {
      if (alive) setShell(() => m.PlaygroundShell);
    });
    return () => {
      alive = false;
    };
  }, []);

  if (Shell) return <Shell>{children}</Shell>;

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <div
        aria-hidden
        className="h-14 shrink-0 border-b border-border bg-background"
      />
      {children}
    </div>
  );
}
