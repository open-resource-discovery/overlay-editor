import { Badge } from "@open-resource-discovery/ui-components";
import type { DescribedSelector } from "../util/describeSelector";

export function SelectorChip({ selector }: { selector: DescribedSelector }) {
  return (
    <span className="overlay-selector inline-flex items-center gap-2 min-w-0">
      <Badge
        variant="outline"
        size="sm"
        className="overlay-selector-kind uppercase tracking-wide"
      >
        {selector.kind}
      </Badge>
      <code className="overlay-selector-value font-mono text-sm text-foreground truncate">
        {selector.value}
      </code>
      {selector.context ? (
        <span className="overlay-selector-context text-xs text-muted-foreground truncate">
          {selector.context}
        </span>
      ) : null}
    </span>
  );
}
