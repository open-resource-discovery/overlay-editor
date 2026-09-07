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

  // Load the standalone assets and initialise once.
  useEffect(() => {
    let mounted = true;

    const loadAndInit = async (): Promise<void> => {
      try {
        if (!document.querySelector(`link[href="${cssUrl}"]`)) {
          const link = document.createElement("link");
          link.rel = "stylesheet";
          link.href = cssUrl;
          document.head.appendChild(link);
        }

        if (!getOverlayGlobal()) {
          await new Promise<void>((resolve, reject) => {
            const existing = document.querySelector(`script[src="${jsUrl}"]`);
            if (existing) {
              const timer = setInterval(() => {
                if (getOverlayGlobal()) {
                  clearInterval(timer);
                  resolve();
                }
              }, 50);
              setTimeout(() => {
                clearInterval(timer);
                reject(new Error("Timeout waiting for OverlayPlayground"));
              }, 10000);
              return;
            }
            const script = document.createElement("script");
            script.src = jsUrl;
            script.onload = () => setTimeout(resolve, 50);
            script.onerror = () =>
              reject(new Error("Failed to load OverlayPlayground script"));
            document.body.appendChild(script);
          });
        }

        if (!mounted || !containerRef.current) return;

        const overlay = getOverlayGlobal();
        if (!overlay) throw new Error("OverlayPlayground global not available");

        instanceRef.current = overlay.init({
          el: containerRef.current,
          content: contentRef.current,
          theme: themeRef.current,
        });
      } catch (err) {
        if (mounted)
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load overlay renderer",
          );
      }
    };

    void loadAndInit();

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
