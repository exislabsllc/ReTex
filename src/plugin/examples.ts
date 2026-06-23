import type { CommandNode } from "../types/index.js";
import type { ReTeXPlugin } from "./types.js";

/**
 * Example plugin: `\badge{New}` renders a small pill. Demonstrates a custom
 * inline command with both HTML and React renderers and no custom AST node.
 */
export const badgePlugin: ReTeXPlugin = {
  name: "badge",
  commands: [
    {
      name: "badge",
      category: "inline",
      args: [{ kind: "content", name: "label" }],
      summary: "A small inline badge / pill.",
      example: "\\badge{New}",
      render: {
        html: (node, ctx, renderChildren) => {
          const n = node as CommandNode;
          const inner = renderChildren(n.args[0]?.children ?? []);
          return (
            `<span class="${ctx.cls("badge")}" style="display:inline-block;` +
            `padding:0.05em 0.45em;border-radius:999px;font-size:0.8em;` +
            `background:var(--${ctx.classPrefix}-primary);color:#fff;` +
            `vertical-align:middle">${inner}</span>`
          );
        },
        react: (node, ctx, renderChildren) => {
          const n = node as CommandNode;
          return ctx.h(
            "span",
            {
              className: ctx.cls("badge"),
              style: {
                display: "inline-block",
                padding: "0.05em 0.45em",
                borderRadius: "999px",
                fontSize: "0.8em",
                background: `var(--${ctx.classPrefix}-primary)`,
                color: "#fff",
                verticalAlign: "middle",
              },
            },
            ...renderChildren(n.args[0]?.children ?? []),
          );
        },
      },
    },
  ],
};

/**
 * Example plugin: `\rating{4}` (out of 5) renders filled/empty dots.
 * Demonstrates a `string` argument and an HTML override.
 */
export const ratingPlugin: ReTeXPlugin = {
  name: "rating",
  commands: [
    {
      name: "rating",
      category: "inline",
      args: [{ kind: "string", name: "score" }],
      summary: "A 0–5 proficiency rating rendered as dots.",
      example: "\\rating{4}",
      render: {
        html: (node, ctx) => {
          const n = node as CommandNode;
          const score = clamp(parseFloat(n.args[0]?.raw ?? "0"));
          let dots = "";
          for (let i = 1; i <= 5; i++) {
            dots += `<span style="color:${
              i <= score
                ? `var(--${ctx.classPrefix}-primary)`
                : `var(--${ctx.classPrefix}-border)`
            }">●</span>`;
          }
          return `<span class="${ctx.cls("rating")}" aria-label="${score} out of 5">${dots}</span>`;
        },
      },
    },
  ],
};

function clamp(n: number): number {
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(5, Math.round(n)));
}
