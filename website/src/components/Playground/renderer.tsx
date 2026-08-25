import React, { lazy, Suspense } from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';

type Props = {
  /** Raw overlay document (JSON or YAML text). */
  content: string;
  /** Current Docusaurus color mode, synced into the library's theme store. */
  colorMode: 'light' | 'dark';
};

// Error boundary that clears its caught error when `resetKey` changes. Unlike a
// plain `key`, this does NOT remount the (healthy) child on every re-render —
// it only re-renders children again after an error once the input that caused
// it has changed. So a render failure recovers when the user selects another
// overlay or edits the current one, without a full remount per keystroke.
class ResettableErrorBoundary extends React.Component<
  { resetKey: unknown; fallback: React.ReactNode; children: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError(): { hasError: true } {
    return { hasError: true };
  }

  componentDidUpdate(prevProps: { resetKey: unknown }): void {
    if (this.state.hasError && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false });
    }
  }

  render(): React.ReactNode {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}

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

export default function Renderer({
  content,
  colorMode,
}: Props): React.JSX.Element | null {
  if (!content) return null;
  return (
    <ResettableErrorBoundary
      resetKey={content}
      fallback={
        <div className="grid h-full place-items-center p-6 text-center text-sm text-destructive">
          Could not render this overlay.
        </div>
      }
    >
      <BrowserOnly>
        {() => (
          <Suspense fallback={null}>
            <LazyCard content={content} colorMode={colorMode} />
          </Suspense>
        )}
      </BrowserOnly>
    </ResettableErrorBoundary>
  );
}
