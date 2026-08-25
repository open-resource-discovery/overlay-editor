import { Badge, CodeBlock } from "@open-resource-discovery/ui-components";
import { toYaml } from "../util/serialize";
import type { OverlayAction, OverlayPatch } from "../types";

const PATCH_DATA_PRESENTATION: Record<
  OverlayAction,
  { label: string; filename: string }
> = {
  update: { label: "Replacement value", filename: "replacement.yaml" },
  merge: { label: "Merge payload", filename: "merge-payload.yaml" },
  remove: { label: "Removal mask", filename: "removal-mask.yaml" },
};

type Props = { patch: OverlayPatch };

export function PatchData({ patch }: Props) {
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
        maxHeight="320px"
      />
    </section>
  );
}
