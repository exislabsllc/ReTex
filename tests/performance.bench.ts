import { bench, describe } from "vitest";
import { tokenize, parse, ReTeXEngine, IncrementalCompiler } from "../src/index.js";
import { generateResume } from "./helpers/generate.js";

// ~30 jobs ≈ a long multi-page resume; ~300 jobs ≈ a 100+ page document.
const medium = generateResume(30);
const large = generateResume(300);

describe("tokenize", () => {
  bench("medium (~multi-page)", () => {
    tokenize(medium);
  });
  bench("large (~100+ pages)", () => {
    tokenize(large);
  });
});

describe("parse (tokenize + parse)", () => {
  bench("medium", () => {
    parse(tokenize(medium).tokens);
  });
  bench("large", () => {
    parse(tokenize(large).tokens);
  });
});

describe("full compile + render to HTML", () => {
  const engine = new ReTeXEngine();
  bench("medium", () => {
    engine.toHtml(engine.parse(medium));
  });
  bench("large", () => {
    engine.toHtml(engine.parse(large));
  });
});

describe("incremental re-compile (one block edited)", () => {
  bench("warm cache, single-block edit on large doc", () => {
    const inc = new IncrementalCompiler();
    inc.compile(large); // warm
    const edited = large.replace("feature 0", "feature zero");
    inc.compile(edited);
  });
});
