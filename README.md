[![REUSE status](https://api.reuse.software/badge/github.com/open-resource-discovery/overlay-editor)](https://api.reuse.software/info/github.com/open-resource-discovery/overlay-editor) [![CI](https://github.com/open-resource-discovery/overlay-editor/actions/workflows/main.yml/badge.svg?branch=main)](https://github.com/open-resource-discovery/overlay-editor/actions/workflows/main.yml) [![npm version](https://img.shields.io/npm/v/@open-resource-discovery/overlay-editor)](https://www.npmjs.com/package/@open-resource-discovery/overlay-editor)

# ORD Overlay Editor

React components for viewing and editing [ORD Overlay 0.1](https://open-resource-discovery.github.io/specification/) documents.

👉 **LIVE DEMO** <https://open-resource-discovery.github.io/overlay-editor/>

## What it ships

- `OverlayCardView` — read-only React component that renders an ORD Overlay 0.1 document (overview, target, patch list with merge/replace/remove payloads, deep links).
- `useOverlayStore` — Zustand store the host pushes raw JSON into.
- `useTheme` — module-level dark/light hook with `localStorage` persistence.
- Public types: `OverlayCardViewProps`, `OverlayState`, `Theme`, `ResolvedTheme`, `OrdOverlay`, `OverlayAction`, `OverlayPatch`, `OverlayPerspective`, `OverlaySelector`, `OverlayTarget`, `OverlayVisibility`.

The library's public surface — entry points, subpaths, and bundled CSS — is declared in `package.json` `exports`.

## Install

Requires Node.js ≥ 22, npm ≥ 10, and React 18 or 19.

```bash
npm install @open-resource-discovery/overlay-editor
```

## Usage

```tsx
import { OverlayCardView } from "@open-resource-discovery/overlay-editor/card-view";
import "@open-resource-discovery/overlay-editor/styles";

export function MyView({ overlay }: { overlay: OrdOverlay }) {
  return <OverlayCardView overlay={overlay} />;
}
```

The `styles` import is side-effecting and must appear once in your application entry file.

## Repo layout

```
src/lib/             Library source (Vite lib build target)
  index.ts           Top-level entry
  card-view.ts       Renderer-host entry
  card-view/         OverlayCardView + store + useTheme + helpers
  styles.css         Bundled CSS

app/                 Next.js demo (App Router, static export)
components/playground/   Demo shell + Playground + JsonEditor
lib/playground/      Demo data (predefined overlays + JSON schema)
public/examples/     Bundled overlay examples for the demo
```

## Development

```bash
npm install
npm run dev          # Next.js demo on http://localhost:3000
npm run check        # typecheck + lint + Vitest
npm run build        # Next.js static export
npm run build:lib    # Vite library build → dist/
```

## Contributing

Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details on how to contribute to this project.

## License

Please see our [LICENSE](LICENSE) for copyright and license information. Detailed information including third-party components and their licensing/copyright information is available [via the REUSE tool](https://api.reuse.software/info/github.com/open-resource-discovery/overlay-editor).
