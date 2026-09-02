import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PatchBoundary } from "./PatchBoundary";

afterEach(cleanup);

function Boom({ crash }: { crash: boolean }): React.JSX.Element {
  if (crash) throw new Error("boom");
  return <div>healthy child</div>;
}

describe("PatchBoundary", () => {
  it("renders the fallback when a child throws", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});

    render(
      <PatchBoundary resetKey={1}>
        <Boom crash />
      </PatchBoundary>,
    );

    expect(
      screen.getByText("This patch could not be displayed."),
    ).toBeInTheDocument();

    spy.mockRestore();
  });

  it("recovers when resetKey changes and the child stops throwing", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});

    const { rerender } = render(
      <PatchBoundary resetKey={1}>
        <Boom crash />
      </PatchBoundary>,
    );
    expect(
      screen.getByText("This patch could not be displayed."),
    ).toBeInTheDocument();

    rerender(
      <PatchBoundary resetKey={2}>
        <Boom crash={false} />
      </PatchBoundary>,
    );

    await waitFor(() =>
      expect(screen.getByText("healthy child")).toBeInTheDocument(),
    );

    spy.mockRestore();
  });

  it("renders children unchanged when nothing throws", () => {
    render(
      <PatchBoundary resetKey={1}>
        <Boom crash={false} />
      </PatchBoundary>,
    );

    expect(screen.getByText("healthy child")).toBeInTheDocument();
  });
});
