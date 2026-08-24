import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("./OverlayApp", () => ({
  OverlayApp: () => <div data-testid="overlay-app" />,
}));

import { OverlayCardView } from "./index";

describe("OverlayCardView", () => {
  it("keeps its base layout class without overriding host height styles", () => {
    const hostStyles = document.createElement("style");
    hostStyles.textContent = ".host-height { height: 123px; }";
    document.head.appendChild(hostStyles);

    try {
      render(<OverlayCardView className="host-height" />);
      const wrapper = screen.getByTestId("overlay-app").parentElement;

      expect(wrapper).toHaveClass("overlay-card-view", "host-height");
      if (!wrapper) throw new Error("Overlay wrapper was not rendered");
      expect(getComputedStyle(wrapper).height).toBe("123px");
    } finally {
      hostStyles.remove();
    }
  });
});
