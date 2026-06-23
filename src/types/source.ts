/**
 * Source-location primitives shared by every stage of the compiler.
 *
 * Every token and AST node carries a {@link SourceRange} so that diagnostics,
 * editor tooling (hover, completion, error underlines) and incremental
 * re-parsing can map results back to the exact bytes in the original source.
 */

/** A single position in the source text. */
export interface Position {
  /** Zero-based UTF-16 code-unit offset from the start of the document. */
  offset: number;
  /** One-based line number. */
  line: number;
  /** One-based column number. */
  column: number;
}

/** A half-open `[start, end)` range in the source text. */
export interface SourceRange {
  start: Position;
  end: Position;
}

/** Convenience constructor for a {@link Position}. */
export function pos(offset: number, line: number, column: number): Position {
  return { offset, line, column };
}

/** Convenience constructor for a {@link SourceRange}. */
export function range(start: Position, end: Position): SourceRange {
  return { start, end };
}

/** Merge two ranges into the smallest range that contains both. */
export function mergeRanges(a: SourceRange, b: SourceRange): SourceRange {
  return {
    start: a.start.offset <= b.start.offset ? a.start : b.start,
    end: a.end.offset >= b.end.offset ? a.end : b.end,
  };
}

/** Test whether an offset falls within a range (start inclusive, end inclusive). */
export function rangeContains(r: SourceRange, offset: number): boolean {
  return offset >= r.start.offset && offset <= r.end.offset;
}
