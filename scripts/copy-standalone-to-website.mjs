// Copy the standalone bundle (dist-standalone/) into the Docusaurus site's
// static dir so the playground can load it as a plain static asset —
// outside webpack's CSS layering, which is what lets the layer-stripped CSS
// win over Infima. Mirrors @open-resource-discovery/a2a-editor's script.
import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { resolve } from "node:path";

const rootDir = resolve(import.meta.dirname, "..");
const sourceDir = resolve(rootDir, "dist-standalone");
const targetDir = resolve(rootDir, "website/static/standalone");

if (!existsSync(sourceDir)) {
  throw new Error(
    `Standalone build output not found: ${sourceDir}. Run "npm run build:standalone" first.`,
  );
}

rmSync(targetDir, { recursive: true, force: true });
mkdirSync(targetDir, { recursive: true });
cpSync(sourceDir, targetDir, { recursive: true });

console.log(`Copied standalone assets from ${sourceDir} to ${targetDir}`);
