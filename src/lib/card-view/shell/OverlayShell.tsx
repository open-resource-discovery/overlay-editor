import type { ReactNode } from "react";

type Props = {
  sidebar: ReactNode;
  toolbar: ReactNode;
  children: ReactNode;
};

export function OverlayShell({ sidebar, toolbar, children }: Props) {
  return (
    <div className="overlay-shell">
      {sidebar}
      <div className="overlay-main">
        {toolbar}
        <main className="overlay-main-content">{children}</main>
      </div>
    </div>
  );
}
