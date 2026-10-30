/**
 * CLR-13 Q3 groundwork: which product choices change what a family's ladder has to provide?
 *
 * Each choice adds semantic tokens (D-052), so choices add up rather than being one-or-the-other.
 * For every combination this reports, for the neutral family:
 *   - how many steps the tokens need (model.mjs; light and dark may share steps)
 *   - how many tokens find no free step in range on each preset ladder (D-050), within TOLERANCE
 * A choice that never changes the recommended preset isn't worth asking about for that purpose.
 */
import { neutral, neutralDark, themeRanges, share } from "./model.mjs";

const TOLERANCE = 1; // grades either side of a range that still count as "in range"

/** Preset ladders' grades, from ladder-distribution.md Part 1 (D-050). */
const PRESETS = {
  11: [2, 4, 8, 16, 27, 41, 57, 72, 85, 92, 97],
  13: [2, 3, 7, 12, 19, 29, 41, 54, 67, 79, 88, 93, 97],
  15: [2, 3, 6, 9, 15, 22, 31, 41, 52, 64, 74, 83, 89, 94, 97],
};

/** Product choices, each adding neutral tokens by name. */
const BASE = ["page", "surface", "subtle border", "muted text", "text"];
const CHOICES = {
  controls: ["hover", "pressed", "control border"],   // buttons, inputs, links with states
  layers: ["sunken"],                                  // a second surface layer: panels, menus, dialogs
  selection: ["selected"],                             // selectable rows, lists, tabs
};

/**
 * Counts tokens that can't each get their own step in range (within TOLERANCE) in one theme.
 * Greedy by range end, which is optimal for matching points to intervals.
 */
function gaps(ranges, steps) {
  const free = [...steps].sort((a, b) => a - b), used = new Set(); let missing = 0;
  for (const r of [...ranges].sort((a, b) => a.hi - b.hi)) {
    const s = free.find((p) => !used.has(p) && p >= r.lo - TOLERANCE && p <= r.hi + TOLERANCE);
    if (s === undefined) missing++; else used.add(s);
  }
  return missing;
}

const pick = (tokens, names) => tokens.filter(([n]) => names.includes(n));
const subsets = (keys) => keys.reduce((acc, k) => acc.concat(acc.map((s) => [...s, k])), [[]]);

const rows = [];
for (const level of ["aa", "aaa"]) for (const dark of [false, true]) for (const chosen of subsets(Object.keys(CHOICES))) {
  const names = [...BASE, ...chosen.flatMap((c) => CHOICES[c])];
  const light = themeRanges("light", pick(neutral(level), names));
  const darkR = dark ? themeRanges("dark", pick(neutralDark(level), names)) : [];
  const steps = light.length + darkR.length - (dark ? share(light, darkR).length : 0);
  const row = { target: level.toUpperCase(), themes: dark ? "light + dark" : "light", choices: chosen.join(" + ") || "content only", tokens: names.length, steps };
  for (const [n, p] of Object.entries(PRESETS)) row[`gaps on ${n}`] = gaps(light, p) + (dark ? gaps(darkR, p) : 0);
  rows.push(row);
}
console.table(rows);
