# CHANGELOG

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html) rules.

## [unreleased]

### Fixed

- Added a `default` export condition alongside `import` in the package `exports`, so bundlers and server-side renderers that resolve under `require`/`module`/`node` conditions (e.g. Docusaurus/webpack) can load the package.
- Restored `@monaco-editor/react` as a dev dependency so the library's unit tests (which render `OverlayCardView` → `ui-components`) can resolve it.
- Scoped the Vitest `exclude` to `**/node_modules/**` so test collection no longer descends into `website/node_modules`.
- Reset the playground's card renderer error boundary when the overlay content changes, so a render error no longer persists after selecting or fixing another overlay.

### Changed

- Migrated the documentation and demo site from Next.js to [Docusaurus](https://docusaurus.io/). The site now lives in `website/` and consumes the library via a `file:..` dependency, matching the structure of the sibling `a2a-editor` and `metadata-renderer` projects. The 3-pane playground (example selector + Monaco JSON editor + live `OverlayCardView`), home page, and new documentation pages (overview, getting started, API reference) were ported over; the library API is unchanged.
- Improved the overlay card layout across embedded and narrow containers by aligning the sidebar search row with the toolbar, sizing the desktop sidebar to its host, and keeping the narrow-screen toolbar and footer visible.

## [[0.2.0](https://github.com/open-resource-discovery/overlay-editor/releases/tag/rel/0.2.0)] - 2026-08-17

### Added

- Initial open-source release.
- `OverlayCardView` — read-only React component that renders an ORD Overlay 0.1 document (overview, target, patch list with merge/replace/remove payloads, deep links).
- `useOverlayStore` — Zustand store the host pushes raw JSON into.
- `useTheme` — module-level dark/light hook with `localStorage` persistence.
- Public types: `OverlayCardViewProps`, `OverlayState`, `Theme`, `ResolvedTheme`, `OrdOverlay`, `OverlayAction`, `OverlayPatch`, `OverlayPerspective`, `OverlaySelector`, `OverlayTarget`, `OverlayVisibility`.
- Bundled example overlays (OpenAPI, A2A, MCP) for the live demo playground.
- GitHub Pages demo at <https://open-resource-discovery.github.io/overlay-editor/>.
- PR preview
