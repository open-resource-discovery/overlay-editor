import { overlayFilenameFor, prettifyJson } from "./download.js";

describe("overlayFilenameFor", () => {
  it("uses a generic filename when no ordId is given", () => {
    expect(overlayFilenameFor(undefined)).toBe("overlay.overlay.json");
  });

  it("slugifies non-filename-safe characters", () => {
    expect(overlayFilenameFor("sap.foo:overlay:demo:v1")).toBe(
      "sap.foo-overlay-demo-v1.overlay.json",
    );
  });

  it("trims leading and trailing separators", () => {
    expect(overlayFilenameFor("::weird::")).toBe("weird.overlay.json");
  });
});

describe("prettifyJson", () => {
  it("formats valid JSON with two-space indent", () => {
    expect(prettifyJson('{"a":1}')).toBe('{\n  "a": 1\n}');
  });

  it("passes through content that is not valid JSON", () => {
    const yamlContent = 'ordOverlay: "0.1"';
    expect(prettifyJson(yamlContent)).toBe(yamlContent);
  });
});
