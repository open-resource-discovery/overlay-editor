import React, { lazy, Suspense } from 'react';
import Layout from '@theme/Layout';
import BrowserOnly from '@docusaurus/BrowserOnly';
import styles from './playground.module.css';

// Load the playground body via a dynamic import so its client-only dependency
// graph (Monaco, ui-components' SplitPane, the lazily-imported card view) is
// never *evaluated* during server-side static generation — a static import
// would be, even though `<BrowserOnly>` defers rendering.
const PlaygroundBody = lazy(
  () => import('@site/src/components/Playground/PlaygroundBody'),
);

export default function PlaygroundPage(): React.JSX.Element {
  const loading = <div className={styles.loading}>Loading playground…</div>;
  return (
    <Layout
      title="Playground"
      description="Browse predefined ORD Overlay examples, edit the JSON, and see the rendered card view live."
      noFooter
    >
      <main className={styles.playground}>
        <BrowserOnly fallback={loading}>
          {() => (
            <Suspense fallback={loading}>
              <PlaygroundBody />
            </Suspense>
          )}
        </BrowserOnly>
      </main>
    </Layout>
  );
}
