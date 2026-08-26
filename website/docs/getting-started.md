---
sidebar_position: 2
title: Getting Started
---

# Getting Started

## Installation

```bash
npm install @open-resource-discovery/overlay-editor
```

`react` and `react-dom` (v18 or v19) are peer dependencies and must be installed
by the host application.

## Basic usage

Import the component and its stylesheet, then pass an overlay document (JSON or
YAML text) via the `content` prop:

```tsx
import { OverlayCardView } from '@open-resource-discovery/overlay-editor';
import '@open-resource-discovery/overlay-editor/styles';

const overlay = JSON.stringify({
  ordOverlay: '0.1',
  // ...
});

export function App() {
  return <OverlayCardView content={overlay} />;
}
```

`OverlayCardView` also injects its layout CSS at runtime, so it renders
correctly even if the `./styles` import is omitted — importing the stylesheet is
still recommended so styles are present on first paint.

## Theming

The component renders under an `.ord-ui` root and follows the shared
`@open-resource-discovery/ui-components` two-layer token system. Light/dark mode
is controlled by the library's theme store:

```tsx
import { useThemeStore } from '@open-resource-discovery/overlay-editor';

// Sync the component to your app's color mode:
useThemeStore.getState().setTheme('dark'); // 'light' | 'dark' | 'system'
```

See the [API Reference](./api.md) for the full exported surface.
