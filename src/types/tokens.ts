import type { SourceRange } from "./source.js";

/**
 * Token kinds produced by the {@link Tokenizer}.
 *
 * ReTeX intentionally diverges from TeX in a few places that matter for
 * resumes:
 *  - `%` is a *literal* percent sign (so `Reduced latency by 40%` and
 *    `\column{40%}` work as written) rather than a comment marker.
 *  - Comments use `%%` to end-of-line, which never collides with percentages.
 */
export enum TokenType {
  /** A command such as `\section`, `\textbf`, `\item`. The lexeme excludes the backslash. */
  Command = "Command",
  /** `{` — begin group / argument. */
  LBrace = "LBrace",
  /** `}` — end group / argument. */
  RBrace = "RBrace",
  /** `[` — begin optional argument. */
  LBracket = "LBracket",
  /** `]` — end optional argument. */
  RBracket = "RBracket",
  /** Run of literal text. */
  Text = "Text",
  /** Run of inline whitespace (spaces/tabs, single newline). */
  Whitespace = "Whitespace",
  /** A blank line — paragraph break. */
  ParBreak = "ParBreak",
  /** `\\` — explicit line break. */
  LineBreak = "LineBreak",
  /** `%% ...` comment (stripped from output, surfaced to editor tooling). */
  Comment = "Comment",
  /** End of input. */
  EOF = "EOF",
}

/** A lexical token with full source provenance. */
export interface Token {
  type: TokenType;
  /** The exact source text of the token (backslash stripped for commands). */
  value: string;
  range: SourceRange;
}

/** Reserved single characters that the tokenizer treats specially. */
export const SPECIAL_CHARS = new Set(["\\", "{", "}", "[", "]"]);
