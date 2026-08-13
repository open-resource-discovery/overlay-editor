// Zustand-backed overlay document store. Mirrors `@open-resource-discovery/a2a-editor`'s
// `useAgentCardStore` so the metadata-renderer wrapper and any other consumer
// can push raw JSON/YAML through the same `setRawJson(content)` interface
// they already use for a2a/mcp.

import { create } from "zustand";
import type { UseBoundStore, StoreApi } from "zustand";
import { loadObject } from "./loadObject";
import type { OrdOverlay } from "./types";

export interface OverlayState {
  rawJson: string;
  parsedOverlay: OrdOverlay | null;
  lastValidOverlay: OrdOverlay | null;
  parseError: string | null;
  isDirty: boolean;
  setRawJson: (json: string) => void;
  reset: () => void;
}

function parseOverlay(raw: string): {
  overlay: OrdOverlay | null;
  error: string | null;
} {
  if (!raw.trim()) return { overlay: null, error: null };
  try {
    const obj = loadObject(raw);
    if (!obj) return { overlay: null, error: "Invalid JSON or YAML" };
    const o = obj as { ordOverlay?: unknown };
    if (typeof o.ordOverlay !== "string") {
      return {
        overlay: null,
        error: "Document is missing the required `ordOverlay` field.",
      };
    }
    return { overlay: obj as OrdOverlay, error: null };
  } catch (e) {
    return {
      overlay: null,
      error: e instanceof Error ? e.message : "Invalid overlay document",
    };
  }
}

const initial: OverlayState = {
  rawJson: "",
  parsedOverlay: null,
  lastValidOverlay: null,
  parseError: null,
  isDirty: false,
  setRawJson: () => {},
  reset: () => {},
};

export const useOverlayStore: UseBoundStore<StoreApi<OverlayState>> =
  create<OverlayState>((set) => ({
    ...initial,
    setRawJson: (json) => {
      const { overlay, error } = parseOverlay(json);
      set((s) => ({
        rawJson: json,
        parsedOverlay: overlay,
        parseError: error,
        isDirty: true,
        lastValidOverlay: overlay ?? s.lastValidOverlay,
      }));
    },
    reset: () =>
      set({
        rawJson: "",
        parsedOverlay: null,
        lastValidOverlay: null,
        parseError: null,
        isDirty: false,
      }),
  }));

/** Selector: parsed overlay (or null when input is empty / invalid). */
export const selectParsedOverlay = (state: OverlayState): OrdOverlay | null =>
  state.parsedOverlay;

/** Selector: most recent parse error message (or null if last parse succeeded). */
export const selectParseError = (state: OverlayState): string | null =>
  state.parseError;
