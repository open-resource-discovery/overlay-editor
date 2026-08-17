# CHANGELOG

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html) rules.

## [unreleased]

### Added

- Initial open-source release.
- `OverlayCardView` — read-only React component that renders an ORD Overlay 0.1 document (overview, target, patch list with merge/replace/remove payloads, deep links).
- `useOverlayStore` — Zustand store the host pushes raw JSON into.
- `useTheme` — module-level dark/light hook with `localStorage` persistence.
- Public types: `OverlayCardViewProps`, `OverlayState`, `Theme`, `ResolvedTheme`, `OrdOverlay`, `OverlayAction`, `OverlayPatch`, `OverlayPerspective`, `OverlaySelector`, `OverlayTarget`, `OverlayVisibility`.
- Bundled example overlays (OpenAPI, A2A, MCP) for the live demo playground.
- GitHub Pages demo at <https://open-resource-discovery.github.io/overlay-editor/>.
- PR preview
