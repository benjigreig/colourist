/**
 * CLR-13 Q2: how many steps, and where, does one family need to serve its semantic tokens'
 * relationships in a light and a dark theme?
 *
 * Model (D-052): within one theme, tokens in a relationship can't share a step (a hover that
 * equals its surface isn't a state). Across themes, a light token and a dark token may share a
 * step when their allowed ranges overlap, since they're never shown together.
 *
 * Allowed ranges are absolute grades (0 = white, 100 = black, D-042), from each theme's page:
 *   - separations ("sep"), from the 27-system medians (ladder-distribution.md, Part 4):
 *     [s, s × 1.5], at least the target and at most half as much again
 *   - contrast thresholds ("min"), from D-049 (37, 50, 64 grades): [t, t + 6]
 *   - text: [85, 95] grades from the page, around practice (91 light, 89 dark)
 *   - text on a fill ("on"): white text in both themes, the commonest choice, so the fill is
 *     at least the text threshold from white: [t, t + 6], whichever theme it's in
 *   - fill states ("delta"): the fill moved darker by the median 8 (hover) or 15 (pressed)
 *     grades, ±2, which keeps the white text legible
 *
 * Within a theme, every token needs its own step, at least MIN_GAP grades from the next;
 * fits() checks that's possible. Shared steps across themes are
 * found greedily (largest overlap first). The greedy pairing is a quick estimate, not a proof
 * of the minimum.
 */
import { T, neutral, neutralDark, accent, themeRanges, share, fits } from "./model.mjs";

function report(label, light, dark) {
  const shared = share(light, dark);
  const steps = light.length + dark.length - shared.length;
  console.log(`\n${label}: ${light.length} light + ${dark.length} dark tokens → ${steps} steps (${shared.length} shared); distinct steps fit: light ${fits(light)}, dark ${fits(dark)}`);
  for (const { l, d } of shared) console.log(`  shared: light ${l.name} ${l.lo.toFixed(1)}–${l.hi.toFixed(1)} with dark ${d.name} ${d.lo.toFixed(1)}–${d.hi.toFixed(1)}`);
  return steps;
}

for (const level of ["aa", "aaa"]) {
  console.log(`\n================ ${level.toUpperCase()} ================`);
  report("Neutral, all ten uses", themeRanges("light", neutral(level)), themeRanges("dark", neutralDark(level)));
  const core = (ts) => ts.filter(([n]) => !["sunken", "selected"].includes(n));
  report("Neutral, core eight (no sunken or selected)", themeRanges("light", core(neutral(level))), themeRanges("dark", core(neutralDark(level))));
  report("Accent", themeRanges("light", accent(level, "light")), themeRanges("dark", accent(level, "dark")));
}
console.log("\nRanges (AA, neutral):");
console.table([...themeRanges("light", neutral("aa")), ...themeRanges("dark", neutralDark("aa"))].map((r) => ({ ...r, lo: +r.lo.toFixed(1), hi: +r.hi.toFixed(1) })));
console.log("Ranges (AA, accent):");
console.table([...themeRanges("light", accent("aa", "light")), ...themeRanges("dark", accent("aa", "dark"))].map((r) => ({ ...r, lo: +r.lo.toFixed(1), hi: +r.hi.toFixed(1) })));

/** How far each range sits from the nearest step of today's 13-step ladder (D-050, Part 1). */
const CURRENT_13 = [2, 3, 7, 12, 19, 29, 41, 54, 67, 79, 88, 93, 97];
console.log("\nToday's 13-step ladder against the AA ranges (misses only, in grades):");
const all = [...themeRanges("light", neutral("aa")), ...themeRanges("dark", neutralDark("aa")),
             ...themeRanges("light", accent("aa", "light")), ...themeRanges("dark", accent("aa", "dark"))];
console.table(all.map((r) => {
  const miss = Math.min(...CURRENT_13.map((p) => (p < r.lo ? r.lo - p : p > r.hi ? p - r.hi : 0)));
  return { token: `${r.theme} ${r.name}`, range: `${r.lo.toFixed(1)}–${r.hi.toFixed(1)}`, miss: +miss.toFixed(1) };
}).filter((m) => m.miss > 0));
