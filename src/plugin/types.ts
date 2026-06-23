import type {
  CommandDefinition,
  EnvironmentDefinition,
  PartialTheme,
} from "../types/index.js";
import type { HtmlRenderFn } from "../renderers/context.js";
import type { ReactRenderFn } from "../renderers/react.js";
import type { IconDefinition } from "../icons/icons.js";

/**
 * A command definition extended with optional per-target render functions.
 * Passing `render.html` is shorthand for registering an HTML override keyed by
 * `command:<name>` — the common case for a plugin command with no custom AST
 * node (e.g. `\badge{...}`).
 */
export interface EngineCommand extends CommandDefinition {
  render?: {
    html?: HtmlRenderFn;
    react?: ReactRenderFn;
  };
}

/**
 * A ReTeX plugin. Everything is optional; a plugin may contribute commands,
 * environments, icons, renderers, theme overrides, or run arbitrary setup
 * against the engine. Plugins never touch global state — they mutate only the
 * engine instance they are installed on.
 */
export interface ReTeXPlugin {
  name: string;
  commands?: EngineCommand[];
  environments?: EnvironmentDefinition[];
  icons?: Record<string, IconDefinition>;
  /** HTML overrides keyed by node `type` or `command:<name>`. */
  htmlRenderers?: Record<string, HtmlRenderFn>;
  /** React overrides keyed by node `type` or `command:<name>`. */
  reactRenderers?: Record<string, ReactRenderFn>;
  /** A theme patch applied when the plugin is installed. */
  theme?: PartialTheme;
  /** Imperative hook for advanced setup. */
  setup?: (engine: PluginHost) => void;
}

/** The subset of the engine surface a plugin's `setup` hook may use. */
export interface PluginHost {
  registerCommand(def: EngineCommand): PluginHost;
  registerEnvironment(def: EnvironmentDefinition): PluginHost;
  registerHtmlRenderer(key: string, fn: HtmlRenderFn): PluginHost;
  registerReactRenderer(key: string, fn: ReactRenderFn): PluginHost;
  registerIcon(name: string, def: IconDefinition): PluginHost;
}
