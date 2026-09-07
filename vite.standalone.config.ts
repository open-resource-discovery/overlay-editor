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
 * Strip all @layer wrappers from CSS output and scope loose selectors to
 * `.overlay-root`.
 *
 * The standalone bundle is embedded in host pages (e.g. Docusaurus) where
 * Infima's un-layered global styles would always beat our layered rules.
 * Removing @layer wrappers makes everything compete on specificity alone, so
 * the `.overlay-root :where(...)` scoped preflight wins over host globals while
 * ui-components' utilities keep winning over the preflight by source order.
 */
function stripCssLayers(css: string): string {
  let result = css;
  const layerRegex = /@layer\s+[\w-]+\s*\{/g;
  let match: RegExpExecArray | null;
  const matches: { start: number; end: number }[] = [];

  while ((match = layerRegex.exec(result)) !== null) {
    const start = match.index;
    let depth = 0;
    let i = start + match[0].length - 1; // position of opening brace
    for (; i < result.length; i++) {
      if (result[i] === "{") depth++;
      else if (result[i] === "}") {
        depth--;
        if (depth === 0) break;
      }
    }
    matches.push({ start, end: i });
  }

  // Process in reverse order to preserve indices.
  for (let j = matches.length - 1; j >= 0; j--) {
    const { start, end } = matches[j];
    const layerHeader = result.slice(start, result.indexOf("{", start) + 1);
    result =
      result.slice(0, start) +
      result.slice(start + layerHeader.length, end) +
      result.slice(end + 1);
  }

  // Remove bare @layer order declarations like "@layer components;".
  result = result.replace(/@layer\s+[\w,\s-]+;/g, "");

  // Scope zero-specificity :where(.util) selectors to .overlay-root.
  result = result.replace(
    /(?<![.\w])(:where\(\.[a-zA-Z])/g,
    ".overlay-root $1",
  );

  // Scope the @supports properties block to .overlay-root.
  result = result.replace(
    /(\{)\*\s*,\s*:before\s*,\s*:after\s*,\s*::backdrop\s*\{/g,
    "$1.overlay-root *,.overlay-root :before,.overlay-root :after,.overlay-root ::backdrop{",
  );

  return result;
}

/**
 * Confine every rule to the rendered card so the (now unlayered) bundle can
 * beat host globals INSIDE the card without leaking OUT to the rest of the
 * Docusaurus site — including the playground's own chrome.
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
          css = stripCssLayers(css);
          css = scopeToCardView(css);
          writeFileSync(cssPath, css);
          console.log(
            "Stripped @layer wrappers and scoped rules to .overlay-card-view in overlay-cardview.css",
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
