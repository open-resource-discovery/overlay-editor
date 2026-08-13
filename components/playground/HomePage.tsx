"use client";

import Link from "next/link";
import { Badge, Button, Card } from "@open-resource-discovery/ui-components";
import { Layers, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import {
  loadPredefinedOverlays,
  type PredefinedOverlay,
} from "@/lib/playground/predefined-overlays";

export function HomePage() {
  const [overlays, setOverlays] = useState<PredefinedOverlay[]>([]);

  useEffect(() => {
    loadPredefinedOverlays()
      .then(setOverlays)
      .catch(() => setOverlays([]));
  }, []);

  return (
    <main className="flex-1 overflow-y-auto">
      {/* Hero */}
      <section className="flex flex-col items-center gap-6 px-6 py-16 text-center sm:py-24">
        <span className="grid h-16 w-16 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
          <Layers className="h-8 w-8" />
        </span>
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          ORD Overlay Editor
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          Visualize and edit{" "}
          <a
            href="https://open-resource-discovery.org"
            className="underline-offset-4 hover:underline"
            target="_blank"
            rel="noreferrer noopener"
          >
            ORD Overlay
          </a>{" "}
          documents. Open the playground to browse predefined examples, paste
          your own JSON or YAML, and see the rendered view live.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link href="/playground">
            <Button size="lg">
              Open Playground
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Examples */}
      <section className="mx-auto w-full max-w-6xl px-6 pb-24">
        <h2 className="mb-4 text-xl font-semibold tracking-tight">
          Example overlays
        </h2>
        <p className="mb-6 text-sm text-muted-foreground">
          Pick any example to open it in the playground.
        </p>
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {overlays.map((o) => (
            <li key={o.id}>
              <Link
                href={`/playground?example=${o.id}`}
                className="block focus:outline-none"
              >
                <Card className="h-full transition-colors hover:border-primary/40 hover:bg-accent/30">
                  <Card.Header>
                    <div className="flex items-start justify-between gap-2">
                      <Card.Title className="text-base leading-tight">
                        {o.title}
                      </Card.Title>
                      <Badge
                        variant="secondary"
                        className="shrink-0 text-[10px] uppercase"
                      >
                        {targetLabel(o.targetType)}
                      </Badge>
                    </div>
                  </Card.Header>
                  <Card.Content>
                    <p className="text-sm text-muted-foreground">
                      {o.description}
                    </p>
                  </Card.Content>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

function targetLabel(t: string): string {
  if (t.startsWith("openapi")) return "OpenAPI";
  if (t.startsWith("csn")) return "CSN";
  if (t.startsWith("edmx")) return "EDMX";
  if (t.startsWith("mcp")) return "MCP";
  if (t.startsWith("a2a")) return "A2A";
  return t;
}
