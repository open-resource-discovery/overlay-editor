import React, { useEffect, useRef, useState } from "react";
import BrowserOnly from "@docusaurus/BrowserOnly";
import useBaseUrl from "@docusaurus/useBaseUrl";

type Props = {
  /** Raw overlay document (JSON or YAML text). */
  content: string;
  /** Current Docusaurus color mode, synced into the library's theme store. */
  colorMode: "light" | "dark";
};

// Minimal shape of the global exposed by the standalone bundle
// (src/lib/standalone.ts → window.OverlayPlayground).
type OverlayInstance = {
  setTheme?: (theme: "light" | "dark") => void;
  update?: (content: string) => void;
  destroy?: () => void;
};
type OverlayPlaygroundGlobal = {
  init: (opts: {
    el: HTMLElement;
    content?: string;
    theme?: "light" | "dark";
  }) => OverlayInstance;
};

function getOverlayGlobal(): OverlayPlaygroundGlobal | undefined {
  return (window as unknown as { OverlayPlayground?: OverlayPlaygroundGlobal })
    .OverlayPlayground;
}

// Load the standalone bundle exactly once, shared across every StandaloneCard
// instance. Resolves when `window.OverlayPlayground` is available. This replaces
// per-instance polling + arbitrary timeouts: multiple cards mounting await the
// same promise instead of each racing to load/observe the script.
let playgroundPromise: Promise<OverlayPlaygroundGlobal> | null = null;

function loadPlayground(
  cssUrl: string,
  jsUrl: string,
): Promise<OverlayPlaygroundGlobal> {
  if (playgroundPromise) return playgroundPromise;

  playgroundPromise = new Promise<OverlayPlaygroundGlobal>(
    (resolve, reject) => {
      if (!document.querySelector(`link[href="${cssUrl}"]`)) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = cssUrl;
        document.head.appendChild(link);
      }

      const existing = getOverlayGlobal();
      if (existing) {
        resolve(existing);
        return;
      }

      const script = document.createElement("script");
      script.src = jsUrl;
      // The IIFE assigns `window.OverlayPlayground` synchronously as it executes,
      // so it is present by the time `onload` fires — no polling/timeout needed.
      script.onload = () => {
        const overlay = getOverlayGlobal();
        if (overlay) resolve(overlay);
        else reject(new Error("OverlayPlayground missing after script load"));
      };
      script.onerror = () =>
        reject(new Error("Failed to load OverlayPlayground script"));
      document.body.appendChild(script);
    },
  );

  // Don't cache a rejection forever — let the next mount retry a failed load.
  playgroundPromise.catch(() => {
    playgroundPromise = null;
  });

  return playgroundPromise;
}

// Why injection instead of `import()`:
//
// `@open-resource-discovery/overlay-editor` and its `ui-components` dependency
// ship Tailwind v4 CSS whose resets/utilities live in `@layer`. Docusaurus/
// Infima's global styles are UN-layered, so they beat every layered rule
// regardless of specificity — paragraph/heading margins and sizes bleed into
// the cards. The standalone bundle is post-processed (see
// vite.standalone.config.ts) to strip `@layer` wrappers and scope a preflight
// to `.overlay-root`, so it wins over Infima. Loading it as a static
// `<link>`/`<script>` (served from website/static/standalone) keeps that
// stripped CSS out of webpack's layering, which is what makes the fix hold.
function StandaloneCard({
  content,
  colorMode,
  cssUrl,
  jsUrl,
}: Props & { cssUrl: string; jsUrl: string }): React.JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<OverlayInstance | null>(null);
  const contentRef = useRef(content);
  const themeRef = useRef(colorMode);
  contentRef.current = content;
  themeRef.current = colorMode;

  const [error, setError] = useState<string | null>(null);

  // Load the shared standalone bundle, then initialise this card once.
  useEffect(() => {
    let mounted = true;

    loadPlayground(cssUrl, jsUrl)
      .then((overlay) => {
        if (!mounted || !containerRef.current) return;
        instanceRef.current = overlay.init({
          el: containerRef.current,
          content: contentRef.current,
          theme: themeRef.current,
        });
      })
      .catch((err: unknown) => {
        if (mounted)
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load overlay renderer",
          );
      });

    return () => {
      mounted = false;
      try {
        instanceRef.current?.destroy?.();
      } catch {
        // ignore teardown errors
      }
      instanceRef.current = null;
    };
  }, [cssUrl, jsUrl]);

  // Push new document content into the mounted instance.
  useEffect(() => {
    instanceRef.current?.update?.(content);
  }, [content]);

  // Sync Docusaurus color mode into the card's theme.
  useEffect(() => {
    instanceRef.current?.setTheme?.(colorMode);
  }, [colorMode]);

  if (error) {
    return (
      <div className="grid h-full place-items-center p-6 text-center text-sm text-red-500">
        Could not render this overlay.
      </div>
    );
  }

  return <div ref={containerRef} style={{ height: "100%" }} />;
}

export default function Renderer({
  content,
  colorMode,
}: Props): React.JSX.Element | null {
  const cssUrl = useBaseUrl("/standalone/overlay-cardview.css");
  const jsUrl = useBaseUrl("/standalone/overlay-cardview.js");

  if (!content) return null;

  return (
    <BrowserOnly>
      {() => (
        <StandaloneCard
          content={content}
          colorMode={colorMode}
          cssUrl={cssUrl}
          jsUrl={jsUrl}
        />
      )}
    </BrowserOnly>
  );
}
