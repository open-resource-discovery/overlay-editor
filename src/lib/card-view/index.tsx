"use client";

import "@open-resource-discovery/ui-components/styles";
import { useEffect } from "react";
import { useOverlayStore } from "./store";
import { OverlayApp } from "./OverlayApp";
import overlayLayoutStyles from "./styles";

export type OverlayCardViewProps = {
  /**
   * Raw overlay document (JSON or YAML). When set, the view pushes the
   * value into `useOverlayStore` so the rendered content stays in sync.
   *
   * If you want to drive the store directly (e.g. from a host app that
   * already imports `useOverlayStore` from this package), omit `content`
   * and call `useOverlayStore.getState().setRawJson(...)` yourself —
   * same pattern as `@open-resource-discovery/a2a-editor`'s
   * `useAgentCardStore`.
   */
  content?: string;
  /** Forwarded to the outermost wrapper. Layout/spacing class. */
  className?: string;
};

const LAYOUT_STYLE_MARKER = "overlay-card-view";
let layoutStyleInjected = false;

function injectLayoutStyles() {
  if (typeof document === "undefined" || layoutStyleInjected) return;
  layoutStyleInjected = true;
  const styleElement = document.createElement("style");
  styleElement.dataset.overlayEditor = LAYOUT_STYLE_MARKER;
  styleElement.textContent = overlayLayoutStyles;
  document.head.appendChild(styleElement);
}

/**
 * Read-only renderer for an ORD Overlay 0.1 document.
 *
 * Mirrors `<AgentCardView readOnly />` from `@open-resource-discovery/a2a-editor`:
 * the actual content lives in a module-level Zustand store (`useOverlayStore`),
 * the active theme lives in `useThemeStore`. Pass `content` as a prop for
 * convenience, or drive both stores directly from the host.
 */
export function OverlayCardView({ content, className }: OverlayCardViewProps) {
  useEffect(injectLayoutStyles, []);
  useEffect(() => {
    if (content === undefined) return;
    useOverlayStore.getState().setRawJson(content);
  }, [content]);

  return (
    <div className={className}>
      <OverlayApp />
    </div>
  );
}
