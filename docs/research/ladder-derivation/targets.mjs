/**
 * CLR-13 Q2: where does one neutral family need steps, if it serves both light and dark themes?
 *
 * Reads the 27-system data (../ladder-distribution/uses/uses.json) and, for every system with
 * both modes, places each neutral use at its absolute contrast grade (0 = white, 100 = black,
 * counting towards dark, D-042). Fills are left out: they're accent families, not greys.
 *
 * Prints, per system:
 *   - the absolute grade of each use, light and dark
 *   - how many distinct values the two modes use, and how many hex values they share
 * then the pooled median target positions across systems.
 */
import { readFileSync } from "node:fs";
import { parseColour, over, grade } from "../ladder-distribution/uses/lib.mjs";

const data = JSON.parse(readFileSync(new URL("../ladder-distribution/uses/uses.json", import.meta.url), "utf8"));
const USES = ["page", "surface", "sunken", "hover", "pressed", "selected", "borderSubtle", "borderStrong", "textMuted", "text"];

/** Resolves a use to an opaque colour, compositing translucent values over the mode's page. */
function solid(mode, use) {
  const page = parseColour(mode.page?.value);
  const c = parseColour(mode[use]?.value);
  if (!c || !page) return null;
  return c.a < 1 ? over(c, page) : c;
}

const hex = (c) => c && [c.r, c.g, c.b].map((x) => Math.round(x * 255)).join(",");
const median = (xs) => { const s = [...xs].sort((a, b) => a - b); const m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };

const pooled = { light: {}, dark: {} };
const rows = [];
for (const [system, { modes }] of Object.entries(data)) {
  if (!modes.light || !modes.dark) continue;
  const row = { system };
  const sets = {};
  for (const m of ["light", "dark"]) {
    sets[m] = new Set();
    for (const u of USES) {
      const c = solid(modes[m], u);
      if (!c) continue;
      const g = grade(c);
      row[`${m[0]}.${u}`] = Math.round(g);
      (pooled[m][u] ??= []).push(g);
      sets[m].add(hex(c));
    }
  }
  row.distinct = new Set([...sets.light, ...sets.dark]).size;
  row.shared = [...sets.light].filter((h) => sets.dark.has(h)).length;
  rows.push(row);
}
console.log("Systems with both modes:", rows.length);
console.table(rows.map(({ system, distinct, shared }) => ({ system, distinct, shared })));

console.log("\nMedian absolute grade of each use (0 = white, 100 = black)");
const targets = [];
for (const m of ["light", "dark"]) for (const u of USES) {
  const xs = pooled[m][u]; if (!xs?.length) continue;
  const g = median(xs);
  targets.push({ mode: m, use: u, grade: +g.toFixed(1), n: xs.length });
}
targets.sort((a, b) => a.grade - b.grade);
console.table(targets);
console.log("JSON", JSON.stringify(targets));
