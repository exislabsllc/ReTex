import {
  type DocumentNode,
  type Diagnostic,
  type Token,
  type Theme,
  type PartialTheme,
  type EnvironmentDefinition,
} from "./types/index.js";
import { tokenize, type TokenizeResult } from "./tokenizer/index.js";
import { Parser } from "./parser/parser.js";
import { CommandRegistry } from "./parser/registry.js";
import { createDefaultRegistry } from "./parser/builtins.js";
import { validate } from "./validator/index.js";
import { resolveTheme } from "./theme/themes.js";
import { registerIcon, type IconDefinition } from "./icons/icons.js";
import {
  HtmlRenderer,
  renderJson,
  renderPrintHtml,
  renderPdf,
  type HtmlRenderOptions,
  type JsonRenderOptions,
  type PrintOptions,
  type PdfOptions,
} from "./renderers/index.js";
import type { HtmlRenderFn } from "./renderers/context.js";
import {
  ReactRenderer,
  type ReactRenderFn,
  type ReactRenderOptions,
} from "./renderers/react.js";
import type { EngineCommand, ReTeXPlugin, PluginHost } from "./plugin/types.js";

export interface EngineOptions {
  theme?: Theme | PartialTheme;
  plugins?: ReTeXPlugin[];
  classPrefix?: string;
  /** Max number of compiled documents to cache. Default 64. */
  cacheSize?: number;
}

export interface CompileResult {
  source: string;
  tokens: Token[];
  ast: DocumentNode;
  diagnostics: Diagnostic[];
}

export interface CompileOptions {
  /** Run semantic validation in addition to parsing. Default `true`. */
  validate?: boolean;
}

const isTheme = (t: Theme | PartialTheme | undefined): t is Theme =>
  !!t && "colors" in t && "fonts" in t && "fontSizes" in t && "page" in t;

/**
 * The ReTeX engine: the single entry point that wires the tokenizer, parser,
 * validator, renderers, theming, plugins, and caching together.
 *
 * ```ts
 * const engine = new ReTeXEngine({ theme: { colors: { primary: "#7c3aed" } } });
 * engine.registerCommand({ name: "badge", args: [{ kind: "content" }],
 *   render: { html: (n, ctx, kids) => `<span class="badge">${kids((n as any).args[0].children)}</span>` } });
 * const html = engine.toHtml(source);
 * ```
 */
export class ReTeXEngine implements PluginHost {
  private registry: CommandRegistry;
  private theme: Theme;
  private readonly prefix: string;
  private readonly htmlOverrides = new Map<string, HtmlRenderFn>();
  private readonly reactOverrides = new Map<string, ReactRenderFn>();
  private readonly cache = new Map<string, CompileResult>();
  private readonly cacheSize: number;
  private generation = 0;

  constructor(options: EngineOptions = {}) {
    this.registry = createDefaultRegistry();
    this.theme = isTheme(options.theme) ? options.theme : resolveTheme(options.theme);
    this.prefix = options.classPrefix ?? "retex";
    this.cacheSize = options.cacheSize ?? 64;
    for (const plugin of options.plugins ?? []) this.use(plugin);
  }

  /* ----------------------------- plugins ------------------------------ */

  use(plugin: ReTeXPlugin): this {
    for (const cmd of plugin.commands ?? []) this.registerCommand(cmd);
    for (const env of plugin.environments ?? []) this.registerEnvironment(env);
    for (const [name, def] of Object.entries(plugin.icons ?? {})) {
      this.registerIcon(name, def);
    }
    for (const [key, fn] of Object.entries(plugin.htmlRenderers ?? {})) {
      this.registerHtmlRenderer(key, fn);
    }
    for (const [key, fn] of Object.entries(plugin.reactRenderers ?? {})) {
      this.registerReactRenderer(key, fn);
    }
    if (plugin.theme) this.setTheme(plugin.theme);
    plugin.setup?.(this);
    this.invalidate();
    return this;
  }

  registerCommand(def: EngineCommand): this {
    const { render, ...spec } = def;
    this.registry.registerCommand(spec);
    if (render?.html) this.htmlOverrides.set(`command:${def.name}`, render.html);
    if (render?.react) this.reactOverrides.set(`command:${def.name}`, render.react);
    this.invalidate();
    return this;
  }

  registerEnvironment(def: EnvironmentDefinition): this {
    this.registry.registerEnvironment(def);
    this.invalidate();
    return this;
  }

