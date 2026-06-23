import { describe, it, expect } from "vitest";
import {
  IncrementalCompiler,
  isBalanced,
  splitBalancedSegments,
  tokenize,
  parse,
  renderHtml,
} from "../src/index.js";

const sample = `\\name{Jane Doe}

\\section{Experience}

\\job{title=Engineer, company=ACME}{
Built things.
\\begin{itemize}
  \\item one
  \\item two
\\end{itemize}
}

\\section{Education}

\\education{school=MIT, degree=BS}`;

describe("incremental — segmentation", () => {
  it("detects balanced blocks", () => {
    expect(isBalanced("\\textbf{hi}")).toBe(true);
    expect(isBalanced("\\textbf{hi")).toBe(false);
    expect(isBalanced("\\begin{itemize}\\item a")).toBe(false);
    expect(isBalanced("\\begin{itemize}\\item a\\end{itemize}")).toBe(true);
    expect(isBalanced("a \\{ b")).toBe(true); // escaped brace doesn't count
  });

  it("keeps an environment that spans blank lines in one segment", () => {
    const src = "\\begin{itemize}\n\n\\item a\n\n\\item b\n\n\\end{itemize}";
    const segs = splitBalancedSegments(src);
    expect(segs).toHaveLength(1);
  });

  it("splits independent paragraphs into separate segments", () => {
    expect(splitBalancedSegments("a\n\nb\n\nc")).toHaveLength(3);
  });
});

describe("incremental — caching", () => {
  it("serves unchanged blocks from cache on recompile", () => {
    const inc = new IncrementalCompiler();
    const r1 = inc.compile(sample);
    expect(r1.stats.cacheMisses).toBe(r1.stats.segments);
    const r2 = inc.compile(sample);
    expect(r2.stats.cacheHits).toBe(r2.stats.segments);
    expect(r2.stats.cacheMisses).toBe(0);
  });

  it("only reparses the edited block", () => {
    const inc = new IncrementalCompiler();
    inc.compile(sample);
    const edited = sample.replace("Built things.", "Built better things.");
    const r = inc.compile(edited);
    expect(r.stats.cacheMisses).toBe(1);
    expect(r.stats.cacheHits).toBe(r.stats.segments - 1);
  });

  it("renders identically to a full parse", () => {
    const inc = new IncrementalCompiler();
    const incremental = renderHtml(inc.compile(sample).ast);
    const full = renderHtml(parse(tokenize(sample).tokens).ast);
    expect(incremental).toBe(full);
  });
});
