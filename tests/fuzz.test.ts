import { describe, it, expect } from "vitest";
import { ReTeXEngine, tokenize, parse } from "../src/index.js";

/** Tiny deterministic PRNG (mulberry32) so fuzz failures are reproducible. */
function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const VOCAB = [
  "\\textbf",
  "\\textit",
  "\\section",
  "\\job",
  "\\begin",
  "\\end",
  "\\item",
  "\\column",
  "\\href",
  "\\icon",
  "\\textcolor",
  "\\skills",
  "{",
  "}",
  "[",
  "]",
  "%",
  "%%",
  "\\\\",
  "\\%",
  "\\{",
  "{itemize}",
  "{columns}",
  "{enumerate}",
  "Hello",
  "40%",
  "a@b.com",
  "=",
  ",",
  "title",
  "company",
  "\n",
  "\n\n",
  " ",
  "#fff",
  "https://x.com",
  "javascript:alert(1)",
  "\\",
  "🚀",
  "&<>\"'",
];

function randomDoc(rng: () => number, n: number): string {
  let s = "";
  for (let i = 0; i < n; i++) {
    s += VOCAB[Math.floor(rng() * VOCAB.length)];
  }
  return s;
}

describe("fuzz — robustness", () => {
  const engine = new ReTeXEngine();

  it("never throws across thousands of random documents", () => {
    const rng = mulberry32(0xc0ffee);
    for (let i = 0; i < 3000; i++) {
      const doc = randomDoc(rng, 5 + Math.floor(rng() * 60));
      expect(
        () => {
          const { ast, diagnostics } = engine.compile(doc, { validate: true });
          expect(ast.type).toBe("document");
          expect(Array.isArray(diagnostics)).toBe(true);
          engine.toHtml(ast);
          engine.toJson(ast);
        },
        `seed doc: ${JSON.stringify(doc)}`,
      ).not.toThrow();
    }
  });

  it("HTML output of fuzzed input never contains a live script or javascript: href", () => {
    const rng = mulberry32(0x1234);
    for (let i = 0; i < 2000; i++) {
      const doc = randomDoc(rng, 5 + Math.floor(rng() * 40));
      const out = engine.toHtml(doc);
      expect(out).not.toContain("<script");
      expect(out).not.toMatch(/href="javascript:/i);
    }
  });

  it("handles deeply nested commands", () => {
    expect(() => {
      const deep = "\\textbf{".repeat(500) + "x" + "}".repeat(500);
      const { ast } = parse(tokenize(deep).tokens);
      expect(ast.type).toBe("document");
    }).not.toThrow();
  });

  it("handles many unclosed groups", () => {
    expect(() => parse(tokenize("{".repeat(5000)).tokens)).not.toThrow();
    expect(() => parse(tokenize("}".repeat(5000)).tokens)).not.toThrow();
  });
});
