import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import {
  JsonEditor,
  getJsonDiagnosticsOptions,
} from "@/components/playground/JsonEditor";

vi.mock("@monaco-editor/react", () => ({
  default: ({
    value,
    onChange,
    options,
  }: {
    value: string;
    onChange?: (value: string | undefined) => void;
    options?: { readOnly?: boolean };
  }) => (
    <textarea
      data-testid="monaco-editor"
      value={value}
      readOnly={options?.readOnly}
      onChange={(e) => onChange?.(e.target.value)}
    />
  ),
}));

afterEach(cleanup);

describe("JsonEditor", () => {
  it("should render with the provided value", () => {
    render(<JsonEditor value='{"test": true}' />);
    const editor = screen.getByTestId("monaco-editor");
    expect(editor).toBeInTheDocument();
    expect(editor).toHaveValue('{"test": true}');
  });

  it("should be read-only when readOnly prop is true", () => {
    render(<JsonEditor value="{}" readOnly />);
    const editor = screen.getByTestId("monaco-editor");
    expect(editor).toHaveAttribute("readOnly");
  });

  it("should call onChange when value changes", () => {
    const handleChange = vi.fn();
    render(<JsonEditor value="{}" onChange={handleChange} />);
    const editor = screen.getByTestId("monaco-editor");

    fireEvent.change(editor, { target: { value: '{"new": true}' } });

    expect(handleChange).toHaveBeenCalledWith('{"new": true}');
  });
});

describe("getJsonDiagnosticsOptions", () => {
  it("registers the OrdOverlay schema by its canonical URI", () => {
    const options = getJsonDiagnosticsOptions();
    const overlaySchema = options.schemas?.find(
      (s) =>
        s.uri ===
        "https://open-resource-discovery.org/spec-v1/interfaces/OrdOverlay.schema.json",
    );
    expect(overlaySchema).toBeDefined();
    expect(overlaySchema?.schema).toMatchObject({
      $schema: expect.any(String),
    });
  });

  it("silences fetch errors for unregistered $schema URLs", () => {
    const options = getJsonDiagnosticsOptions();
    expect(options.schemaRequest).toBe("ignore");
    expect(options.enableSchemaRequest).toBe(false);
  });
});
