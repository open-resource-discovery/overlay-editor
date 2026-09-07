import { describe, expect, it } from "vitest";
import { formatAction } from "./formatAction";

describe("formatAction", () => {
  it("returns strings unchanged", () => {
    expect(formatAction("update")).toBe("update");
    expect(formatAction("")).toBe("");
  });

  it("formats primitives without throwing", () => {
    expect(formatAction(42)).toBe("42");
    expect(formatAction(true)).toBe("true");
    expect(formatAction(null)).toBe("null");
    expect(formatAction(undefined)).toBe("");
  });

  it("does not invoke user-controlled coercion (the { toString: null } crash)", () => {
    // `String({ toString: null })` throws "Cannot convert object to primitive
    // value"; formatAction must not.
    expect(() => formatAction({ toString: null })).not.toThrow();
    expect(formatAction({ toString: null })).toBe('{"toString":null}');
  });

  it("never calls a throwing toString/valueOf", () => {
    const hostile = {
      toString() {
        throw new Error("nope");
      },
      valueOf() {
        throw new Error("nope");
      },
      kind: "x",
    };
    expect(() => formatAction(hostile)).not.toThrow();
  });

  it("falls back gracefully when JSON.stringify throws", () => {
    const circular: Record<string, unknown> = {};
    circular.self = circular;
    expect(formatAction(circular)).toBe("[unrenderable action]");
  });

  it("serializes arrays as JSON (not coerced to a bare string)", () => {
    expect(formatAction(["update"])).toBe('["update"]');
  });
});
