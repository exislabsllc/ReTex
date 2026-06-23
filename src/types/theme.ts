/**
 * Theme model. Themes are plain data so they can be serialized, shipped over
 * the wire, edited in a GUI, or composed at runtime. {@link resolveTheme}
 * (see `src/theme`) deep-merges a partial theme over the default.
 */

export interface ThemeColors {
  /** Brand / accent color used for links, section rules, highlights. */
  primary: string;
  /** Muted secondary color for meta text (dates, locations). */
  secondary: string;
  /** Default body text color. */
  text: string;
  /** De-emphasized text color. */
  muted: string;
  /** Page background. */
  background: string;
  /** Hairline / border color. */
  border: string;
  /** Arbitrary named swatches usable via `\themecolor{name}`. */
  [token: string]: string;
}

export interface ThemeFonts {
  /** Font stack for headings (`\name`, `\section`). */
  heading: string;
  /** Font stack for body text. */
  body: string;
  /** Monospace stack (code, technical skills). */
  mono: string;
}

export interface ThemeFontSizes {
  /** Base body size, e.g. `"11pt"`. */
  base: string;
  small: string;
  large: string;
  Large: string;
  Huge: string;
  /** `\name` size. */
  name: string;
  /** `\section` heading size. */
  section: string;
}

export interface ThemeSpacing {
  /** Vertical rhythm unit. */
  unit: string;
  section: string;
  item: string;
  /** Page padding when rendering a full document. */
  page: string;
}

export interface ThemePage {
  /** CSS page size keyword or dimensions, e.g. `"A4"` or `"8.5in 11in"`. */
  size: string;
  margin: string;
  /** Max content width for screen preview. */
  maxWidth: string;
}

export interface Theme {
  name: string;
  colors: ThemeColors;
  fonts: ThemeFonts;
  fontSizes: ThemeFontSizes;
  spacing: ThemeSpacing;
  page: ThemePage;
  /** Section heading style hint consumed by renderers. */
  sectionStyle: "underline" | "rule" | "plain" | "bar";
}

/** A user-supplied theme override; everything is optional and deep-merged. */
export type PartialTheme = {
  name?: string;
  colors?: Partial<ThemeColors>;
  fonts?: Partial<ThemeFonts>;
  fontSizes?: Partial<ThemeFontSizes>;
  spacing?: Partial<ThemeSpacing>;
  page?: Partial<ThemePage>;
  sectionStyle?: Theme["sectionStyle"];
};
