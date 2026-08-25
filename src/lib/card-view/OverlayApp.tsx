"use client";

import { useEffect, useRef, useState } from "react";
import { Tooltip, cn } from "@open-resource-discovery/ui-components";
import {
  useOverlayStore,
  selectParsedOverlay,
  selectParseError,
} from "./store";
import { useTheme } from "./useTheme";
import { OVERVIEW, sectionLabel, type ActiveSection } from "./activeSection";
import { OverlayShell } from "./shell/OverlayShell";
import { OverlaySidebar, OverlaySidebarFooter } from "./shell/OverlaySidebar";
import { OverlayToolbar } from "./shell/OverlayToolbar";
import { HeroBlock } from "./sections/HeroBlock";
import { TargetCard } from "./sections/TargetCard";
import { PatchList } from "./sections/PatchList";
import { useKeyboardNavMarker } from "./util/useKeyboardNavMarker";
import { useDeepLinkOnMount } from "./util/useDeepLinkOnMount";

const WIDE_LAYOUT_MIN_WIDTH = 720;

type FooterPosition = {
  left: number;
  width: number;
};

export function OverlayApp() {
  const overlay = useOverlayStore(selectParsedOverlay);
  const rawContent = useOverlayStore((s) => s.rawJson);
  const parseError = useOverlayStore(selectParseError);
  const { resolvedTheme } = useTheme();
  const [activeSection, setActiveSection] = useState<ActiveSection>(OVERVIEW);
  const [footerPosition, setFooterPosition] = useState<FooterPosition | null>(
    null,
  );
  const [isWideLayout, setIsWideLayout] = useState<boolean | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const mainContentRef = useRef<HTMLElement>(null);
  useKeyboardNavMarker();
  useDeepLinkOnMount(setActiveSection);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const updateFooterPosition = (observedWidth?: number) => {
      const bounds = root.getBoundingClientRect();
      const width = observedWidth ?? bounds.width;
      const nextIsWideLayout = width >= WIDE_LAYOUT_MIN_WIDTH;
      setIsWideLayout((current) =>
        current === nextIsWideLayout ? current : nextIsWideLayout,
      );
      if (nextIsWideLayout) {
        setFooterPosition(null);
        return;
      }

      const { left, width: renderedWidth } = bounds;
      setFooterPosition((current) =>
        current?.left === left && current.width === renderedWidth
          ? current
          : { left, width: renderedWidth },
      );
    };

    const resizeObserver = new ResizeObserver((entries) => {
      updateFooterPosition(entries[0]?.contentRect.width);
    });
    const updateFooterFromPosition = () => updateFooterPosition();
    resizeObserver.observe(root);
    updateFooterPosition();
    window.addEventListener("resize", updateFooterFromPosition);
    window.addEventListener("scroll", updateFooterFromPosition, true);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateFooterFromPosition);
      window.removeEventListener("scroll", updateFooterFromPosition, true);
    };
  }, [overlay]);

  const rootClassName = cn(
    "ord-ui",
    "text-foreground",
    "overlay-root",
    resolvedTheme === "dark" && "dark",
  );

  if (!overlay) {
    const message =
      parseError ?? "Document is missing the required `ordOverlay` field.";
    return (
      <div ref={rootRef} className={rootClassName}>
        <div className="overlay-fatal">
          <h1>Invalid Overlay</h1>
          <p>{message}</p>
        </div>
      </div>
    );
  }

  const patches = overlay.patches ?? [];

  return (
    <>
      <div ref={rootRef} className={rootClassName}>
        <Tooltip.Provider>
          <OverlayShell
            contentRef={mainContentRef}
            toolbar={
              <OverlayToolbar
                overlay={overlay}
                rawContent={rawContent}
                currentSectionLabel={sectionLabel(activeSection, patches)}
              />
            }
            sidebar={
              <OverlaySidebar
                overlay={overlay}
                activeSection={activeSection}
                onSectionChange={setActiveSection}
                scrollRootRef={mainContentRef}
                useScrollRoot={isWideLayout === true}
              />
            }
          >
            <HeroBlock overlay={overlay} />
            {overlay.target ? <TargetCard target={overlay.target} /> : null}
            <PatchList patches={patches} />
          </OverlayShell>
        </Tooltip.Provider>
      </div>
      {footerPosition ? (
        <OverlaySidebarFooter
          ordOverlay={overlay.ordOverlay}
          className={cn(
            "ord-ui",
            "text-foreground",
            "overlay-sidebar-footer-mobile",
            resolvedTheme === "dark" && "dark",
          )}
          style={footerPosition}
        />
      ) : null}
    </>
  );
}
