import type { ReactNode } from "react";

export function Mono({ children }: { children: ReactNode }) {
  return <code className="font-mono text-sm">{children}</code>;
}

export function Row({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="overlay-target-row">
      <span className="overlay-target-label">{label}</span>
      <span className="overlay-target-value">{children}</span>
    </div>
  );
}
