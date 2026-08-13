import { useEffect, useState } from "react";
import { Badge, CodeBlock } from "@open-resource-discovery/ui-components";
import type { Highlighter } from "shiki";
import { getHighlighter } from "../util/highlighter";
import { toYaml } from "../util/serialize";
import type { OverlayAction, OverlayPatch } from "../types";

// ord-ui's HighlighterLike widens shiki's codeToHtml options to Record<string, unknown>;
// shiki's signature requires `lang`. Runtime contract holds — pass through.
type OrdUiHighlighter = {
  codeToHtml: (code: string, options: Record<string, unknown>) => string;
};

const PATCH_DATA_PRESENTATION: Record<
  OverlayAction,
  { label: string; filename: string }
> = {
  update: { label: "Replacement value", filename: "replacement.yaml" },
  merge: { label: "Merge payload", filename: "merge-payload.yaml" },
  remove: { label: "Removal mask", filename: "removal-mask.yaml" },
};

type Props = { patch: OverlayPatch };

function useHighlighter(): Highlighter | undefined {
  const [highlighter, setHighlighter] = useState<Highlighter | undefined>();
  useEffect(() => {
    let cancelled = false;
    getHighlighter().then((loaded) => {
      if (!cancelled) setHighlighter(loaded);
    });
    return () => {
      cancelled = true;
    };
  }, []);
  return highlighter;
}

export function PatchData({ patch }: Props) {
  const highlighter = useHighlighter();
  const { action, data } = patch;

  if (action === "remove" && data === undefined) {
    return (
      <div className="overlay-callout overlay-callout-destructive">
        This patch <strong>removes</strong> the entire selected element.
      </div>
    );
  }

  if (data === undefined) return null;

  const { label, filename } = PATCH_DATA_PRESENTATION[action];

  return (
    <section className="overlay-field">
      <header className="overlay-field-header">
        <h4 className="overlay-field-label">{label}</h4>
        <Badge
          variant={action === "remove" ? "destructive" : "outline"}
          size="sm"
          className="uppercase"
        >
          {action}
        </Badge>
      </header>
      <CodeBlock
        code={toYaml(data)}
        language="yaml"
        filename={filename}
        highlighter={highlighter as unknown as OrdUiHighlighter | undefined}
        lightTheme="github-light"
        darkTheme="github-dark"
        maxHeight="320px"
      />
    </section>
  );
}
