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
const LIGHT_PAGE = 0, DARK_PAGE = 95.4, MIN_GAP = 1, SLACK = 0.5;
const T = { aa: { ui: 37, text: 50 }, aaa: { ui: 37, text: 64 } };

/** The neutral family's tokens in one theme. */
const neutral = (level) => [
  ["page", "page"], ["surface", "sep", 1.9], ["sunken", "sep", 3.1], ["selected", "sep", 2.8],
  ["hover", "sep", 3.4], ["pressed", "sep", 7.9], ["subtle border", "sep", 8.9],
  ["control border", "min", T[level].ui], ["muted text", "min", T[level].text], ["text", "text"],
];
const neutralDark = (level) => neutral(level).map((u) => {
  const darkSep = { surface: 4.0, sunken: 7.9, selected: 12.0, hover: 9.6, pressed: 10.8, "subtle border": 14.2 };
  return u[1] === "sep" ? [u[0], "sep", darkSep[u[0]]] : u;
});

/** An accent family's tokens in one theme: tint surface and border, fill and its states, accent text.
 * Tints use the neutral hover and subtle-border separations for that theme. */
const accent = (level, theme) => [
  ["tint surface", "sep", theme === "light" ? 3.4 : 9.6], ["tint border", "sep", theme === "light" ? 8.9 : 14.2],
  ["fill", "on", T[level].text], ["fill hover", "delta", 8], ["fill pressed", "delta", 15],
  ["accent text", "min", T[level].text],
];

/** Converts one token to an absolute grade range in a theme. */
function range(theme, [name, kind, v], fill) {
  const page = theme === "light" ? LIGHT_PAGE : DARK_PAGE, sign = theme === "light" ? 1 : -1;
  let lo, hi;
  if (kind === "page") [lo, hi] = [0, theme === "light" ? 2 : 3];
  else if (kind === "sep") [lo, hi] = [v, v * (1 + SLACK)];
  else if (kind === "min") [lo, hi] = [v, v + 6];
  else if (kind === "text") [lo, hi] = [85, 95];
  else if (kind === "on") return { theme, name, lo: v, hi: v + 6 };           // from white text, not the page
  else if (kind === "delta") return { theme, name, lo: fill.lo + v - 2, hi: fill.lo + v + 2 }; // darker than the fill
  const a = page + sign * lo, b = page + sign * hi;
  return { theme, name, lo: Math.min(a, b), hi: Math.max(a, b) };
}

/** Builds one theme's ranges, resolving fill states from the fill. */
function themeRanges(theme, tokens) {
  const out = []; let fill = null;
  for (const t of tokens) {
    const r = range(theme, t, fill);
    if (t[1] === "on") fill = r;
    out.push(r);
  }
  return out;
}

/** Pairs light and dark ranges that overlap, largest overlap first; each range pairs once. */
function share(light, dark) {
  const pairs = [];
  for (const l of light) for (const d of dark) {
    const o = Math.min(l.hi, d.hi) - Math.max(l.lo, d.lo);
    if (o >= 0) pairs.push({ l, d, o });
  }
  pairs.sort((a, b) => b.o - a.o);
  const used = new Set(), shared = [];
  for (const p of pairs) if (!used.has(p.l) && !used.has(p.d)) { used.add(p.l); used.add(p.d); shared.push(p); }
  return shared;
}

/** Checks one theme's tokens can each take their own step, MIN_GAP apart (greedy by range end). */
function fits(ranges) {
  let last = -Infinity;
  for (const r of [...ranges].sort((a, b) => a.hi - b.hi || a.lo - b.lo)) {
    const p = Math.max(r.lo, last + MIN_GAP);
    if (p > r.hi + 1e-9) return `no: ${r.theme} ${r.name} can't be ${MIN_GAP} grade from its neighbours`;
    last = p;
  }
  return "yes";
}

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