  registerHtmlRenderer(key: string, fn: HtmlRenderFn): this {
    this.htmlOverrides.set(key, fn);
    return this;
  }

  registerReactRenderer(key: string, fn: ReactRenderFn): this {
    this.reactOverrides.set(key, fn);
    return this;
  }

  registerIcon(name: string, def: IconDefinition): this {
    registerIcon(name, def);
    return this;
  }

  /* ----------------------------- theming ------------------------------ */

  setTheme(theme: Theme | PartialTheme): this {
    this.theme = isTheme(theme) ? theme : resolveTheme(theme, this.theme);
    this.invalidate();
    return this;
  }

  getTheme(): Theme {
    return this.theme;
  }

  getRegistry(): CommandRegistry {
    return this.registry;
  }

  /* --------------------------- compilation ---------------------------- */

  tokenize(source: string): TokenizeResult {
    return tokenize(source);
  }

  /** Tokenize, parse, and (by default) validate a source string. Cached. */
  compile(source: string, options: CompileOptions = {}): CompileResult {
    const runValidate = options.validate ?? true;
    const key = `${this.generation}:${runValidate ? "v" : "p"}:${source}`;
    const cached = this.cache.get(key);
    if (cached) return cached;

    const { tokens, diagnostics: lexDiags } = tokenize(source);
    const { ast, diagnostics: parseDiags } = new Parser(tokens, {
      registry: this.registry,
    }).parse();
    const diagnostics = [...lexDiags, ...parseDiags];
    if (runValidate) diagnostics.push(...validate(ast, { theme: this.theme }));

    const result: CompileResult = { source, tokens, ast, diagnostics };
    this.remember(key, result);
    return result;
  }

  parse(source: string): DocumentNode {
    return this.compile(source, { validate: false }).ast;
  }

  validate(input: string | DocumentNode): Diagnostic[] {
    if (typeof input === "string") return this.compile(input).diagnostics;
    return validate(input, { theme: this.theme });
  }

  /* ----------------------------- renderers ---------------------------- */

  toHtml(input: string | DocumentNode, options: HtmlRenderOptions = {}): string {
    return this.htmlRenderer(options).render(this.astOf(input));
  }

  toHtmlDocument(
    input: string | DocumentNode,
    options: HtmlRenderOptions & { title?: string } = {},
  ): string {
    return this.htmlRenderer(options).renderDocument(this.astOf(input), options.title);
  }

  toReact(
    input: string | DocumentNode,
    options: Omit<ReactRenderOptions, "theme" | "classPrefix" | "overrides">,
  ): unknown {
    return new ReactRenderer({
      ...options,
      theme: this.theme,
      classPrefix: this.prefix,
      overrides: this.reactOverrides,
    }).render(this.astOf(input));
  }

  toJson(input: string | DocumentNode, options?: JsonRenderOptions): string {
    return renderJson(this.astOf(input), options);
  }

  toPrintHtml(input: string | DocumentNode, options: PrintOptions = {}): string {
    return renderPrintHtml(this.astOf(input), this.printOptions(options));
  }

  toPdf(input: string | DocumentNode, options: PdfOptions = {}): Promise<Uint8Array> {
    return renderPdf(this.astOf(input), this.printOptions(options));
  }

  /** The CSS stylesheet for the active theme. */
  styles(): string {
    return this.htmlRenderer().styles();
  }

  /* ------------------------------ internals --------------------------- */

  private astOf(input: string | DocumentNode): DocumentNode {
    return typeof input === "string"
      ? this.compile(input, { validate: false }).ast
      : input;
  }

  private htmlRenderer(options: HtmlRenderOptions = {}): HtmlRenderer {
    return new HtmlRenderer({
      theme: this.theme,
      classPrefix: this.prefix,
      overrides: this.htmlOverrides,
      ...options,
    });
  }

  private printOptions<T extends PrintOptions>(options: T): T {
    return {
      theme: this.theme,
      classPrefix: this.prefix,
      overrides: this.htmlOverrides,
      ...options,
    };
  }

  private invalidate(): void {
    this.generation++;
    this.cache.clear();
  }

  private remember(key: string, result: CompileResult): void {
    if (this.cache.size >= this.cacheSize) {
      const oldest = this.cache.keys().next().value;
      if (oldest !== undefined) this.cache.delete(oldest);
    }
    this.cache.set(key, result);
  }
}

/** Create an engine with the default configuration. */
export function createEngine(options?: EngineOptions): ReTeXEngine {
  return new ReTeXEngine(options);
}
