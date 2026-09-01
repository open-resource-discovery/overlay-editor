import { useEffect, useRef } from "react";
import { useColorMode } from "@docusaurus/theme-common";
import Editor, { type BeforeMount, type OnMount } from "@monaco-editor/react";
import type { editor } from "monaco-editor";
import ordOverlaySchema from "./schemas/OrdOverlay.schema.json";

interface JsonEditorProps {
  value: string;
  onChange?: (value: string | undefined) => void;
  readOnly?: boolean;
  language?: string;
  height?: string;
  highlightLines?: number[];
}

const ORD_OVERLAY_SCHEMA_URI =
  "https://open-resource-discovery.org/spec-v1/interfaces/OrdOverlay.schema.json";

export function getJsonDiagnosticsOptions() {
  return {
    validate: true,
    allowComments: false,
    enableSchemaRequest: false,
    schemaRequest: "ignore" as const,
    schemas: [
      {
        uri: ORD_OVERLAY_SCHEMA_URI,
        schema: ordOverlaySchema,
      },
    ],
  };
}

const handleBeforeMount: BeforeMount = (monaco) => {
  monaco.languages.json.jsonDefaults.setDiagnosticsOptions(
    getJsonDiagnosticsOptions(),
  );
};

export function JsonEditor({
  value,
  onChange,
  readOnly = false,
  language = "json",
  height = "100%",
  highlightLines,
}: JsonEditorProps) {
  const { colorMode } = useColorMode();
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const decorationsRef = useRef<editor.IEditorDecorationsCollection | null>(
    null,
  );

  const handleMount: OnMount = (editor) => {
    editorRef.current = editor;
  };

  useEffect(() => {
    const editorInstance = editorRef.current;
    if (!editorInstance) return;
    const lineCount = editorInstance.getModel()?.getLineCount() ?? 0;
    const decorations: editor.IModelDeltaDecoration[] = (highlightLines ?? [])
      .filter((line) => line >= 1 && line <= lineCount)
      .map((line) => ({
        range: {
          startLineNumber: line,
          startColumn: 1,
          endLineNumber: line,
          endColumn: 1,
        },
        options: {
          isWholeLine: true,
          className: "target-highlight-line",
          marginClassName: "target-highlight-margin",
        },
      }));
    if (!decorationsRef.current) {
      decorationsRef.current =
        editorInstance.createDecorationsCollection(decorations);
    } else {
      decorationsRef.current.set(decorations);
    }
  }, [highlightLines, value]);

  return (
    <Editor
      height={height}
      language={language}
      value={value}
      onChange={onChange}
      beforeMount={handleBeforeMount}
      onMount={handleMount}
      options={{
        readOnly,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        fontSize: 13,
        tabSize: 2,
        wordWrap: "on",
        automaticLayout: true,
      }}
      theme={colorMode === "dark" ? "vs-dark" : "light"}
    />
  );
}
