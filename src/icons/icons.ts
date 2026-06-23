/**
 * Icon registry. Icons are stored as the inner markup of a `0 0 24 24` SVG and
 * use `currentColor` so they inherit surrounding text color. The set is
 * intentionally small and extensible via {@link registerIcon} / plugins.
 *
 * Glyphs are simplified, original representations (not vendor logo artwork) so
 * the package carries no third-party asset licensing.
 */

export interface IconDefinition {
  /** Inner SVG markup (paths/shapes) with a `0 0 24 24` viewBox. */
  body: string;
  /** Whether shapes are stroked (true) or filled (false). */
  stroked?: boolean;
  /** Aliases that resolve to this icon. */
  aliases?: string[];
}

const ICONS: Record<string, IconDefinition> = {
  github: {
    body: '<path d="M12 1.5A10.5 10.5 0 0 0 8.7 22c.5.1.7-.2.7-.5v-2c-2.9.6-3.5-1.3-3.5-1.3-.5-1.2-1.2-1.5-1.2-1.5-.9-.6.1-.6.1-.6 1 .1 1.6 1 1.6 1 .9 1.6 2.4 1.1 3 .9.1-.7.4-1.1.7-1.4-2.3-.3-4.8-1.2-4.8-5.2 0-1.2.4-2.1 1-2.9-.1-.3-.5-1.3.1-2.7 0 0 .9-.3 2.8 1.1a9.6 9.6 0 0 1 5 0c1.9-1.4 2.8-1.1 2.8-1.1.6 1.4.2 2.4.1 2.7.7.8 1 1.7 1 2.9 0 4-2.5 4.9-4.8 5.2.4.3.7 1 .7 2v3c0 .3.2.6.7.5A10.5 10.5 0 0 0 12 1.5Z"/>',
  },
  linkedin: {
    body: '<path d="M20.5 2h-17A1.5 1.5 0 0 0 2 3.5v17A1.5 1.5 0 0 0 3.5 22h17a1.5 1.5 0 0 0 1.5-1.5v-17A1.5 1.5 0 0 0 20.5 2ZM8 19H5v-9h3v9ZM6.5 8.7A1.7 1.7 0 1 1 6.5 5.3a1.7 1.7 0 0 1 0 3.4ZM19 19h-3v-4.7c0-1.1 0-2.6-1.6-2.6s-1.8 1.2-1.8 2.5V19h-3v-9h2.9v1.2h.04a3.2 3.2 0 0 1 2.9-1.6c3.1 0 3.7 2 3.7 4.7V19Z"/>',
  },
  email: {
    body: '<path d="M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm.4 2 8.6 6 8.6-6H3.4ZM20 8.2l-7.4 5.2a1 1 0 0 1-1.2 0L4 8.2V17h16V8.2Z"/>',
    aliases: ["mail", "envelope"],
  },
  phone: {
    body: '<path d="M6.6 10.8a15.5 15.5 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.58 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1 11.4 11.4 0 0 0 .57 3.6 1 1 0 0 1-.25 1l-2.2 2.2Z"/>',
    aliases: ["tel", "telephone"],
  },
  location: {
    body: '<path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Z"/>',
    aliases: ["map", "pin", "marker", "geo"],
  },
  website: {
    body: '<path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm6.9 6h-2.9a15.7 15.7 0 0 0-1.3-3.4A8 8 0 0 1 18.9 8ZM12 4c.8 1.1 1.5 2.5 1.9 4h-3.8c.4-1.5 1.1-2.9 1.9-4ZM4.3 14a8 8 0 0 1 0-4h3.3a17.6 17.6 0 0 0 0 4H4.3Zm.8 2h2.9a15.7 15.7 0 0 0 1.3 3.4A8 8 0 0 1 5.1 16Zm2.9-8H5.1a8 8 0 0 1 4.2-3.4A15.7 15.7 0 0 0 8 8Zm4 12c-.8-1.1-1.5-2.5-1.9-4h3.8c-.4 1.5-1.1 2.9-1.9 4Zm2.3-6h-4.6a15.3 15.3 0 0 1 0-4h4.6a15.3 15.3 0 0 1 0 4Zm.4 5.4a15.7 15.7 0 0 0 1.3-3.4h2.9a8 8 0 0 1-4.2 3.4ZM16.4 14a17.6 17.6 0 0 0 0-4h3.3a8 8 0 0 1 0 4h-3.3Z"/>',
    aliases: ["globe", "web", "link", "url"],
  },
  twitter: {
    body: '<path d="M22 5.9c-.7.3-1.5.6-2.3.7a4 4 0 0 0 1.8-2.2c-.8.5-1.7.8-2.6 1a4 4 0 0 0-6.8 3.6A11.3 11.3 0 0 1 3.9 4.8a4 4 0 0 0 1.2 5.3c-.6 0-1.2-.2-1.8-.5a4 4 0 0 0 3.2 3.9c-.6.1-1.2.2-1.8.1a4 4 0 0 0 3.7 2.8A8 8 0 0 1 2 18.1 11.3 11.3 0 0 0 8.1 20c7.4 0 11.5-6.2 11.5-11.5v-.5c.8-.6 1.5-1.3 2-2.1Z"/>',
    aliases: ["x"],
  },
  gitlab: {
    body: '<path d="m21.9 13.1-1.1-3.4-2.2-6.8a.6.6 0 0 0-1.1 0l-2.2 6.8H8.7L6.5 2.9a.6.6 0 0 0-1.1 0L3.2 9.7l-1.1 3.4a1.2 1.2 0 0 0 .4 1.3l9.5 6.9 9.5-6.9a1.2 1.2 0 0 0 .4-1.3Z"/>',
  },
  stackoverflow: {
    body: '<path d="M17 21v-6h2v8H4v-8h2v6h11ZM7 17h9v-2H7v2Zm.3-4.2 8.8 1.8.4-2-8.8-1.8-.4 2Zm1.2-4.4 8.1 3.8.8-1.8-8.1-3.8-.8 1.8Zm2.5-4 6.9 5.7 1.3-1.5-6.9-5.7-1.3 1.5ZM15.6 1l-1.6 1.2 5.3 7.2 1.6-1.2L15.6 1Z"/>',
    aliases: ["stack-overflow", "so"],
  },
  scholar: {
    body: '<path d="M12 2 1 9l11 7 9-5.7V17h2V9L12 2ZM5 14.2V18c0 1.7 3.1 3 7 3s7-1.3 7-3v-3.8l-7 4.4-7-4.4Z"/>',
    aliases: ["google-scholar", "academic"],
  },
  orcid: {
    body: '<path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20ZM8.5 7.6a1.1 1.1 0 1 1 0 2.2 1.1 1.1 0 0 1 0-2.2ZM9.5 17h-2v-6.2h2V17Zm2-6.2h3.3c2.2 0 3.6 1.5 3.6 3.1 0 1.8-1.4 3.1-3.6 3.1H11.5v-6.2Zm2 1.7v2.8h1.1c1.2 0 1.8-.6 1.8-1.4s-.6-1.4-1.8-1.4h-1.1Z"/>',
  },
  calendar: {
    body: '<path d="M7 2v2H5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2V2h-2v2H9V2H7ZM5 9h14v10H5V9Z"/>',
    aliases: ["date"],
  },
  briefcase: {
    body: '<path d="M9 3a2 2 0 0 0-2 2v1H4a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-3V5a2 2 0 0 0-2-2H9Zm0 3V5h6v1H9Z"/>',
    aliases: ["work", "job"],
  },
};

