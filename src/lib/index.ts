// Aggregator entry point for `@open-resource-discovery/overlay-editor`.
//
// Same surface as `./card-view`. Both subpaths share the same chunk so
// importing either resolves to the same module instance — wrappers can pick
// whichever import path reads better.
//
// `./styles.css` is imported here as a side effect so Vite emits a single
// `dist/index.css` consumers can pull via the `./styles` subpath. The same
// CSS is also injected at runtime by `OverlayCardView` so the component
// renders correctly even when consumers forget the style import.
import "./styles.css";

export {
  OverlayCardView,
  useOverlayStore,
  selectParsedOverlay,
  selectParseError,
  useTheme,
  useThemeStore,
  cn,
} from "./card-view";
export type {
  OverlayCardViewProps,
  OverlayState,
  Theme,
  ResolvedTheme,
  OrdOverlay,
  OverlayAction,
  OverlayPatch,
  OverlayPerspective,
  OverlaySelector,
  OverlayTarget,
  OverlayVisibility,
} from "./card-view";
