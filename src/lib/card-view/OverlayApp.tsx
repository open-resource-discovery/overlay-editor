"use client";

import { useState } from "react";
import { Tooltip, cn } from "@open-resource-discovery/ui-components";
import {
  useOverlayStore,
  selectParsedOverlay,
  selectParseError,
} from "./store";
import { useTheme } from "./useTheme";
import { OVERVIEW, sectionLabel, type ActiveSection } from "./activeSection";
import { OverlayShell } from "./shell/OverlayShell";
import { OverlaySidebar } from "./shell/OverlaySidebar";
import { OverlayToolbar } from "./shell/OverlayToolbar";
import { HeroBlock } from "./sections/HeroBlock";
import { TargetCard } from "./sections/TargetCard";
import { PatchList } from "./sections/PatchList";
import { useKeyboardNavMarker } from "./util/useKeyboardNavMarker";
import { useDeepLinkOnMount } from "./util/useDeepLinkOnMount";

/**
 * Read-only renderer body for an ORD Overlay 0.1 document.
 *
 * Subscribes to the module-level `useOverlayStore` so any caller that pushes
 * content via `useOverlayStore.getState().setRawJson(content)` updates this
 * view live — mirrors `AgentCardView` from `@open-resource-discovery/a2a-editor`.
 */
export function OverlayApp() {
  const overlay = useOverlayStore(selectParsedOverlay);
  const rawContent = useOverlayStore((s) => s.rawJson);
  const parseError = useOverlayStore(selectParseError);
  const { resolvedTheme } = useTheme();
  const [activeSection, setActiveSection] = useState<ActiveSection>(OVERVIEW);
  useKeyboardNavMarker();
  useDeepLinkOnMount(setActiveSection);

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
      <div className={rootClassName}>
        <div className="overlay-fatal">
          <h1>Invalid Overlay</h1>
          <p>{message}</p>
        </div>
      </div>
    );
  }

  const patches = overlay.patches ?? [];

  return (
    <div className={rootClassName}>
      <Tooltip.Provider>
        <OverlayShell
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
            />
          }
        >
          <HeroBlock overlay={overlay} />
          {overlay.target ? <TargetCard target={overlay.target} /> : null}
          <PatchList patches={patches} />
        </OverlayShell>
      </Tooltip.Provider>
    </div>
  );
}
