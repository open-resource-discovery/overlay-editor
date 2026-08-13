#!/usr/bin/env node
// Strip side-effect CSS imports from emitted `.d.ts` files.
//
// `src/lib/index.ts` has `import "./styles.css";` so Vite knows to
// bundle the stylesheet. Vite produces `dist/index.css` correctly,
// but tsc copies the import line into `dist/.../index.d.ts` as
// `import "./styles.css";` — and strict TS consumers then chase a
// path that doesn't exist in the published artifact.
//
// We walk `dist/` and delete every `^\s*import [..].css..;?\s*$` line
// from `.d.ts` files. Idempotent.
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('../dist/', import.meta.url).pathname;

const CSS_IMPORT_RE = /^\s*import\s+["'][^"']+\.css["']\s*;?\s*$\n?/gm;

function walk(dir) {
    for (const entry of readdirSync(dir)) {
        const full = join(dir, entry);
        const stat = statSync(full);
        if (stat.isDirectory()) {
            walk(full);
        } else if (entry.endsWith('.d.ts')) {
            strip(full);
        }
    }
}

function strip(file) {
    const before = readFileSync(file, 'utf8');
    const after = before.replace(CSS_IMPORT_RE, '');
    if (after !== before) {
        writeFileSync(file, after);
        process.stdout.write(`strip css from: ${file.replace(ROOT, '')}\n`);
    }
}

try {
    walk(ROOT);
} catch (e) {
    if (e?.code !== 'ENOENT') throw e;
}
