import { describe, it, expect, beforeEach } from "vitest";
import { useThemeStore } from "@/src/lib/card-view/useTheme";

// Smoke test for the library's theme store. The store is module-level, so reset
// it to a known state before each assertion.
describe("useThemeStore", () => {
  beforeEach(() => {
    useThemeStore.getState().setTheme("system");
  });

  it("resolves explicit themes to themselves", () => {
    useThemeStore.getState().setTheme("dark");
    expect(useThemeStore.getState().theme).toBe("dark");
    expect(useThemeStore.getState().resolvedTheme).toBe("dark");

    useThemeStore.getState().setTheme("light");
    expect(useThemeStore.getState().theme).toBe("light");
    expect(useThemeStore.getState().resolvedTheme).toBe("light");
  });

  it("resolves 'system' to a concrete light/dark value", () => {
    useThemeStore.getState().setTheme("system");
    expect(useThemeStore.getState().theme).toBe("system");
    expect(["light", "dark"]).toContain(useThemeStore.getState().resolvedTheme);
  });
});
