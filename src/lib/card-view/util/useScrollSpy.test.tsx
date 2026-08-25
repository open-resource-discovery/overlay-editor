import { render, screen, waitFor } from "@testing-library/react";
import { useRef } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { OVERVIEW } from "../activeSection";
import { useScrollSpy } from "./useScrollSpy";

const observerRoots: Array<Element | Document | null | undefined> = [];

class IntersectionObserverStub implements IntersectionObserver {
  readonly root = null;
  readonly rootMargin = "0px";
  readonly scrollMargin = "0px";
  readonly thresholds = [0];

  constructor(
    _callback: IntersectionObserverCallback,
    options?: IntersectionObserverInit,
  ) {
    observerRoots.push(options?.root);
  }

  disconnect() {}

  observe() {}

  takeRecords() {
    return [];
  }

  unobserve() {}
}

function ScrollSpyHarness({ useScrollRoot }: { useScrollRoot: boolean }) {
  const rootRef = useRef<HTMLDivElement>(null);
  useScrollSpy(["overview"], OVERVIEW, () => {}, rootRef, useScrollRoot);

  return (
    <div ref={rootRef} data-testid="scroll-root" style={{ overflowY: "auto" }}>
      <section id="overview" />
    </div>
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
  observerRoots.length = 0;
});

describe("useScrollSpy", () => {
  it("recreates the observer when the scroll root mode changes", async () => {
    vi.stubGlobal("IntersectionObserver", IntersectionObserverStub);

    const { rerender } = render(<ScrollSpyHarness useScrollRoot={false} />);

    await waitFor(() => {
      expect(observerRoots.at(-1)).toBeNull();
    });

    rerender(<ScrollSpyHarness useScrollRoot />);

    await waitFor(() => {
      expect(observerRoots.at(-1)).toBe(screen.getByTestId("scroll-root"));
    });
  });
});
