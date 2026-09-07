import { Badge, CodeBlock } from "@open-resource-discovery/ui-components";
import { toYaml } from "../util/serialize";
import { formatAction } from "../util/formatAction";
import type { OverlayAction, OverlayPatch } from "../types";

type PatchPresentation = { label: string; filename: string };

const PATCH_DATA_PRESENTATION: Record<OverlayAction, PatchPresentation> = {
  update: { label: "Replacement value", filename: "replacement.yaml" },
  merge: { label: "Merge payload", filename: "merge-payload.yaml" },
  remove: { label: "Removal mask", filename: "removal-mask.yaml" },
};

const FALLBACK_PRESENTATION: PatchPresentation = {
  label: "Patch data",
  filename: "patch-data.yaml",
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

  // `action` is typed as `OverlayAction`, but the overlay document is parsed
  // from untrusted JSON/YAML, so at runtime it can hold any value. Only treat
  // it as recognized when it is a string that is an *own* key of the map. This
  // rejects non-strings (e.g. `["update"]`, which would otherwise coerce to
  // "update") and inherited properties (e.g. `"toString"`, `"__proto__"`),
  // then falls back instead of crashing.
  const rawAction: unknown = action;
  const isKnownAction =
    typeof rawAction === "string" &&
    Object.prototype.hasOwnProperty.call(PATCH_DATA_PRESENTATION, rawAction);
  const { label, filename } = isKnownAction
    ? (PATCH_DATA_PRESENTATION as Record<string, PatchPresentation>)[
        rawAction as string
      ]
    : FALLBACK_PRESENTATION;

  return (
    <section className="overlay-field">
      {!isKnownAction ? (
        <div className="overlay-callout overlay-callout-destructive">
          Unrecognized patch action <code>{formatAction(action)}</code>. Showing
          the raw payload below.
        </div>
      ) : null}
      <header className="overlay-field-header">
        <h4 className="overlay-field-label">{label}</h4>
        <Badge
          variant={action === "remove" ? "destructive" : "outline"}
          size="sm"
          className="uppercase"
        >
          {formatAction(action)}
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
