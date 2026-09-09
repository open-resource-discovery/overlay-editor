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
 * not confined to the card (`.overlay-card-view` / `.overlay-root`).
 *
 * Note `.ord-ui` is deliberately NOT an accepted scope here. It is a GLOBAL
 * class the playground chrome also carries (see `scopeToCardView`), so a bundle
 * rule left scoped only to `.ord-ui` would apply to the chrome too — which is
 * exactly how ui-components' `.ord-ui :where(*){border-width:0}` reset was
 * zeroing the chrome's Input/Card borders. All `.ord-ui` rules must be further
 * confined to `.overlay-card-view` before shipping.
 *
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
        !s.includes(".overlay-root")
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
 * For the same reason, ui-components' own `.ord-ui`-scoped rules (its reset and
 * `.ord-ui{--ord-*}` token blocks) are ALSO further confined here to
 * `.overlay-card-view .ord-ui`. `.ord-ui` alone is global — the chrome carries
 * it too — so leaving the reset at bare `.ord-ui` made this globally-loaded
 * bundle re-apply `.ord-ui :where(*){border-width:0}` to the chrome, zeroing
 * the chrome's Input/Card borders (its own webpack copy of the reset had been
 * beaten by its utilities in source order; this late-loaded duplicate had not).
 * The chrome gets its reset from its own ui-components stylesheet, so the
 * bundle must not touch it.
 *
 * `:root` / `:host` token blocks are REPLACED with `.overlay-card-view` so the
 * theme defaults land on the card root (the outermost card ancestor, inherited
 * by all card content) and out of the global `:root`/`.ord-ui` — a global
 * `:root{--radius:var(--ord-radius)}` would override the site's own `--radius`
 * on every page, and a global `.ord-ui` block would reach the chrome.
 */
function scopeToCardView(css: string): string {
  const CARD = ".overlay-card-view";
  const TOKEN_SCOPE = ".overlay-card-view";
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

  // `.ord-ui` is intentionally absent: it is a global class (the chrome has it
  // too), so ui-components' `.ord-ui`-scoped reset/token rules must be prefixed
  // with `.overlay-card-view` like everything else, not left global.
  const alreadyScoped = (sel: string): boolean =>
    sel.includes(".overlay-card-view") || sel.includes(".overlay-root");

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
