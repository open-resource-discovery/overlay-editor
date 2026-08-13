import {
  Badge,
  CollapsibleSection,
  MarkdownText,
} from "@open-resource-discovery/ui-components";
import type { OverlayPatch } from "../types";
import { describeSelector } from "../util/describeSelector";
import { actionVariant } from "../util/badgeVariants";
import { SelectorChip } from "./SelectorChip";
import { PatchData } from "./PatchData";

type Props = {
  patch: OverlayPatch;
  index: number;
  defaultOpen?: boolean;
};

export function PatchCard({ patch, index, defaultOpen }: Props) {
  const selector = describeSelector(patch.selector);
  const action = patch.action;

  return (
    <div id={`patch-${index}`} className="overlay-patch-anchor">
      <CollapsibleSection.Root
        bordered
        defaultOpen={defaultOpen}
        className="overlay-patch"
      >
        <CollapsibleSection.Trigger
          className="overlay-patch-trigger"
          badges={
            <Badge
              variant={actionVariant(action)}
              className="uppercase tracking-wide"
            >
              {action}
            </Badge>
          }
        >
          <span className="overlay-patch-label">
            <span className="text-xs uppercase tracking-wide text-muted-foreground">
              Patch #{index + 1}
            </span>
            <SelectorChip selector={selector} />
          </span>
        </CollapsibleSection.Trigger>

        <CollapsibleSection.Content className="overlay-patch-body">
          <div className="overlay-patch-col overlay-patch-col-details">
            {patch.description ? (
              <section className="overlay-field">
                <h4 className="overlay-field-label">Description</h4>
                <MarkdownText text={patch.description} />
              </section>
            ) : null}

            {patch.tags && patch.tags.length > 0 ? (
              <section className="overlay-field overlay-tags">
                <h4 className="overlay-field-label">Tags</h4>
                <div className="flex flex-wrap gap-1.5">
                  {patch.tags.map((t) => (
                    <Badge key={t} variant="secondary" size="sm">
                      {t}
                    </Badge>
                  ))}
                </div>
              </section>
            ) : null}
          </div>
          <div className="overlay-patch-col overlay-patch-col-payload">
            <PatchData patch={patch} />
          </div>
        </CollapsibleSection.Content>
      </CollapsibleSection.Root>
    </div>
  );
}
