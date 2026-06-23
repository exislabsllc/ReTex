import { describe, it, expect } from "vitest";
import { ReTeXEngine, createEngine } from "../src/index.js";

describe("engine", () => {
  it("compiles to a full result", () => {
    const engine = new ReTeXEngine();
    const result = engine.compile("\\section{X}");
    expect(result.source).toBe("\\section{X}");
    expect(result.tokens.length).toBeGreaterThan(0);
    expect(result.ast.type).toBe("document");
    expect(Array.isArray(result.diagnostics)).toBe(true);
  });

  it("caches identical compilations", () => {
    const engine = new ReTeXEngine();
    const a = engine.compile("\\section{Cached}");
    const b = engine.compile("\\section{Cached}");
    expect(a).toBe(b); // same cached object reference
  });

  it("separates validated and non-validated cache entries", () => {
    const engine = new ReTeXEngine();
    const v = engine.compile("\\item x", { validate: true });
    const p = engine.compile("\\item x", { validate: false });
    expect(v.diagnostics.length).toBeGreaterThan(p.diagnostics.length);
  });

  it("renders to every target", () => {
    const engine = new ReTeXEngine();
    const src = "\\name{Jane}\\section{X}\\textbf{hi}";
    expect(engine.toHtml(src)).toContain("retex-resume");
    expect(engine.toHtmlDocument(src)).toContain("<!DOCTYPE html>");
    expect(JSON.parse(engine.toJson(src)).type).toBe("document");
    expect(engine.toPrintHtml(src)).toContain("@page");
  });

  it("accepts an AST directly for rendering", () => {
    const engine = new ReTeXEngine();
    const ast = engine.parse("\\textbf{hi}");
    expect(engine.toHtml(ast)).toContain("<strong>hi</strong>");
  });

  it("createEngine is equivalent to the constructor", () => {
    expect(createEngine()).toBeInstanceOf(ReTeXEngine);
  });

  it("exposes the active theme stylesheet", () => {
    expect(new ReTeXEngine().styles()).toContain(".retex-resume");
  });
});
