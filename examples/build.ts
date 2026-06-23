/**
 * Render every `examples/*.retex` file to a standalone HTML document in
 * `examples/out/`. Run with:  `npx tsx examples/build.ts`
 */
import { readdirSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { ReTeXEngine, getTheme, DiagnosticSeverity } from "../src/index.js";

const here = dirname(fileURLToPath(import.meta.url));
const outDir = join(here, "out");
mkdirSync(outDir, { recursive: true });

// Pick a theme per example to show off the theming system.
const themeFor: Record<string, string> = {
  "research-paper": "classic",
  "two-column": "modern",
};

const files = readdirSync(here).filter((f) => f.endsWith(".retex"));
for (const file of files) {
  const name = basename(file, ".retex");
  const source = readFileSync(join(here, file), "utf8");
  const engine = new ReTeXEngine({ theme: getTheme(themeFor[name] ?? "default") });

  const { diagnostics } = engine.compile(source);
  const errors = diagnostics.filter((d) => d.severity === DiagnosticSeverity.Error);
  for (const d of diagnostics) {
    const where = `${d.range.start.line}:${d.range.start.column}`;
    console.log(`  [${d.severity}] ${file}:${where} ${d.code} ${d.message}`);
  }
  if (errors.length > 0) {
    console.error(`✗ ${file}: ${errors.length} error(s)`);
    process.exitCode = 1;
  }

  const html = engine.toHtmlDocument(source, { title: name });
  writeFileSync(join(outDir, `${name}.html`), html, "utf8");
  console.log(`✓ ${file} → out/${name}.html (${html.length} bytes)`);
}
