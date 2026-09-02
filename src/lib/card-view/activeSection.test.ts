import {
  OVERVIEW,
  TARGET,
  parseSectionDomId,
  patchAt,
  sectionDomId,
  sectionLabel,
  sectionsEqual,
} from "./activeSection.js";
import type { OverlayPatch } from "./types";

describe("sectionDomId / parseSectionDomId", () => {
  it("round-trips overview, target, and patch sections", () => {
    const sections = [OVERVIEW, TARGET, patchAt(0), patchAt(42)];
    for (const section of sections) {
      expect(parseSectionDomId(sectionDomId(section))).toEqual(section);
    }
  });

  it("returns undefined for an unrecognised DOM id", () => {
    expect(parseSectionDomId("not-a-section")).toBeUndefined();
    expect(parseSectionDomId("patch-")).toBeUndefined();
    expect(parseSectionDomId("patch-abc")).toBeUndefined();
  });
});

describe("sectionsEqual", () => {
  it("treats overview as equal to itself", () => {
    expect(sectionsEqual(OVERVIEW, OVERVIEW)).toBe(true);
  });

  it("treats patches with the same index as equal", () => {
    expect(sectionsEqual(patchAt(3), patchAt(3))).toBe(true);
  });

  it("distinguishes patches with different indexes", () => {
    expect(sectionsEqual(patchAt(0), patchAt(1))).toBe(false);
  });

  it("distinguishes different kinds", () => {
    expect(sectionsEqual(OVERVIEW, TARGET)).toBe(false);
  });
});

describe("sectionLabel", () => {
  it("labels a patch with its uppercased action", () => {
    const patches: OverlayPatch[] = [
      { action: "update", selector: { root: true } },
    ];
    expect(sectionLabel(patchAt(0), patches)).toBe("UPDATE · patch #1");
  });

  it("does not throw for a non-string action", () => {
    const patches = [
      { action: 42, selector: { root: true } },
    ] as unknown as OverlayPatch[];
    expect(() => sectionLabel(patchAt(0), patches)).not.toThrow();
    expect(sectionLabel(patchAt(0), patches)).toBe("42 · patch #1");
  });

  it("does not throw for a non-coercible object action", () => {
    const patches = [
      { action: { toString: null }, selector: { root: true } },
    ] as unknown as OverlayPatch[];
    expect(() => sectionLabel(patchAt(0), patches)).not.toThrow();
  });
});
