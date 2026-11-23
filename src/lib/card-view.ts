// Entry point for the published `./view` subpath of
// `@open-resource-discovery/overlay-editor`.
//
// Surface mirrors `@open-resource-discovery/a2a-editor/card-view`:
//   - One read-only component
//   - One Zustand store the wrapper pushes content into
//   - One useTheme hook backed by a module-level store
//   - Trivial selectors and shared utils
//
// This lets metadata-renderer's `src/lib/overlay/index.tsx` consume overlay
// the same way it already consumes a2a/mcp — no special-cased wrapper.

// Re-export the shared `cn` helper from ui-components — matches a2a-editor's
// `/card-view` export of cn so wrappers can pull it from one place.
export { cn } from "@open-resource-discovery/ui-components";
export type { OverlayCardViewProps } from "./card-view/index";
export { OverlayCardView } from "./card-view/index";
export type { OverlayState } from "./card-view/store";
export {
  selectParsedOverlay,
  selectParseError,
  useOverlayStore,
} from "./card-view/store";
export type {
  OrdOverlay,
  OverlayAction,
  OverlayPatch,
  OverlayPerspective,
  OverlaySelector,
  OverlayTarget,
  OverlayVisibility,
} from "./card-view/types";
export type { ResolvedTheme, Theme } from "./card-view/useTheme";
export { useTheme, useThemeStore } from "./card-view/useTheme";
