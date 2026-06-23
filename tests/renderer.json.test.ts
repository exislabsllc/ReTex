import { describe, it, expect } from "vitest";
import { ReTeXEngine, renderJson, toJsonTree } from "../src/index.js";

const engine = new ReTeXEngine();

describe("json renderer", () => {
  it("serializes the AST to JSON", () => {
    const json = engine.toJson("\\section{X}");
    const parsed = JSON.parse(json);
    expect(parsed.type).toBe("document");
    expect(parsed.children[0].type).toBe("section");
    expect(parsed.children[0].title).toBe("X");
  });

  it("can strip source metadata for a stable payload", () => {
    const ast = engine.parse("\\textbf{Hi}");
    const tree = toJsonTree(ast, { stripMeta: true }) as any;
    expect(tree.range).toBeUndefined();
    expect(tree.children[0].range).toBeUndefined();
  });

  it("keeps ranges by default", () => {
    const ast = engine.parse("\\textbf{Hi}");
    expect((toJsonTree(ast) as any).range).toBeTruthy();
  });

  it("round-trips through JSON.parse", () => {
    expect(() => JSON.parse(renderJson(engine.parse("\\job{title=A}{b}")))).not.toThrow();
  });
});
