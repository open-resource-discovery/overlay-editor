import type { ReactNode, Ref } from "react";

type Props = {
  sidebar: ReactNode;
  toolbar: ReactNode;
  children: ReactNode;
  contentRef?: Ref<HTMLElement>;
};

export function OverlayShell({
  sidebar,
  toolbar,
  children,
  contentRef,
}: Props) {
  return (
    <div className="overlay-shell">
      {toolbar}
      {sidebar}
      <main ref={contentRef} className="overlay-main-content">
        {children}
      </main>
    </div>
  );
}
