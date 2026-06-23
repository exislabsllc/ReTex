import type { Theme } from "../types/index.js";

const tokenSafe = (s: string): string => s.replace(/[^a-zA-Z0-9_-]/g, "");

/**
 * Generate the stylesheet for a rendered resume from a {@link Theme}. Theme
 * values become CSS custom properties so they can be overridden at runtime,
 * and every theme color is exposed as `--retex-color-<token>` for use by
 * `\themecolor`.
 */
export function themeToCss(theme: Theme, prefix = "retex"): string {
  const p = prefix;
  const colorVars = Object.entries(theme.colors)
    .map(([k, v]) => `    --${p}-color-${tokenSafe(k)}: ${v};`)
    .join("\n");

  return `.${p}-resume {
${colorVars}
    --${p}-primary: ${theme.colors.primary};
    --${p}-text: ${theme.colors.text};
    --${p}-muted: ${theme.colors.muted};
    --${p}-border: ${theme.colors.border};
    --${p}-bg: ${theme.colors.background};
    --${p}-font-heading: ${theme.fonts.heading};
    --${p}-font-body: ${theme.fonts.body};
    --${p}-font-mono: ${theme.fonts.mono};
    --${p}-fs-base: ${theme.fontSizes.base};
    --${p}-fs-small: ${theme.fontSizes.small};
    --${p}-fs-large: ${theme.fontSizes.large};
    --${p}-fs-Large: ${theme.fontSizes.Large};
    --${p}-fs-Huge: ${theme.fontSizes.Huge};
    --${p}-fs-name: ${theme.fontSizes.name};
    --${p}-fs-section: ${theme.fontSizes.section};
    --${p}-sp-section: ${theme.spacing.section};
    --${p}-sp-item: ${theme.spacing.item};

    box-sizing: border-box;
    max-width: ${theme.page.maxWidth};
    margin: 0 auto;
    padding: ${theme.spacing.page};
    background: var(--${p}-bg);
    color: var(--${p}-text);
    font-family: var(--${p}-font-body);
    font-size: var(--${p}-fs-base);
    line-height: 1.45;
}
.${p}-resume *, .${p}-resume *::before, .${p}-resume *::after { box-sizing: border-box; }

.${p}-header { margin-bottom: var(--${p}-sp-section); }
.${p}-name {
    font-family: var(--${p}-font-heading);
    font-size: var(--${p}-fs-name);
    font-weight: 700;
    margin: 0 0 0.1em;
    color: var(--${p}-text);
    letter-spacing: -0.01em;
}
.${p}-title {
    font-size: var(--${p}-fs-large);
    color: var(--${p}-primary);
    margin: 0 0 0.45em;
    font-weight: 500;
}
.${p}-contact {
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem 1rem;
    font-size: var(--${p}-fs-small);
    color: var(--${p}-muted);
}
.${p}-contact-item {
    display: inline-flex;
    align-items: center;
    gap: 0.3em;
    color: inherit;
    text-decoration: none;
}
.${p}-contact-item svg { opacity: 0.8; }

.${p}-section { margin-bottom: var(--${p}-sp-section); break-inside: avoid; }
.${p}-section-title {
    font-family: var(--${p}-font-heading);
    font-size: var(--${p}-fs-section);
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--${p}-primary);
    margin: 0 0 0.5em;
}
.${p}-section--rule .${p}-section-title { border-bottom: 2px solid var(--${p}-border); padding-bottom: 0.2em; }
.${p}-section--underline .${p}-section-title { text-decoration: underline; text-underline-offset: 3px; }
.${p}-section--bar .${p}-section-title {
    border-left: 3px solid var(--${p}-primary);
    padding-left: 0.5em;
    border-bottom: none;
}
.${p}-subsection-title {
    font-family: var(--${p}-font-heading);
    font-size: var(--${p}-fs-large);
    font-weight: 600;
    margin: 0.6em 0 0.3em;
}

.${p}-entry { margin-bottom: 0.6rem; break-inside: avoid; }
.${p}-entry-row {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 1rem;
}
.${p}-entry-title { font-weight: 700; }
.${p}-entry-subtitle { color: var(--${p}-primary); font-weight: 500; }
.${p}-entry-dates, .${p}-entry-location {
    color: var(--${p}-muted);
    font-size: var(--${p}-fs-small);
    white-space: nowrap;
}
.${p}-entry-body { margin-top: 0.15rem; }
.${p}-entry-body p { margin: 0.2em 0; }

.${p}-list { margin: 0.2rem 0 0.2rem 1.1rem; padding: 0; }
.${p}-list li { margin-bottom: var(--${p}-sp-item); padding-left: 0.15rem; }

.${p}-columns { display: flex; gap: 1.5rem; align-items: flex-start; }
.${p}-column { min-width: 0; }

.${p}-skills { display: flex; flex-wrap: wrap; gap: 0.4rem; list-style: none; margin: 0.2rem 0; padding: 0; }
.${p}-skill {
    background: color-mix(in srgb, var(--${p}-primary) 12%, transparent);
    color: var(--${p}-primary);
    border-radius: 4px;
    padding: 0.12rem 0.5rem;
    font-size: var(--${p}-fs-small);
    font-weight: 500;
    white-space: nowrap;
}

.${p}-link { color: var(--${p}-primary); text-decoration: none; }
.${p}-link:hover { text-decoration: underline; }
.${p}-icon { display: inline-flex; vertical-align: -0.125em; }
.${p}-rule { border: none; border-top: 1px solid var(--${p}-border); margin: 0.6rem 0; }
.${p}-center { text-align: center; }
.${p}-scale-small { font-size: var(--${p}-fs-small); }
.${p}-scale-large { font-size: var(--${p}-fs-large); }
.${p}-scale-Large { font-size: var(--${p}-fs-Large); }
.${p}-scale-Huge { font-size: var(--${p}-fs-Huge); }
p.${p}-para { margin: 0 0 0.45em; }
p.${p}-para:last-child { margin-bottom: 0; }

@media print {
    .${p}-resume { max-width: none; margin: 0; padding: 0; }
    .${p}-section, .${p}-entry { break-inside: avoid; }
    a { color: inherit; }
}`;
}
