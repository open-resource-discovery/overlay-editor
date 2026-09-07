import { describe, expect, it } from "vitest";
import { actionVariant, visibilityVariant } from "./badgeVariants";
import type { OverlayAction } from "../types";

describe("actionVariant", () => {
  it("maps known actions to their badge variants", () => {
    expect(actionVariant("update")).toBe("default");
    expect(actionVariant("merge")).toBe("success");
    expect(actionVariant("remove")).toBe("destructive");
  });

  it("falls back to a neutral variant for an unknown action", () => {
    expect(actionVariant("delete" as OverlayAction)).toBe("secondary");
  });
});

describe("visibilityVariant", () => {
  it("maps known visibilities to their badge variants", () => {
    expect(visibilityVariant("public")).toBe("success");
    expect(visibilityVariant("internal")).toBe("warning");
    expect(visibilityVariant("private")).toBe("destructive");
  });
});