// Build the alias lookup once.
const ALIASES: Record<string, string> = {};
for (const [name, def] of Object.entries(ICONS)) {
  for (const alias of def.aliases ?? []) ALIASES[alias] = name;
}

/** Resolve a (possibly aliased) icon name to its canonical key. */
export function resolveIconName(name: string): string | undefined {
  const key = name.trim().toLowerCase();
  if (ICONS[key]) return key;
  if (ALIASES[key]) return ALIASES[key];
  return undefined;
}

export function hasIcon(name: string): boolean {
  return resolveIconName(name) !== undefined;
}

export function getIcon(name: string): IconDefinition | undefined {
  const key = resolveIconName(name);
  return key ? ICONS[key] : undefined;
}

/** Register (or override) an icon at runtime. Used by plugins. */
export function registerIcon(name: string, def: IconDefinition): void {
  const key = name.trim().toLowerCase();
  ICONS[key] = def;
  for (const alias of def.aliases ?? []) ALIASES[alias] = key;
}

/** All canonical icon names, for completion / docs. */
export function iconNames(): string[] {
  return Object.keys(ICONS);
}

/**
 * Render an icon to an inline SVG string. Returns `null` for unknown icons so
 * callers can emit a diagnostic and a graceful fallback.
 */
export function iconToSvg(
  name: string,
  opts: { size?: number | string; className?: string } = {},
): string | null {
  const def = getIcon(name);
  if (!def) return null;
  const size = opts.size ?? "1em";
  const dim = typeof size === "number" ? `${size}` : size;
  const cls = opts.className ? ` class="${opts.className}"` : "";
  const fillOrStroke = def.stroked
    ? 'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"'
    : 'fill="currentColor"';
  return (
    `<svg${cls} width="${dim}" height="${dim}" viewBox="0 0 24 24" ` +
    `${fillOrStroke} role="img" aria-hidden="true" focusable="false">` +
    `${def.body}</svg>`
  );
}
