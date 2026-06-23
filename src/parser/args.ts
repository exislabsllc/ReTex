import type { FieldMap } from "../types/ast.js";

/**
 * Split a comma-separated list, respecting `{...}` and `[...]` nesting so that
 * a brace-protected comma (`{a, b}`) is not treated as a separator.
 */
export function splitTopLevel(raw: string, sep = ","): string[] {
  const parts: string[] = [];
  let depth = 0;
  let current = "";
  for (let i = 0; i < raw.length; i++) {
    const c = raw[i]!;
    if (c === "{" || c === "[") depth++;
    else if (c === "}" || c === "]") depth = Math.max(0, depth - 1);
    if (c === sep && depth === 0) {
      parts.push(current);
      current = "";
    } else {
      current += c;
    }
  }
  parts.push(current);
  return parts;
}

/** Parse a comma-separated list argument into trimmed, non-empty entries. */
export function parseListArg(raw: string): string[] {
  return splitTopLevel(raw)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

/**
 * Parse a `key=value, key=value` argument into a {@link FieldMap}.
 *
 * To keep unquoted values like `location=New York, NY` working, any comma
 * segment that contains no `=` is merged back into the previous value (the
 * comma is treated as literal). The first `=` in a segment separates key from
 * value; later `=` characters are preserved in the value.
 */
export function parseKeyValArg(raw: string): FieldMap {
  const segments = splitTopLevel(raw);
  const merged: string[] = [];
  for (const seg of segments) {
    if (!seg.includes("=") && merged.length > 0) {
      merged[merged.length - 1] += "," + seg;
    } else {
      merged.push(seg);
    }
  }

  const fields: FieldMap = {};
  for (const seg of merged) {
    const trimmed = seg.trim();
    if (trimmed === "") continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) {
      // A bare flag without a value → empty string value.
      fields[trimmed] = "";
      continue;
    }
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (key) fields[key] = value;
  }
  return fields;
}
