---
sidebar_position: 1
title: Overview
---

# ORD Overlay Editor

`@open-resource-discovery/overlay-editor` is a React component library for
**viewing ORD Overlay 0.1 documents**. An ORD Overlay is a JSON or YAML document
(identified by `ordOverlay: "0.1"`) that describes **patches** to apply to an
existing API or metadata definition — OpenAPI, EDMX/OData, CSN Interop, an MCP
server card, or an A2A agent card — without editing the original source.

Each patch targets a concept in the underlying definition using a **selector**
(for example an operation, an entity type, or a JSON path) and declares an
`action` of `update`, `merge`, or `remove`.

## What's in the box

- **`OverlayCardView`** — a self-contained, read-only component that renders an
  overlay document as a card view: an overview hero, the patch target, and a
  searchable list of patches with per-patch selector chips, action badges,
  descriptions, tags, and syntax-highlighted payloads.
- A small **theme store** (`useTheme` / `useThemeStore`) and **content store**
  (`useOverlayStore`) that back the component.

## Try it

Head to the [**Playground**](/playground) to browse predefined examples, edit
the raw overlay JSON, and see the rendered card view update live.

Learn how to install and embed the component in [Getting Started](./getting-started.md).
