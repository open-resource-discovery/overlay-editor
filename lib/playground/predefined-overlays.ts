export type PredefinedOverlay = {
  id: string;
  title: string;
  description: string;
  /** Used as a coarse-grained badge on selector cards. */
  targetType: string;
  /**
   * Public URL the overlay JSON is fetched from.
   *
   * Must start with `/` and is interpreted as **relative to the site's
   * basePath** — the helpers below prepend `NEXT_PUBLIC_BASE_PATH` at
   * fetch time so the manifest stays portable across `npm run dev`,
   * `next build --export`, and Pages deploys under `/ORD/overlay-editor`.
   */
  url: string;
};

// Inlined at build time so client bundles get the basePath without a runtime
// env lookup (which wouldn't work after static export anyway).
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

function withBasePath(absolute: string): string {
  if (!absolute.startsWith("/")) return absolute;
  return `${BASE_PATH}${absolute}`;
}

const MANIFEST_URL = withBasePath("/predefined-overlays.json");

let cached: Promise<PredefinedOverlay[]> | null = null;

export function loadPredefinedOverlays(): Promise<PredefinedOverlay[]> {
  if (!cached) {
    cached = fetch(MANIFEST_URL)
      .then((r) => {
        if (!r.ok)
          throw new Error(`failed to fetch ${MANIFEST_URL}: ${r.status}`);
        return r.json();
      })
      .catch((e) => {
        cached = null;
        throw e;
      });
  }
  return cached;
}

export async function loadOverlayBody(url: string): Promise<string> {
  const fullUrl = withBasePath(url);
  const r = await fetch(fullUrl);
  if (!r.ok) throw new Error(`failed to fetch ${fullUrl}: ${r.status}`);
  return r.text();
}
