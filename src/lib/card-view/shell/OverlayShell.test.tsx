import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { OverlayShell } from "./OverlayShell";

describe("OverlayShell", () => {
  it("renders the toolbar before the sidebar and main content", () => {
    const { container } = render(
      <OverlayShell
        toolbar={<header data-testid="toolbar" />}
        sidebar={<aside data-testid="sidebar" />}
      >
        <section data-testid="content" />
      </OverlayShell>,
    );

    const shell = container.querySelector(".overlay-shell");
    expect(shell).not.toBeNull();
    expect(Array.from(shell?.children ?? [])).toEqual([
      screen.getByTestId("toolbar"),
      screen.getByTestId("sidebar"),
      screen.getByRole("main"),
    ]);
    expect(screen.getByRole("main")).toContainElement(
      screen.getByTestId("content"),
    );
  });
});
