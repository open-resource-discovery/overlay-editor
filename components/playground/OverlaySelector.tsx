"use client";

import { useMemo, useState } from "react";
import { Badge, Card, Input, cn } from "@open-resource-discovery/ui-components";
import { Search } from "lucide-react";
import type { PredefinedOverlay } from "@/lib/playground/predefined-overlays";

type Props = {
  overlays: PredefinedOverlay[];
  selectedId: string | null;
  onSelect: (overlay: PredefinedOverlay) => void;
};

export function OverlaySelector({ overlays, selectedId, onSelect }: Props) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return overlays;
    return overlays.filter(
      (o) =>
        o.title.toLowerCase().includes(q) ||
        o.description.toLowerCase().includes(q) ||
        o.targetType.toLowerCase().includes(q),
    );
  }, [overlays, query]);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="shrink-0 border-b border-border p-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search examples…"
            className="pl-8"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {filtered.length === 0 ? (
          <p className="px-2 py-4 text-center text-xs text-muted-foreground">
            No examples match &ldquo;{query}&rdquo;.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {filtered.map((o) => (
              <li key={o.id}>
                <Card
                  role="button"
                  tabIndex={0}
                  onClick={() => onSelect(o)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onSelect(o);
                    }
                  }}
                  className={cn(
                    "cursor-pointer transition-colors hover:border-primary/40 hover:bg-accent/30",
                    selectedId === o.id && "border-primary/60 bg-accent/40",
                  )}
                >
                  <Card.Header className="p-3">
                    <div className="flex items-start justify-between gap-2">
                      <Card.Title className="text-sm leading-tight">
                        {o.title}
                      </Card.Title>
                      <Badge
                        variant="secondary"
                        className="shrink-0 text-[10px] uppercase"
                      >
                        {targetTypeLabel(o.targetType)}
                      </Badge>
                    </div>
                  </Card.Header>
                  <Card.Content className="px-3 pb-3 pt-0">
                    <p className="line-clamp-2 text-xs text-muted-foreground">
                      {o.description}
                    </p>
                  </Card.Content>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function targetTypeLabel(t: string): string {
  if (t.startsWith("openapi")) return "OpenAPI";
  if (t.startsWith("csn")) return "CSN";
  if (t.startsWith("edmx")) return "EDMX";
  if (t.startsWith("mcp")) return "MCP";
  if (t.startsWith("a2a")) return "A2A";
  return t;
}
