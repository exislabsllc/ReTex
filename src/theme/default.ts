import type { Theme } from "../types/theme.js";

/**
 * The default ReTeX theme — a clean, ATS-friendly look that reads well both on
 * screen and in print. All other themes are partial overrides of this one.
 */
export const defaultTheme: Theme = {
  name: "default",
  colors: {
    primary: "#2563eb",
    secondary: "#64748b",
    text: "#1e293b",
    muted: "#64748b",
    background: "#ffffff",
    border: "#e2e8f0",
    accent: "#2563eb",
    success: "#16a34a",
  },
  fonts: {
    heading: '"Inter", "Helvetica Neue", Helvetica, Arial, sans-serif',
    body: '"Inter", "Helvetica Neue", Helvetica, Arial, sans-serif',
    mono: '"JetBrains Mono", "SF Mono", "Fira Code", Consolas, monospace',
  },
  fontSizes: {
    base: "10.5pt",
    small: "9pt",
    large: "12pt",
    Large: "15pt",
    Huge: "22pt",
    name: "26pt",
    section: "13pt",
  },
  spacing: {
    unit: "4px",
    section: "1.1rem",
    item: "0.28rem",
    page: "0.55in",
  },
  page: {
    size: "Letter",
    margin: "0.55in",
    maxWidth: "8.5in",
  },
  sectionStyle: "rule",
};
