// Standalone bundle entry point for CDN / script-tag usage and for the
// Docusaurus playground.
//
// Why this exists (mirrors @open-resource-discovery/a2a-editor's standalone.ts):
// when the card-view is embedded in a host page that ships UNLAYERED global
// CSS (e.g. Docusaurus/Infima), that host CSS beats every `@layer`-ed rule of
// ui-components regardless of specificity. This bundle is post-processed by
// `vite.standalone.config.ts` (stripCssLayers + stripBarePreflightRules) so the
// shipped CSS is fully unlayered and competes on specificity alone — the
// `.overlay-root :where(...)` scoped preflight (see src/lib/styles.css) then
// wins over host globals, while ui-components' own utilities keep winning by
// source order.
//
// Usage:
// ```html
// <link rel="stylesheet" href=".../overlay-cardview.css">
// <script src=".../overlay-cardview.js"></script>
// <script>
//   OverlayPlayground.init({ el: "#container", content: overlayJson, theme: "light" });
// </script>
// ```
import React from "react";
import { createRoot, type Root } from "react-dom/client";
import { OverlayCardView } from "./card-view/index";
import { useThemeStore, type Theme } from "./card-view/useTheme";

// Import the scoped preflight + layout CSS so it is bundled into
// `overlay-cardview.css`. `OverlayCardView` transitively imports
// `@open-resource-discovery/ui-components/styles`, which — because the
// standalone build externalizes nothing — is bundled here too and stripped of
// its @layer wrappers alongside this file.
import "./styles.css";

export interface OverlayPlaygroundOptions {
  /** Target element — CSS selector string or HTMLElement (required). */
  el: string | HTMLElement;
  /** Raw overlay document (JSON or YAML) to render. */
  content?: string;
  /** Initial theme. Defaults to the stored/"system" preference. */
  theme?: Theme;
}

export interface OverlayPlaygroundInstance {
  /** Switch the active theme ("light" | "dark" | "system"). */
  setTheme(theme: Theme): void;
  /** Replace the rendered overlay document. */
  update(content: string): void;
  /** Unmount and release the React root. */
  destroy(): void;
}

const roots = new Map<HTMLElement, Root>();

function resolveElement(el: string | HTMLElement): HTMLElement {
  const element =
    typeof el === "string" ? document.querySelector<HTMLElement>(el) : el;
  if (!element) {
    throw new Error(
      `OverlayPlayground: target element not found: ${String(el)}`,
    );
  }
  return element;
}

function init(options: OverlayPlaygroundOptions): OverlayPlaygroundInstance {
  const element = resolveElement(options.el);

  if (options.theme) {
    useThemeStore.getState().setTheme(options.theme);
  }

  // Reuse an existing root when re-initialised on the same element.
  let root = roots.get(element);
  if (!root) {
    root = createRoot(element);
    roots.set(element, root);
  }
  const activeRoot = root;
  activeRoot.render(
    React.createElement(OverlayCardView, { content: options.content }),
  );

  return {
    setTheme(theme: Theme) {
      useThemeStore.getState().setTheme(theme);
    },
    update(content: string) {
      activeRoot.render(React.createElement(OverlayCardView, { content }));
    },
    destroy() {
      activeRoot.unmount();
      roots.delete(element);
    },
  };
}

const OverlayPlayground = { init };

declare global {
  interface Window {
    OverlayPlayground: typeof OverlayPlayground;
  }
}

if (typeof window !== "undefined") {
  window.OverlayPlayground = OverlayPlayground;
}

// Re-exported for ESM/type consumers; the IIFE bundle installs the API on
// `window.OverlayPlayground` above. (No default export — keeps the IIFE global
// unambiguous; see vite.standalone.config.ts.)
export { OverlayPlayground };
export { OverlayCardView } from "./card-view/index";
export { useTheme, useThemeStore } from "./card-view/useTheme";
export type { Theme, ResolvedTheme } from "./card-view/useTheme";
