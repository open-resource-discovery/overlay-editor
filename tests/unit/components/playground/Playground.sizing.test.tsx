import { render, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";

// Capture sizing props passed to the underlying `react-resizable-panels` panels.
// In v4, numeric `defaultSize`/`minSize`/`maxSize` are interpreted as
// **pixels**, not percentages — so the original `defaultSize={22}` collapsed
// the left pane to a 22 px strip. Sizes intended as percentages must be
// passed as strings like `"22%"` (or numbers ending in `%`).
const capturedPanelProps: Array<{
  defaultSize?: number | string;
  minSize?: number | string;
  maxSize?: number | string;
}> = [];

vi.mock("@open-resource-discovery/ui-components", async () => {
  const actual = await vi.importActual<
    typeof import("@open-resource-discovery/ui-components")
  >("@open-resource-discovery/ui-components");
  const Panel = ({
    defaultSize,
    minSize,
    maxSize,
    children,
  }: {
    defaultSize?: number | string;
    minSize?: number | string;
    maxSize?: number | string;
    children?: React.ReactNode;
  }) => {
    capturedPanelProps.push({ defaultSize, minSize, maxSize });
    return <div data-testid="panel">{children}</div>;
  };
  const Root = ({ children }: { children?: React.ReactNode }) => (
    <div>{children}</div>
  );
  const Handle = () => <div role="separator" />;
  const SplitPane = Object.assign(Root, { Root, Panel, Handle });
  return { ...actual, SplitPane };
});

// Stub out the heavy children — we only care about the SplitPane wiring here.
vi.mock("@/components/playground/JsonEditor", () => ({
  JsonEditor: () => <div data-testid="json-editor" />,
}));
vi.mock("@/src/lib/card-view", () => ({
  OverlayCardView: () => <div data-testid="card-view" />,
}));
vi.mock("@/components/playground/OverlaySelector", () => ({
  OverlaySelector: () => <div data-testid="overlay-selector" />,
}));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: () => {}, refresh: () => {} }),
  useSearchParams: () => new URLSearchParams(),
}));
vi.mock("@/lib/playground/predefined-overlays", () => ({
  loadPredefinedOverlays: vi.fn().mockResolvedValue([]),
  loadOverlayBody: vi.fn().mockResolvedValue(""),
}));

import { Playground } from "@/components/playground/Playground";

afterEach(() => {
  capturedPanelProps.length = 0;
  cleanup();
});

describe("Playground SplitPane sizing", () => {
  it("passes percentage-typed sizes to each panel (not bare numbers)", () => {
    render(<Playground />);

    // Three panels: selector | editor | card view.
    expect(capturedPanelProps).toHaveLength(3);

    for (const props of capturedPanelProps) {
      for (const v of [props.defaultSize, props.minSize, props.maxSize]) {
        if (v === undefined) continue;
        // react-resizable-panels@4 treats raw numbers as **pixels**.
        // For the percentage-based layout we want, every size must be
        // either a string ending in "%" or a number ≤ 100 *only* if
        // it's explicitly documented as percent — but the safest
        // contract is to require strings with the % unit.
        expect(typeof v === "string" && v.endsWith("%")).toBe(true);
      }
    }
  });

  it("gives the left selector panel a usable default width (>= 18%)", () => {
    render(<Playground />);
    const selector = capturedPanelProps[0];
    expect(selector).toBeDefined();
    const def = selector?.defaultSize;
    // Parse "22%" → 22
    const pct =
      typeof def === "string" && def.endsWith("%") ? parseFloat(def) : NaN;
    // 18% of a 1440px viewport ≈ 260px — enough for the example cards.
    expect(pct).toBeGreaterThanOrEqual(18);
  });
});
