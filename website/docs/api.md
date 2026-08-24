---
sidebar_position: 3
title: API Reference
---

# API Reference

Everything below is exported from the package entry point
`@open-resource-discovery/overlay-editor` (and the equivalent `./card-view`
subpath).

## Components

### `OverlayCardView`

Read-only renderer for an ORD Overlay document.

| Prop      | Type     | Description                                  |
| --------- | -------- | -------------------------------------------- |
| `content` | `string` | The overlay document as JSON or YAML text.   |

The component parses `content` into the overlay store and renders the hero,
target card, and patch list.

## Stores

### `useOverlayStore`

Zustand store holding the parsed overlay and any parse error. Helper selectors:

- `selectParsedOverlay` — the parsed `OrdOverlay`, or `null`.
- `selectParseError` — the parse error message, or `null`.

### `useTheme` / `useThemeStore`

Module-level theme store, persisted to `localStorage` under the `ord-ui-theme`
key (shared with `@open-resource-discovery/ui-components`).

- `useTheme()` returns `{ theme, resolvedTheme, setTheme }`.
- `useThemeStore` is the underlying Zustand store; call
  `useThemeStore.getState().setTheme('light' | 'dark' | 'system')` outside React.

## Utilities

- `cn` — the `clsx` + `tailwind-merge` class-name helper, re-exported from
  `@open-resource-discovery/ui-components`.

## Types

`OrdOverlay`, `OverlayAction`, `OverlayPatch`, `OverlayPerspective`,
`OverlaySelector`, `OverlayTarget`, `OverlayVisibility`, `OverlayCardViewProps`,
`OverlayState`, `Theme`, `ResolvedTheme`.
