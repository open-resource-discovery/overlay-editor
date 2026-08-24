import React, { useEffect, useState } from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import { useBaseUrlUtils } from '@docusaurus/useBaseUrl';
import { Layers, ArrowRight } from 'lucide-react';
import {
  loadPredefinedOverlays,
  type PredefinedOverlay,
} from '@site/src/lib/predefined-overlays';

function targetLabel(t: string): string {
  if (t.startsWith('openapi')) return 'OpenAPI';
  if (t.startsWith('csn')) return 'CSN';
  if (t.startsWith('edmx')) return 'EDMX';
  if (t.startsWith('mcp')) return 'MCP';
  if (t.startsWith('a2a')) return 'A2A';
  return t;
}

// The home page deliberately avoids `@open-resource-discovery/ui-components`:
// that package's server build touches `document` at module evaluation, which
// breaks Docusaurus static generation. All ui-components usage lives in the
// client-only (lazily loaded) playground instead. Here we use plain markup
// styled with the app's Tailwind tokens, which are safe to render on the server
// and track color mode via Docusaurus' `[data-theme]` attribute.
function HomeContent(): React.JSX.Element {
  const { withBaseUrl } = useBaseUrlUtils();
  const [overlays, setOverlays] = useState<PredefinedOverlay[]>([]);

  useEffect(() => {
    loadPredefinedOverlays(withBaseUrl)
      .then(setOverlays)
      .catch(() => setOverlays([]));
  }, [withBaseUrl]);

  return (
    <div>
      {/* Hero */}
      <section className="flex flex-col items-center gap-6 px-6 py-16 text-center sm:py-24">
        <span className="grid h-16 w-16 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
          <Layers className="h-8 w-8" />
        </span>
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          ORD Overlay Editor
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          Visualize and edit{' '}
          <a
            href="https://open-resource-discovery.org"
            className="underline-offset-4 hover:underline"
            target="_blank"
            rel="noreferrer noopener"
          >
            ORD Overlay
          </a>{' '}
          documents. Open the playground to browse predefined examples, paste
          your own JSON or YAML, and see the rendered view live.
        </p>
        <Link
          to="/playground"
          className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-base font-medium text-primary-foreground transition-opacity hover:opacity-90 hover:text-primary-foreground"
        >
          Open Playground
          <ArrowRight className="h-4 w-4" />
        </Link>
      </section>

      {/* Examples */}
      <section className="mx-auto w-full max-w-6xl px-6 pb-24">
        <h2 className="mb-4 text-xl font-semibold tracking-tight">
          Example overlays
        </h2>
        <p className="mb-6 text-sm text-muted-foreground">
          Pick any example to open it in the playground.
        </p>
        <ul className="grid list-none grid-cols-1 gap-3 p-0 sm:grid-cols-2 lg:grid-cols-3">
          {overlays.map((o) => (
            <li key={o.id}>
              <Link
                to={`/playground?example=${o.id}`}
                className="block h-full rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/40 hover:bg-accent/30"
              >
                <div className="mb-2 flex items-start justify-between gap-2">
                  <span className="text-base font-semibold leading-tight text-card-foreground">
                    {o.title}
                  </span>
                  <span className="shrink-0 rounded bg-secondary px-1.5 py-0.5 text-[10px] uppercase text-secondary-foreground">
                    {targetLabel(o.targetType)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{o.description}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export default function Home(): React.JSX.Element {
  return (
    <Layout
      title="ORD Overlay Editor"
      description="Visualize and edit ORD Overlay documents in the browser."
    >
      <HomeContent />
    </Layout>
  );
}
