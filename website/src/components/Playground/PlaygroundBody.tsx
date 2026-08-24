import { useCallback, useEffect, useMemo, useState } from 'react';
import { useHistory, useLocation } from '@docusaurus/router';
import { useBaseUrlUtils } from '@docusaurus/useBaseUrl';
import { useColorMode } from '@docusaurus/theme-common';
import { Button, SplitPane, cn } from '@open-resource-discovery/ui-components';
import { Loader2 } from 'lucide-react';
import { JsonEditor } from './JsonEditor';
import { OverlaySelector } from './OverlaySelector';
import Renderer from './renderer';
import {
  loadOverlayBody,
  loadPredefinedOverlays,
  type PredefinedOverlay,
} from '@site/src/lib/predefined-overlays';

const QUERY_PARAM = 'example';

// ui-components' `SplitPane.Panel` types `defaultSize`/`minSize`/`maxSize` as
// bare `number`, but the underlying `react-resizable-panels@4` accepts
// `number | string` and treats bare numbers as **pixels** — so the only way to
// express percentages is a string like "22%". We pass strings at runtime (the
// right thing) and erase the type narrowing here.
const pct = (s: string): number => s as unknown as number;

export default function PlaygroundBody() {
  const history = useHistory();
  const location = useLocation();
  const { withBaseUrl } = useBaseUrlUtils();
  const { colorMode } = useColorMode();

  const requestedId = useMemo(
    () => new URLSearchParams(location.search).get(QUERY_PARAM),
    [location.search],
  );

  const [overlays, setOverlays] = useState<PredefinedOverlay[]>([]);
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load manifest once.
  useEffect(() => {
    let alive = true;
    loadPredefinedOverlays(withBaseUrl)
      .then((list) => {
        if (alive) setOverlays(list);
      })
      .catch((e) => {
        if (alive) {
          setError(String(e));
          setLoading(false);
        }
      });
    return () => {
      alive = false;
    };
  }, [withBaseUrl]);

  // Resolve which overlay to show. Query param wins; otherwise first in list.
  const selected = useMemo(() => {
    if (overlays.length === 0) return null;
    return (
      (requestedId && overlays.find((o) => o.id === requestedId)) || overlays[0]
    );
  }, [overlays, requestedId]);

  // Fetch the resolved overlay's body whenever the selection changes.
  const url = selected?.url ?? null;
  useEffect(() => {
    if (!url) return;
    let alive = true;
    queueMicrotask(() => {
      if (!alive) return;
      setLoading(true);
      setError(null);
    });

    loadOverlayBody(url, withBaseUrl)
      .then((body) => {
        if (!alive) return;
        setContent(body);
        setLoading(false);
      })
      .catch((e) => {
        if (!alive) return;
        setError(String(e));
        setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [url, withBaseUrl]);

  const onSelect = useCallback(
    (o: PredefinedOverlay) => {
      const params = new URLSearchParams(location.search);
      params.set(QUERY_PARAM, o.id);
      history.replace({ search: `?${params.toString()}` });
    },
    [history, location.search],
  );

  return (
    <div
      className={cn(
        'ord-ui flex h-full min-h-0 flex-1 flex-col bg-background text-foreground',
        colorMode === 'dark' && 'dark',
      )}
    >
      <SplitPane.Root
        orientation="horizontal"
        autoSaveId="overlay-view-playground"
        className="flex h-full min-h-0 flex-1"
      >
        <SplitPane.Panel
          defaultSize={pct('22%')}
          minSize={pct('16%')}
          maxSize={pct('40%')}
        >
          <OverlaySelector
            overlays={overlays}
            selectedId={selected?.id ?? null}
            onSelect={onSelect}
          />
        </SplitPane.Panel>

        <SplitPane.Handle />

        <SplitPane.Panel defaultSize={pct('38%')} minSize={pct('20%')}>
          <JsonEditor
            value={content}
            onChange={(v) => setContent(v ?? '')}
            language="json"
            height="100%"
          />
        </SplitPane.Panel>

        <SplitPane.Handle />

        <SplitPane.Panel defaultSize={pct('40%')} minSize={pct('20%')}>
          <div className="relative h-full min-h-0 overflow-auto">
            {loading ? (
              <div className="grid h-full place-items-center text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading overlay…
                </span>
              </div>
            ) : error ? (
              <div className="grid h-full place-items-center p-6 text-center">
                <div>
                  <p className="text-sm font-medium text-destructive">
                    Failed to load overlay.
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">{error}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => window.location.reload()}
                  >
                    Retry
                  </Button>
                </div>
              </div>
            ) : (
              <Renderer content={content} colorMode={colorMode} />
            )}
          </div>
        </SplitPane.Panel>
      </SplitPane.Root>
    </div>
  );
}
