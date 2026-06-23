import { describe, it, expect } from "vitest";
import { tokenize, parse, ReTeXEngine, IncrementalCompiler } from "../src/index.js";
import { generateResume } from "./helpers/generate.js";

/** Median of repeated timings, after a warmup, to reduce noise. */
function median(fn: () => void, runs = 7): number {
  fn(); // warmup (JIT)
  const times: number[] = [];
  for (let i = 0; i < runs; i++) {
    const t0 = performance.now();
    fn();
    times.push(performance.now() - t0);
  }
  times.sort((a, b) => a - b);
  return times[Math.floor(times.length / 2)]!;
}

describe("performance budgets", () => {
  // Generous bounds (≈4–6× observed) so the test catches real regressions
  // without flaking on slow/contended CI machines.

  it("parses a multi-page resume well under the 50ms target", () => {
    const src = generateResume(30); // ~280 lines
    const ms = median(() => parse(tokenize(src).tokens));
    expect(ms).toBeLessThan(50);
  });

  it("parses a 100+ page document quickly", () => {
    const src = generateResume(300); // ~2,700 lines, 116 KB
    const ms = median(() => parse(tokenize(src).tokens));
    expect(ms).toBeLessThan(250);
  });

  it("renders a large document to HTML quickly", () => {
    const engine = new ReTeXEngine();
    const ast = engine.parse(generateResume(300));
    const ms = median(() => engine.toHtml(ast));
    expect(ms).toBeLessThan(200);
  });

  it("serves repeat compilations from cache instantly", () => {
    const engine = new ReTeXEngine();
    const src = generateResume(100);
    engine.compile(src); // prime
    const ms = median(() => engine.compile(src));
    expect(ms).toBeLessThan(5);
  });

  it("re-parses only the edited block, not the whole document", () => {
    const src = generateResume(200);
    const inc = new IncrementalCompiler();
    const cold = inc.compile(src);
    expect(cold.stats.cacheMisses).toBe(cold.stats.segments);

    const edited = src.replace("title=Engineer 0,", "title=Engineer Zero,");
    expect(edited).not.toBe(src);
    const warm = inc.compile(edited);
    // Exactly one block changed text; everything else is served from cache.
    expect(warm.stats.cacheMisses).toBe(1);
    expect(warm.stats.cacheHits).toBe(warm.stats.segments - 1);
  });
});
