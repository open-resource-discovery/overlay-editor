import React, { lazy, Suspense } from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import ErrorBoundary from '@docusaurus/ErrorBoundary';

type Props = {
  /** Raw overlay document (JSON or YAML text). */
  content: string;
  /** Current Docusaurus color mode, synced into the library's theme store. */
  colorMode: 'light' | 'dark';
};

// `@open-resource-discovery/overlay-editor` is ESM-only, renders under
// `"use client"`, and injects its layout `<style>` into `document.head` at
// runtime (via `OverlayCardView`). A dynamic `import()` behind `React.lazy`
// keeps it out of the SSR/SSG graph and keeps the module ESM end-to-end, which
// also avoids the CJS-interop pitfalls webpack hits with `require()`.
const LazyCard = lazy(async () => {
  await import('@open-resource-discovery/overlay-editor/styles');
  const mod = await import('@open-resource-discovery/overlay-editor');
  const { OverlayCardView, useThemeStore } = mod;

  function ThemedCard({ content, colorMode }: Props) {
    // Push Docusaurus' color mode into the library's own theme store so the
    // card's internal `.ord-ui.dark` matches the surrounding chrome.
    React.useEffect(() => {
      useThemeStore.getState().setTheme(colorMode);
    }, [colorMode]);

    return <OverlayCardView content={content} />;
  }

  return { default: ThemedCard };
});

export default function Renderer({ content, colorMode }: Props): React.JSX.Element | null {
  if (!content) return null;
  return (
    <ErrorBoundary
      fallback={() => (
        <div className="grid h-full place-items-center p-6 text-center text-sm text-destructive">
          Could not render this overlay.
        </div>
      )}
    >
      <BrowserOnly>
        {() => (
          <Suspense fallback={null}>
            <LazyCard content={content} colorMode={colorMode} />
          </Suspense>
        )}
      </BrowserOnly>
    </ErrorBoundary>
  );
}
