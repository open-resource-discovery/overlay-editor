// Loads the predefined overlay manifest and individual overlay bodies from the
// site's `static/` directory. Ported from the Next.js demo's
// `lib/playground/predefined-overlays.ts`; the `NEXT_PUBLIC_BASE_PATH` prefixing
// is replaced by a Docusaurus `withBaseUrl` joiner passed in by callers (obtained
// from `useBaseUrlUtils()`), so URLs resolve correctly under `/overlay-editor/`
// and PR-preview base URLs alike.

export type PredefinedOverlay = {
  id: string;
  title: string;
  description: string;
  /** Used as a coarse-grained badge on selector cards. */
  targetType: string;
  /**
   * Root-relative URL the overlay JSON is fetched from (e.g.
   * `/examples/overlays/foo.overlay.json`). Joined with the site base URL at
   * fetch time so the manifest stays portable across deploy targets.
   */
  url: string;
};

type WithBaseUrl = (path: string) => string;

export async function loadPredefinedOverlays(
  withBaseUrl: WithBaseUrl,
): Promise<PredefinedOverlay[]> {
  const url = withBaseUrl('/predefined-overlays.json');
  const r = await fetch(url);
  if (!r.ok) throw new Error(`failed to fetch ${url}: ${r.status}`);
  return r.json();
}

export async function loadOverlayBody(
  url: string,
  withBaseUrl: WithBaseUrl,
): Promise<string> {
  const fullUrl = withBaseUrl(url);
  const r = await fetch(fullUrl);
  if (!r.ok) throw new Error(`failed to fetch ${fullUrl}: ${r.status}`);
  return r.text();
}
