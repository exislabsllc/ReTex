import {
  type Node,
  type DocumentNode,
  type Diagnostic,
  type Position,
} from "../types/index.js";
import { tokenize } from "../tokenizer/index.js";
import { Parser } from "../parser/parser.js";
import { CommandRegistry } from "../parser/registry.js";
import { createDefaultRegistry } from "../parser/builtins.js";

interface Segment {
  start: number;
  end: number;
  startLine: number;
}

interface CacheEntry {
  children: Node[];
  diagnostics: Diagnostic[];
}

export interface IncrementalStats {
  segments: number;
  cacheHits: number;
  cacheMisses: number;
}

export interface IncrementalResult {
  ast: DocumentNode;
  diagnostics: Diagnostic[];
  stats: IncrementalStats;
}

const isLetter = (c: string): boolean => (c >= "a" && c <= "z") || (c >= "A" && c <= "Z");

/**
 * Incremental, block-level compiler optimized for editors. The document is
 * split into balanced blocks at blank-line boundaries; each block's parse is
 * cached by its exact text. When the user edits one block, only that block is
 * re-tokenized and re-parsed — every other block is served from cache and
 * re-positioned with a cheap range shift.
 *
 * The produced AST is equivalent to a full parse (top-level blocks separated by
 * paragraph breaks), making this a drop-in fast path for live preview.
 */
export class IncrementalCompiler {
  private readonly registry: CommandRegistry;
  /** Position-independent parse cache, keyed by exact block text. */
  private readonly parseCache = new Map<string, CacheEntry>();
  /** Position-resolved cache, keyed by `offset:line:text` (already shifted). */
  private positioned = new Map<string, CacheEntry>();
  private hits = 0;
  private misses = 0;

  constructor(options: { registry?: CommandRegistry } = {}) {
    this.registry = options.registry ?? createDefaultRegistry();
  }

  /** Clear all caches (e.g. after registering new commands). */
  reset(): void {
    this.parseCache.clear();
    this.positioned.clear();
  }

  compile(source: string): IncrementalResult {
    this.hits = 0;
    this.misses = 0;
    const segments = splitBalancedSegments(source);
    const children: Node[] = [];
    const diagnostics: Diagnostic[] = [];
    let first = true;

    // Rebuild the positioned cache each pass so stale positions are dropped.
    const nextPositioned = new Map<string, CacheEntry>();

    for (const seg of segments) {
      const text = source.slice(seg.start, seg.end);
      if (text.trim() === "") continue;

      const posKey = `${seg.start}:${seg.startLine}:${text}`;
      let resolved = this.positioned.get(posKey);

      if (resolved) {
        // Same text at the same position — reuse the shifted nodes verbatim.
        this.hits++;
      } else {
        // Parse the block (or reuse a position-independent parse), then shift.
        let parsed = this.parseCache.get(text);
        if (parsed) {
          this.hits++;
        } else {
          this.misses++;
          const { tokens } = tokenize(text);
          const { ast, diagnostics: d } = new Parser(tokens, {
            registry: this.registry,
          }).parse();
          parsed = { children: ast.children, diagnostics: d };
          this.parseCache.set(text, parsed);
        }
        const dOffset = seg.start;
        const dLine = seg.startLine - 1;
        resolved = {
          children: parsed.children.map((n) => shiftClone(n, dOffset, dLine)),
          diagnostics: parsed.diagnostics.map((d) => shiftClone(d, dOffset, dLine)),
        };
      }

      nextPositioned.set(posKey, resolved);
      if (!first) children.push({ type: "parbreak" });
      first = false;
      for (const node of resolved.children) children.push(node);
      for (const diag of resolved.diagnostics) diagnostics.push(diag);
    }

    this.positioned = nextPositioned;
    const ast: DocumentNode = {
      type: "document",
      children,
      range: { start: { offset: 0, line: 1, column: 1 }, end: endPosition(source) },
    };
    return {
      ast,
      diagnostics,
      stats: {
        segments: segments.length,
        cacheHits: this.hits,
        cacheMisses: this.misses,
      },
    };
  }
}

/* --------------------------- segmentation --------------------------- */

/** Split source at blank lines, merging neighbours until each block is balanced. */
export function splitBalancedSegments(source: string): Segment[] {
  const raw: Array<{ start: number; end: number }> = [];
  const re = /\n([ \t]*\n)+/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(source))) {
    raw.push({ start: last, end: m.index });
    last = m.index + m[0].length;
  }
  raw.push({ start: last, end: source.length });

  const segments: Segment[] = [];
  let buffer: { start: number; end: number } | null = null;
  for (const part of raw) {
    if (buffer === null) buffer = { start: part.start, end: part.end };
    else buffer.end = part.end;
    if (isBalanced(source.slice(buffer.start, buffer.end))) {
      segments.push({ ...buffer, startLine: lineAt(source, buffer.start) });
      buffer = null;
    }
  }
  if (buffer !== null) {
    segments.push({ ...buffer, startLine: lineAt(source, buffer.start) });
  }
  return segments;
}

/** Are braces and `\begin`/`\end` balanced in `text`? (Escapes are skipped.) */
export function isBalanced(text: string): boolean {
  let depth = 0;
  let env = 0;
  let i = 0;
  while (i < text.length) {
    const c = text[i]!;
    if (c === "\\") {
      i++;
      if (isLetter(text[i] ?? "")) {
        let name = "";
        while (isLetter(text[i] ?? "")) name += text[i++];
        if (name === "begin") env++;
        else if (name === "end") env--;
      } else {
        i++; // escaped character
      }
      continue;
    }
    if (c === "{" || c === "[") depth++;
    else if (c === "}" || c === "]") depth--;
    i++;
  }
  return depth === 0 && env === 0;
}

/* ----------------------------- shifting ----------------------------- */

/** Deep-clone a value, shifting every embedded {@link Position} by the deltas. */
function shiftClone<T>(value: T, dOffset: number, dLine: number): T {
  if (Array.isArray(value)) {
    return value.map((v) => shiftClone(v, dOffset, dLine)) as unknown as T;
  }
  if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    if ("offset" in obj && "line" in obj && "column" in obj) {
      return {
        offset: (obj.offset as number) + dOffset,
        line: (obj.line as number) + dLine,
        column: obj.column,
      } as unknown as T;
    }
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj)) out[k] = shiftClone(v, dOffset, dLine);
    return out as T;
  }
  return value;
}

/* ----------------------------- helpers ------------------------------ */

function lineAt(source: string, offset: number): number {
  let line = 1;
  for (let i = 0; i < offset && i < source.length; i++) {
    if (source[i] === "\n") line++;
  }
  return line;
}

function endPosition(source: string): Position {
  let line = 1;
  let column = 1;
  for (let i = 0; i < source.length; i++) {
    if (source[i] === "\n") {
      line++;
      column = 1;
    } else {
      column++;
    }
  }
  return { offset: source.length, line, column };
}
