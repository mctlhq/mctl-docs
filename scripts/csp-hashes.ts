import { createHash } from "node:crypto";
import { readdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "docs", ".vitepress", "dist");
const outFile = join(root, "csp-script-src.txt");

// Inline <script> bodies only (skip src=). VitePress emits a handful of
// boot scripts that change per build; hashes must match the HTML nginx serves.
const SCRIPT_RE = /<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi;

async function walkHtml(dir: string): Promise<string[]> {
  const out: string[] = [];
  for (const ent of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, ent.name);
    if (ent.isDirectory()) {
      out.push(...(await walkHtml(p)));
    } else if (ent.name.endsWith(".html")) {
      out.push(p);
    }
  }
  return out;
}

const files = await walkHtml(dist);
if (files.length === 0) {
  throw new Error(`no HTML in ${dist}; run the VitePress build first`);
}

const hashes = new Set<string>();
for (const file of files) {
  const html = await readFile(file, "utf8");
  for (const match of html.matchAll(SCRIPT_RE)) {
    const body = match[1];
    if (!body) {
      continue;
    }
    const digest = createHash("sha256").update(body, "utf8").digest("base64");
    hashes.add(`'sha256-${digest}'`);
  }
}

if (hashes.size === 0) {
  throw new Error("no inline scripts found; refusing empty CSP hashes");
}

const line = [...hashes].sort().join(" ");
await writeFile(outFile, `${line}\n`);
console.log(`wrote ${hashes.size} script-src hashes to ${outFile}`);
