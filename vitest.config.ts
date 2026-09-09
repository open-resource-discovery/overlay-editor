import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    exclude: ["**/node_modules/**", "website/**", "tests/smoke/**", "dist/**"],
    server: {
      deps: {
        // `@open-resource-discovery/ui-components` is a `file:` (symlinked) dep
        // whose dev checkout carries its own node_modules/react (its peer dep,
        // installed for building) plus `@base-ui/*`, which import THAT react.
        // Vitest SSR-externalizes those packages by default, so `resolve.dedupe`
        // never rewrites their react import — leaving a second React instance
        // whose hooks dispatcher is null ("Cannot read properties of null
        // (reading 'useMemo'/'useRef'/'useState')"). Inlining them routes their
        // react imports through Vite's resolver, where dedupe collapses them to
        // overlay's single copy.
        inline: [/@open-resource-discovery\/ui-components/, /@base-ui\//],
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
    // `@open-resource-discovery/ui-components` is a `file:` (symlinked) dep with
    // its own node_modules/react. Without dedupe, its `import "react"` resolves
    // to that copy — a second React instance whose hooks dispatcher is null in
    // the test's render, crashing any ui-components component that uses a hook
    // (e.g. CodeBlock) with "Cannot read properties of null (reading 'useState')".
    // Mirror the vite build configs and force a single React.
    dedupe: ["react", "react-dom", "react/jsx-runtime"],
  },
});
