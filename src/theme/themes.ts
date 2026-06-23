import type { PartialTheme, Theme, ThemeColors } from "../types/theme.js";
import { defaultTheme } from "./default.js";

/** Deep-merge a partial theme over a base theme (sub-objects merged shallowly). */
export function resolveTheme(partial?: PartialTheme, base: Theme = defaultTheme): Theme {
  if (!partial) return base;
  return {
    name: partial.name ?? base.name,
    colors: { ...base.colors, ...partial.colors } as ThemeColors,
    fonts: { ...base.fonts, ...partial.fonts },
    fontSizes: { ...base.fontSizes, ...partial.fontSizes },
    spacing: { ...base.spacing, ...partial.spacing },
    page: { ...base.page, ...partial.page },
    sectionStyle: partial.sectionStyle ?? base.sectionStyle,
  };
}

/** A modern, accent-forward theme with underlined section headings. */
export const modernTheme: Theme = resolveTheme({
  name: "modern",
  colors: { primary: "#7c3aed", accent: "#7c3aed", text: "#111827" },
  sectionStyle: "underline",
});

/** A restrained, classic serif theme suited to academic CVs. */
export const classicTheme: Theme = resolveTheme({
  name: "classic",
  colors: { primary: "#111827", secondary: "#4b5563", accent: "#111827" },
  fonts: {
    heading: 'Georgia, "Times New Roman", serif',
    body: 'Georgia, "Times New Roman", serif',
    mono: 'Consolas, "Courier New", monospace',
  },
  sectionStyle: "rule",
});

/** A compact, single-accent theme that maximizes content density. */
export const compactTheme: Theme = resolveTheme({
  name: "compact",
  fontSizes: {
    base: "9.5pt",
    small: "8pt",
    large: "11pt",
    Large: "13pt",
    Huge: "18pt",
    name: "20pt",
    section: "11pt",
  },
  spacing: { unit: "3px", section: "0.7rem", item: "0.18rem", page: "0.4in" },
  sectionStyle: "bar",
});

/** Built-in theme presets keyed by name. */
export const themes: Record<string, Theme> = {
  default: defaultTheme,
  modern: modernTheme,
  classic: classicTheme,
  compact: compactTheme,
};

/** Look up a preset theme by name, falling back to the default. */
export function getTheme(name: string): Theme {
  return themes[name] ?? defaultTheme;
}
