import type { OverlayPatch } from "./types";

export type ActiveSection =
  { kind: "overview" } | { kind: "target" } | { kind: "patch"; index: number };

export const OVERVIEW: ActiveSection = { kind: "overview" };
export const TARGET: ActiveSection = { kind: "target" };
export const patchAt = (index: number): ActiveSection => ({
  kind: "patch",
  index,
});

export function sectionDomId(section: ActiveSection): string {
  switch (section.kind) {
    case "overview":
      return "overview";
    case "target":
      return "target";
    case "patch":
      return `patch-${section.index}`;
  }
}

export function parseSectionDomId(id: string): ActiveSection | undefined {
  if (id === "overview") return OVERVIEW;
  if (id === "target") return TARGET;
  const patchMatch = /^patch-(\d+)$/.exec(id);
  if (patchMatch) return patchAt(Number(patchMatch[1]));
  return undefined;
}

export function sectionsEqual(a: ActiveSection, b: ActiveSection): boolean {
  if (a.kind !== b.kind) return false;
  if (a.kind === "patch" && b.kind === "patch") return a.index === b.index;
  return true;
}

export function sectionLabel(
  section: ActiveSection,
  patches: OverlayPatch[],
): string {
  switch (section.kind) {
    case "overview":
      return "Overview";
    case "target":
      return "Target";
    case "patch": {
      const patch = patches[section.index];
      return patch
        ? `${String(patch.action).toUpperCase()} · patch #${section.index + 1}`
        : `Patch #${section.index + 1}`;
    }
  }
}
