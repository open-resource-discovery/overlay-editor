import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { PatchData } from "./PatchData";
import type { OverlayPatch } from "../types";

afterEach(cleanup);

describe("PatchData", () => {
  it("renders the known presentation without a warning for a valid action", () => {
    const patch: OverlayPatch = {
      action: "update",
      selector: { root: true },
      data: { title: "New title" },
    };
    const { container } = render(<PatchData patch={patch} />);

    expect(screen.getByText("Replacement value")).toBeInTheDocument();
    expect(container.querySelector(".overlay-callout-destructive")).toBeNull();
  });

  it("does not crash on an unrecognized action and still shows the payload", () => {
    // `action` is typed as `OverlayAction`, but real documents are parsed from
    // untrusted input — simulate an out-of-union value.
    const patch = {
      action: "delete",
      selector: { root: true },
      data: { title: "New title" },
    } as unknown as OverlayPatch;

    const { container } = render(<PatchData patch={patch} />);

    // Warning callout is shown...
    expect(screen.getByText(/Unrecognized patch action/i)).toBeInTheDocument();
    // "delete" appears both in the callout and in the action badge.
    expect(screen.getAllByText("delete").length).toBeGreaterThan(0);
    // ...and the raw payload still renders under the generic label.
    expect(screen.getByText("Patch data")).toBeInTheDocument();
    expect(container.textContent).toContain("New title");
  });

  it("does not crash on a non-string action", () => {
    const patch = {
      action: 42,
      selector: { root: true },
      data: { title: "x" },
    } as unknown as OverlayPatch;

    expect(() => render(<PatchData patch={patch} />)).not.toThrow();
    expect(screen.getByText(/Unrecognized patch action/i)).toBeInTheDocument();
  });

  it("renders the removal callout for a remove patch without data", () => {
    const patch: OverlayPatch = { action: "remove", selector: { root: true } };
    render(<PatchData patch={patch} />);

    expect(screen.getByText(/removes/i)).toBeInTheDocument();
  });
});
