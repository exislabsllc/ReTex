import type { DocumentNode, Node } from "../types/index.js";

export interface JsonRenderOptions {
  /** Strip `range`/`hash` metadata for a compact, stable payload. */
  stripMeta?: boolean;
  /** `JSON.stringify` indentation (number of spaces). Default 2. */
  indent?: number;
}

/** Deep-clone an AST, optionally removing source metadata. */
export function toJsonTree(ast: Node, opts: JsonRenderOptions = {}): unknown {
  const strip = opts.stripMeta ?? false;
  const clone = (value: unknown): unknown => {
    if (Array.isArray(value)) return value.map(clone);
    if (value && typeof value === "object") {
      const out: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(value)) {
        if (strip && (k === "range" || k === "hash")) continue;
        out[k] = clone(v);
      }
      return out;
    }
    return value;
  };
  return clone(ast);
}

/**
 * The JSON renderer. Produces a structured, machine-readable representation of
 * the document AST — handy for editor tooling, diffing, and storage.
 */
export function renderJson(ast: DocumentNode, opts: JsonRenderOptions = {}): string {
  return JSON.stringify(toJsonTree(ast, opts), null, opts.indent ?? 2);
}
