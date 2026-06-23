import { describe, it, expect } from "vitest";
import { createElement, Fragment, isValidElement } from "react";
import { ReTeXEngine, renderReact, badgePlugin } from "../src/index.js";

/** A mock JSX factory that produces plain inspectable objects. */
interface MockEl {
  type: unknown;
  props: Record<string, unknown>;
  children: unknown[];
}
const h = (
  type: unknown,
  props: Record<string, unknown> | null,
  ...children: unknown[]
): MockEl => ({
  type,
  props: props ?? {},
  children,
});

/** Collect all string text and element type names in render order. */
function walk(node: unknown, types: string[], text: string[]): void {
  if (typeof node === "string") {
    text.push(node);
    return;
  }
  if (node && typeof node === "object" && "type" in (node as MockEl)) {
    const el = node as MockEl;
    if (typeof el.type === "string") types.push(el.type);
    for (const c of el.children) walk(c, types, text);
  }
}

const engine = new ReTeXEngine();

function inspect(src: string) {
  const tree = engine.toReact(src, { createElement: h as never, Fragment });
  const types: string[] = [];
  const text: string[] = [];
  walk(tree, types, text);
  return { types, text: text.join("") };
}

describe("react renderer", () => {
  it("produces a resume container", () => {
    const tree = engine.toReact("hi", { createElement: h as never, Fragment }) as MockEl;
    expect(tree.props.className).toBe("retex-resume");
  });

  it("renders marks to semantic elements", () => {
    const { types, text } = inspect("\\textbf{bold} \\textit{it}");
    expect(types).toContain("strong");
    expect(types).toContain("em");
    expect(text).toContain("bold");
  });

  it("renders a header and sections", () => {
    const { types, text } = inspect("\\name{Jane}\\section{Exp}\nbody");
    expect(types).toContain("header");
    expect(types).toContain("h1");
    expect(types).toContain("section");
    expect(text).toContain("Jane");
    expect(text).toContain("Exp");
  });

  it("renders lists", () => {
    const { types } = inspect("\\begin{itemize}\\item a\\item b\\end{itemize}");
    expect(types).toContain("ul");
    expect(types.filter((t) => t === "li")).toHaveLength(2);
  });

  it("honors React plugin overrides", () => {
    const e = new ReTeXEngine();
    e.use(badgePlugin);
    const tree = e.toReact("\\badge{New}", { createElement: h as never, Fragment });
    const types: string[] = [];
    const text: string[] = [];
    walk(tree, types, text);
    expect(text).toContain("New");
  });

  it("produces valid elements with the real React.createElement", () => {
    const tree = engine.toReact("\\section{X}\n\\textbf{hi}", {
      createElement: createElement as never,
      Fragment,
    });
    expect(isValidElement(tree as never)).toBe(true);
  });
});
