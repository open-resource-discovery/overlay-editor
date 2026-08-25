import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import overlayLayoutStyles from "./styles";

const packagedStyles = readFileSync(
  join(process.cwd(), "src", "lib", "styles.css"),
  "utf8",
);

const styleVariants = [
  ["runtime styles", overlayLayoutStyles],
  ["packaged styles", packagedStyles],
] as const;

function blockBody(source: string, prelude: string): string {
  const preludeIndex = source.indexOf(prelude);
  expect(preludeIndex, `Missing CSS block: ${prelude}`).toBeGreaterThanOrEqual(
    0,
  );

  const openIndex = source.indexOf("{", preludeIndex + prelude.length);
  expect(openIndex, `Missing opening brace: ${prelude}`).toBeGreaterThanOrEqual(
    0,
  );

  let depth = 0;
  for (let index = openIndex; index < source.length; index += 1) {
    if (source[index] === "{") depth += 1;
    if (source[index] === "}") depth -= 1;
    if (depth === 0) return source.slice(openIndex + 1, index);
  }

  throw new Error(`Missing closing brace: ${prelude}`);
}

describe.each(styleVariants)("%s", (_name, styles) => {
  it("aligns the sidebar search row with the 48 px toolbar", () => {
    expect(blockBody(styles, ".overlay-sidebar-search-input")).toMatch(
      /height:\s*31px/,
    );
  });

  it("uses the host height for the wide sidebar", () => {
    expect(styles).not.toContain("100dvh");
    const baseLayer = blockBody(styles, "@layer base");
    expect(blockBody(baseLayer, ":where(.overlay-card-view)")).toMatch(
      /height:\s*100%/,
    );

    const wideLayout = blockBody(
      styles,
      "@container overlay-root (min-width: 720px)",
    );
    expect(blockBody(wideLayout, ".overlay-shell")).toMatch(
      /grid-template-areas:\s*"sidebar toolbar"\s*"sidebar content"/,
    );
    expect(blockBody(wideLayout, ".overlay-sidebar-inner")).toMatch(
      /height:\s*100%/,
    );
  });

  it("keeps narrow navigation intrinsic and the footer viewport-fixed", () => {
    expect(blockBody(styles, ".overlay-shell")).toMatch(
      /grid-template-areas:\s*"toolbar"\s*"sidebar"\s*"content"/,
    );
    expect(blockBody(styles, ".overlay-shell")).toMatch(
      /align-content:\s*start/,
    );
    expect(blockBody(styles, ".overlay-sidebar-inner")).toMatch(
      /height:\s*auto/,
    );
    expect(blockBody(styles, ".overlay-sidebar-nav")).toMatch(
      /overflow-y:\s*visible/,
    );
    const narrowContainer = blockBody(
      styles,
      "@container overlay-root (width < 720px)",
    );
    expect(
      blockBody(narrowContainer, ".overlay-sidebar-footer-desktop"),
    ).toMatch(/display:\s*none/);
    expect(blockBody(narrowContainer, ".overlay-main-content")).toMatch(
      /padding-bottom:\s*var\(--overlay-sidebar-footer-height\)/,
    );
    expect(blockBody(styles, ".overlay-sidebar-footer-mobile")).toMatch(
      /position:\s*fixed/,
    );
    expect(blockBody(styles, ".overlay-sidebar-footer-mobile")).toMatch(
      /bottom:\s*0/,
    );
  });
});
