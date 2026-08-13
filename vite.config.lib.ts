// Library build for `@open-resource-discovery/overlay-editor`.
//
// Coexists with the Next.js app — this config is invoked only via
// `npm run build:lib`, not by `next dev`/`next build`. Next still owns
// `app/`; Vite only sees `src/lib/`.
//
// Mirrors @open-resource-discovery/a2a-editor's lib build:
//   - Multiple named entries → one `.js` per `exports` subpath.
//   - `formats: ["es"]`, React (and jsx-runtime) externalized.
//   - `cssCodeSplit: true` + `assetFileNames` rename → single
//     `dist/index.css` shared by every entry.
//   - `chunkFileNames: chunks/[name]-[hash].js` keeps shared code under
//     `dist/chunks/`.
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";
import { resolve } from "node:path";

export default defineConfig({
  plugins: [
    react(),
    dts({
      entryRoot: "src/lib",
      include: ["src/lib/**/*.ts", "src/lib/**/*.tsx"],
      exclude: ["**/*.test.ts", "**/*.test.tsx"],
      tsconfigPath: "tsconfig.lib.json",
    }),
  ],
  resolve: {
    alias: {
      "@": resolve(__dirname, "."),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime"],
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    cssCodeSplit: true,
    minify: false,
    // Don't copy public/ into the published artifact — those are demo assets.
    copyPublicDir: false,
    lib: {
      entry: {
        index: resolve(__dirname, "src/lib/index.ts"),
        "card-view": resolve(__dirname, "src/lib/card-view.ts"),
      },
      formats: ["es"],
    },
    rollupOptions: {
      external: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
        /^@open-resource-discovery\//,
        "shiki",
        "yaml",
        "lucide-react",
      ],
      output: {
        chunkFileNames: "chunks/[name]-[hash].js",
        assetFileNames: (asset) =>
          asset.names?.some((n) => n.endsWith(".css"))
            ? "index.css"
            : "[name][extname]",
      },
    },
  },
});
