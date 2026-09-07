import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PatchCard } from "./PatchCard";
import type { OverlayPatch } from "../types";

afterEach(cleanup);

describe("PatchCard", () => {
  it("does not crash on an object-valued action and still shows the payload", () => {
    // React throws "Objects are not valid as a React child" if an object
    // action is rendered raw — which would hide the payload behind the
    // per-patch error boundary. The action must be stringified for display.
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const patch = {
      action: {},
      selector: { root: true },
      data: { title: "New title" },
    } as unknown as OverlayPatch;

    const { container } = render(
      <PatchCard patch={patch} index={0} defaultOpen />,
    );

    expect(screen.getByText(/Unrecognized patch action/i)).toBeInTheDocument();
    expect(container.textContent).toContain("New title");

    spy.mockRestore();
  });
});
