import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";
import { join, relative, extname } from "node:path";

const DOCS_DIR = join(import.meta.dir, "..", "docs");
const OUTPUT_FILE = join(DOCS_DIR, "public", "llms-full.txt");

const EXCLUDE_DIRS = new Set(["public", ".vitepress", "node_modules", ".git"]);

/**
 * Recursively collect all .md files in the docs directory
 */
async function getMarkdownFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!EXCLUDE_DIRS.has(entry.name)) {
        files.push(...(await getMarkdownFiles(fullPath)));
      }
    } else if (entry.isFile() && extname(entry.name) === ".md") {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * Sort markdown files logically: index.md first, then by directory and filename
 */
function sortFiles(files: string[]): string[] {
  return files.sort((a, b) => {
    const relA = relative(DOCS_DIR, a);
    const relB = relative(DOCS_DIR, b);

    if (relA === "index.md") return -1;
    if (relB === "index.md") return 1;

    return relA.localeCompare(relB);
  });
}

async function main() {
  console.log("🚀 Generating llms-full.txt...");

  const files = await getMarkdownFiles(DOCS_DIR);
  const sortedFiles = sortFiles(files);

  const header = [
    "# MCTL — Complete Platform Documentation (llms-full.txt)",
    "",
    "> This document bundles the entire documentation set of the MCTL AI-Native Kubernetes & GitOps Platform into a single unified file designed for LLMs with large context windows (1M+ tokens).",
    "",
    `Generated: ${new Date().toISOString()}`,
    `Total Files Included: ${sortedFiles.length}`,
    "",
    "=".repeat(80),
    "",
  ].join("\n");

  const contents: string[] = [header];

  for (const file of sortedFiles) {
    const relPath = relative(DOCS_DIR, file);
    const content = await readFile(file, "utf-8");

    const sectionHeader = [
      "=".repeat(80),
      `FILE: /${relPath}`,
      "=".repeat(80),
      "",
    ].join("\n");

    contents.push(sectionHeader + content.trim() + "\n\n");
  }

  const fullText = contents.join("\n");
  await mkdir(join(DOCS_DIR, "public"), { recursive: true });
  await writeFile(OUTPUT_FILE, fullText, "utf-8");

  const sizeKb = (Buffer.byteLength(fullText, "utf-8") / 1024).toFixed(1);
  const estTokens = Math.round(fullText.length / 4);

  console.log(
    `✅ Successfully generated ${OUTPUT_FILE} (${sizeKb} KB, ~${estTokens.toLocaleString()} tokens across ${sortedFiles.length} files).`
  );
}

main().catch((err) => {
  console.error("❌ Failed to generate llms-full.txt:", err);
  process.exit(1);
});
