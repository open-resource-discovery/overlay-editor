import { useState } from "react";
import { Badge, Button } from "@open-resource-discovery/ui-components";
import { ChevronsDownUp, ChevronsUpDown } from "lucide-react";
import type { OverlayPatch } from "../types";
import { PatchCard } from "./PatchCard";
import { PatchBoundary } from "./PatchBoundary";

type Props = { patches: OverlayPatch[] };

export function PatchList({ patches }: Props) {
  const [allExpanded, setAllExpanded] = useState(true);
  const toggleAll = () => setAllExpanded((expanded) => !expanded);

  return (
    <section id="patches" className="overlay-section">
      <PatchListHeader
        patches={patches}
        allExpanded={allExpanded}
        onToggleAll={toggleAll}
      />
      {patches.length === 0 ? (
        <div className="overlay-callout">This overlay defines no patches.</div>
      ) : (
        <div className="overlay-patch-list" key={String(allExpanded)}>
          {patches.map((patch, index) => (
            <PatchBoundary key={index} index={index} resetKey={patch}>
              <PatchCard
                patch={patch}
                index={index}
                defaultOpen={allExpanded}
              />
            </PatchBoundary>
          ))}
        </div>
      )}
    </section>
  );
}

type HeaderProps = {
  patches: OverlayPatch[];
  allExpanded: boolean;
  onToggleAll: () => void;
};

function PatchListHeader({ patches, allExpanded, onToggleAll }: HeaderProps) {
  const showToggle = patches.length > 1;
  return (
    <header className="overlay-section-header">
      <div className="overlay-section-header-left">
        <h2 className="overlay-section-title">Patches</h2>
        <Badge variant="secondary" size="sm">
          {patches.length}
        </Badge>
      </div>
      {showToggle ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleAll}
          aria-label={
            allExpanded ? "Collapse all patches" : "Expand all patches"
          }
        >
          {allExpanded ? (
            <ChevronsDownUp size={14} aria-hidden />
          ) : (
            <ChevronsUpDown size={14} aria-hidden />
          )}
          <span>{allExpanded ? "Collapse all" : "Expand all"}</span>
        </Button>
      ) : null}
    </header>
  );
}
