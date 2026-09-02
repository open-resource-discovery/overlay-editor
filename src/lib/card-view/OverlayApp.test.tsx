import { cleanup, render, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { OverlayApp } from "./OverlayApp";
import { useOverlayStore } from "./store";

vi.mock("./util/useScrollSpy", () => ({
  useScrollSpy: () => {},
}));
vi.mock("./util/useDeepLinkOnMount", () => ({
  useDeepLinkOnMount: () => {},
}));

class ResizeObserverStub implements ResizeObserver {
  constructor(private readonly callback: ResizeObserverCallback) {}

  observe() {
    this.callback([], this);
  }

  disconnect() {}

  unobserve() {}
}

let renderedWidth: number;

beforeEach(() => {
  renderedWidth = 719.25;
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(
    () => new DOMRect(12.5, 0, renderedWidth, 0),
  );
  vi.stubGlobal("ResizeObserver", ResizeObserverStub);
  useOverlayStore.getState().setRawJson('{"ordOverlay":"0.1","patches":[]}');
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  useOverlayStore.getState().reset();
});

describe("OverlayApp", () => {
  it("renders the mobile footer outside the query container", async () => {
    const { container } = render(<OverlayApp />);
    const root = container.querySelector(".overlay-root");

    expect(root).not.toBeNull();
    await waitFor(() => {
      const mobileFooter = container.querySelector(
        ".overlay-sidebar-footer-mobile",
      );
      expect(mobileFooter).not.toBeNull();
      expect(root?.nextElementSibling).toBe(mobileFooter);
      expect(mobileFooter).toHaveStyle({
        left: "12.5px",
        width: "719.25px",
      });
    });
  });

  it("does not render the mobile footer for a wide container", () => {
    renderedWidth = 720;
    const { container } = render(<OverlayApp />);

    expect(
      container.querySelector(".overlay-sidebar-footer-mobile"),
    ).toBeNull();
  });

  it("renders without crashing when a patch action is a non-coercible object", () => {
    // `{"action":{"toString":null}}` is valid JSON. `String(action)` would
    // throw "Cannot convert object to primitive value" — and the sidebar/
    // toolbar render outside the per-patch error boundary, so the whole view
    // would crash. Regression guard for that path.
    useOverlayStore
      .getState()
      .setRawJson(
        '{"ordOverlay":"0.1","patches":[{"action":{"toString":null},"selector":{"root":true},"data":{"title":"x"}}]}',
      );

    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    let container: HTMLElement | undefined;
    expect(() => {
      container = render(<OverlayApp />).container;
    }).not.toThrow();
    // The sidebar (rendered outside PatchBoundary) is present, proving the
    // whole view survived.
    expect(container?.querySelector(".overlay-root")).not.toBeNull();
    spy.mockRestore();
  });
});
