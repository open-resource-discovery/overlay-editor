// Standalone bundle build for `@open-resource-discovery/overlay-editor`.
//
// Produces a single self-contained IIFE (`overlay-cardview.js`) with React
// bundled in, plus `overlay-cardview.css`, for CDN/script-tag usage and for the
// Docusaurus playground. Mirrors @open-resource-discovery/a2a-editor's
// `vite.standalone.config.ts`.
//
// The two CSS post-processing steps are the heart of the host-CSS-isolation
// fix — see src/lib/standalone.ts for the rationale.
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import postcss from "postcss";
import { resolve } from "node:path";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";

/**
 * Safety gate: return any selector that would leak to the host site — i.e. one
 * not confined to the card (`.overlay-card-view` / `.overlay-root` / `.ord-ui`).
 * The un-layered bundle competes with the Docusaurus site on specificity, so an
 * un-scoped selector here would apply globally. The build fails if this is
 * non-empty.
 */
function findUnscopedSelectors(css: string): string[] {
  const root = postcss.parse(css);
  const leaks: string[] = [];
  root.walkRules((rule) => {
    const parent = rule.parent;
    if (parent?.type === "atrule") {
      const name = (parent as postcss.AtRule).name.toLowerCase();
      if (name.includes("keyframes") || name === "font-face") return;
    }
    for (const sel of rule.selectors) {
      const s = sel.trim();
      if (!s) continue;
      if (
        !s.includes(".overlay-card-view") &&
        !s.includes(".overlay-root") &&
        !s.includes(".ord-ui")
      ) {
        leaks.push(s);
      }
    }
  });
  return leaks;
}

/**
 * Strip `@layer` wrappers AND confine every rule to the rendered card, in a
 * single PostCSS pass, so the (now un-layered) bundle can beat host globals
 * INSIDE the card without leaking OUT to the rest of the Docusaurus site —
 * including the playground's own chrome.
 *
 * Scope target is `.overlay-card-view` (the wrapper `OverlayCardView` renders),
 * NOT `.ord-ui`. The playground wraps its chrome (search box, example list —
 * see OverlaySelector) in `.ord-ui` too, and that chrome uses ui-components
 * components with the WEBSITE's own Tailwind utilities as `className` overrides
 * (e.g. `<Card.Content className="px-3 pb-0 pt-0">`). If we scoped to `.ord-ui`,
 * these unlayered card utilities (`.p-6`, …) would out-specify the website's
 * override utilities (`.pb-0`, which ui-components never generates), breaking
 * them. `.overlay-card-view` only ever wraps the rendered overlay, whose markup
 * uses ui-components' own classes exclusively, so there is no such conflict.
 *
 * `:root` / `:host` token blocks are REPLACED with `:is(.overlay-card-view,
 * .ord-ui)` so the theme tokens land on the `.ord-ui` element (where
 * `--ord-*` are defined and thus resolve) and out of the global `:root` — a
 * global `:root{--radius:var(--ord-radius)}` would override the site's own
 * `--radius` on every page.
 */
function scopeToCardView(css: string): string {
  const CARD = ".overlay-card-view";
  const TOKEN_SCOPE = ":is(.overlay-card-view, .ord-ui)";
  const root = postcss.parse(css);

  // 1. Unlayer: hoist `@layer x { … }` contents in place and drop bare
  //    `@layer a, b;` statements — so the bundle competes with the host page
  //    (Docusaurus/Infima, un-layered) on specificity + source order. Collect
  //    first, then mutate, to avoid skipping nodes during the walk.
  const layerRules: postcss.AtRule[] = [];
  root.walkAtRules("layer", (atRule) => {
    layerRules.push(atRule);
  });
  for (const atRule of layerRules) {
    if (atRule.nodes) atRule.replaceWith(atRule.nodes);
    else atRule.remove();
  }

  const alreadyScoped = (sel: string): boolean =>
    sel.includes(".overlay-card-view") ||
    sel.includes(".overlay-root") ||
    sel.includes(".ord-ui");

  root.walkRules((rule) => {
    // Skip @keyframes / @font-face frames (their "selectors" aren't element
    // selectors). Rules inside @media/@supports/@container are still scoped.
    const parent = rule.parent;
    if (parent?.type === "atrule") {
      const name = (parent as postcss.AtRule).name.toLowerCase();
      if (name.includes("keyframes") || name === "font-face") return;
    }

    rule.selectors = rule.selectors.map((sel) => {
      const s = sel.trim();
      if (!s || alreadyScoped(s)) return sel;
      // `:is(...) :root` would match nothing, so replace root/host selectors
      // outright — this pulls the token defaults onto the card scope.
      if (s === ":root" || s === ":host") return TOKEN_SCOPE;
      return `${CARD} ${s}`;
    });
  });

  return root.toResult().css;
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: "strip-standalone-css-layers",
      closeBundle() {
        const outDir = resolve(__dirname, "dist-standalone");
        if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

        const cssPath = resolve(outDir, "overlay-cardview.css");
        if (existsSync(cssPath)) {
          let css = readFileSync(cssPath, "utf-8");
          css = scopeToCardView(css);

          // Safety gate: refuse to ship CSS that would leak onto the host site.
          const leaks = findUnscopedSelectors(css);
          if (leaks.length > 0) {
            throw new Error(
              `overlay-cardview.css has ${leaks.length} un-scoped selector(s) that would leak to the host site: ` +
                leaks.slice(0, 10).join(", "),
            );
          }

          writeFileSync(cssPath, css);
          console.log(
            "Unlayered + scoped overlay-cardview.css to .overlay-card-view (0 leaks)",
          );
        }
      },
    },
  ],
  resolve: {
    alias: {
      "@": resolve(__dirname, "."),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime"],
  },
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
  },
  publicDir: false,
  build: {
    outDir: "dist-standalone",
    emptyOutDir: true,
    cssCodeSplit: false,
    minify: "oxc",
    sourcemap: true,
    lib: {
      entry: resolve(__dirname, "src/lib/standalone.ts"),
      // Distinct from the runtime `window.OverlayPlayground` API object, which
      // standalone.ts assigns explicitly. If this IIFE name matched, Vite's
      // wrapper would overwrite that assignment with the module namespace
      // (which has no `.init`). See the MIXED_EXPORTS note.
      name: "OverlayPlaygroundBundle",
      formats: ["iife"],
      fileName: () => "overlay-cardview.js",
    },
    rollupOptions: {
      // Bundle everything, including React (no external deps).
      external: [],
      output: {
        inlineDynamicImports: true,
        assetFileNames: (assetInfo) =>
          assetInfo.names?.[0]?.endsWith(".css")
            ? "overlay-cardview.css"
            : "[name][extname]",
      },
    },
  },
});
