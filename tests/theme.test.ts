import { describe, it, expect } from "vitest";
import {
  resolveTheme,
  getTheme,
  themes,
  defaultTheme,
  themeToCss,
  ReTeXEngine,
} from "../src/index.js";

describe("theming", () => {
  it("returns the default theme unchanged when no override is given", () => {
    expect(resolveTheme()).toBe(defaultTheme);
  });

  it("deep-merges partial overrides", () => {
    const t = resolveTheme({ colors: { primary: "#ff0000" } });
    expect(t.colors.primary).toBe("#ff0000");
    expect(t.colors.text).toBe(defaultTheme.colors.text); // untouched
    expect(t.fonts.body).toBe(defaultTheme.fonts.body);
  });

  it("ships named presets", () => {
    expect(Object.keys(themes)).toEqual(
      expect.arrayContaining(["default", "modern", "classic", "compact"]),
    );
    expect(getTheme("modern").sectionStyle).toBe("underline");
    expect(getTheme("unknown")).toBe(defaultTheme);
  });

  it("emits CSS variables for every color (including custom tokens)", () => {
    const css = themeToCss(resolveTheme({ colors: { brand: "#123456" } }));
    expect(css).toContain("--retex-color-brand: #123456");
    expect(css).toContain("--retex-primary:");
  });

  it("applies a theme through the engine", () => {
    const engine = new ReTeXEngine({ theme: { colors: { primary: "#7c3aed" } } });
    expect(engine.getTheme().colors.primary).toBe("#7c3aed");
    expect(engine.styles()).toContain("#7c3aed");
  });

  it("resolves \\themecolor against the active theme palette", () => {
    const engine = new ReTeXEngine();
    const out = engine.toHtml("\\themecolor{primary}{x}");
    expect(out).toContain("var(--retex-color-primary");
  });
});
