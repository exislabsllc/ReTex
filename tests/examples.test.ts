import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { ReTeXEngine, DiagnosticSeverity } from "../src/index.js";

const examplesDir = join(dirname(fileURLToPath(import.meta.url)), "..", "examples");
const files = readdirSync(examplesDir).filter((f) => f.endsWith(".retex"));

describe("example resumes", () => {
  it("ships at least three examples", () => {
    expect(files.length).toBeGreaterThanOrEqual(3);
  });

  for (const file of files) {
    const name = basename(file, ".retex");
    const source = readFileSync(join(examplesDir, file), "utf8");

    describe(name, () => {
      const engine = new ReTeXEngine();
      const { ast, diagnostics } = engine.compile(source);

      it("compiles with no error-severity diagnostics", () => {
        const errors = diagnostics.filter((d) => d.severity === DiagnosticSeverity.Error);
        expect(errors, JSON.stringify(errors, null, 2)).toHaveLength(0);
      });

      it("renders to a non-trivial HTML document", () => {
        const html = engine.toHtmlDocument(ast, { title: name });
        expect(html).toContain("<!DOCTYPE html>");
        expect(html).toContain("retex-resume");
        expect(html.length).toBeGreaterThan(500);
        expect(html).not.toContain("<script");
      });

      it("renders to valid JSON", () => {
        expect(() => JSON.parse(engine.toJson(ast))).not.toThrow();
      });
    });
  }
});
