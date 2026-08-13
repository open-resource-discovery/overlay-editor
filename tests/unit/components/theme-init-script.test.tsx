import { renderToStaticMarkup } from "react-dom/server";
import { describe, it, expect } from "vitest";
import { ThemeInitScript } from "@/components/ThemeInitScript";

describe("ThemeInitScript", () => {
  it("renders a native <script> element (not next/script)", () => {
    const html = renderToStaticMarkup(<ThemeInitScript />);
    expect(html).toMatch(/^<script\b/);
    // next/script adds data-nscript or strategy attrs in its serialized output;
    // a native <script> with dangerouslySetInnerHTML does not.
    expect(html).not.toContain("data-nscript");
    expect(html).not.toMatch(/\bstrategy\s*=/);
  });

  it("inlines the dark-mode init JS so it runs before paint", () => {
    const html = renderToStaticMarkup(<ThemeInitScript />);
    expect(html).toContain("matchMedia");
    expect(html).toContain("localStorage.getItem");
    expect(html).toContain('classList.add("dark")');
  });
});
