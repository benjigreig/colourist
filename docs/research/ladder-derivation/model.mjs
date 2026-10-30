/**
 * The ladder-derivation model shared by derive.mjs and additive.mjs (CLR-13, D-053).
 * Turns semantic tokens' relationship targets into allowed ranges of absolute contrast grade
 * (0 = white, 100 = black, D-042), and counts the steps one family needs across two themes.
 * The assumptions behind each range are documented in derive.mjs.
 */
export const LIGHT_PAGE = 0, DARK_PAGE = 95.4, MIN_GAP = 1, SLACK = 0.5;
export const T = { aa: { ui: 37, text: 50 }, aaa: { ui: 37, text: 64 } };

/** The neutral family's tokens in one theme. */
export const neutral = (level) => [
  ["page", "page"], ["surface", "sep", 1.9], ["sunken", "sep", 3.1], ["selected", "sep", 2.8],
  ["hover", "sep", 3.4], ["pressed", "sep", 7.9], ["subtle border", "sep", 8.9],
  ["control border", "min", T[level].ui], ["muted text", "min", T[level].text], ["text", "text"],
];
export const neutralDark = (level) => neutral(level).map((u) => {
  const darkSep = { surface: 4.0, sunken: 7.9, selected: 12.0, hover: 9.6, pressed: 10.8, "subtle border": 14.2 };
  return u[1] === "sep" ? [u[0], "sep", darkSep[u[0]]] : u;
});

/** An accent family's tokens in one theme: tint surface and border, fill and its states, accent text.
 * Tints use the neutral hover and subtle-border separations for that theme. */
export const accent = (level, theme) => [
  ["tint surface", "sep", theme === "light" ? 3.4 : 9.6], ["tint border", "sep", theme === "light" ? 8.9 : 14.2],
  ["fill", "on", T[level].text], ["fill hover", "delta", 8], ["fill pressed", "delta", 15],
  ["accent text", "min", T[level].text],
];

/** Converts one token to an absolute grade range in a theme. */
export function range(theme, [name, kind, v], fill) {
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
export function themeRanges(theme, tokens) {
  const out = []; let fill = null;
  for (const t of tokens) {
    const r = range(theme, t, fill);
    if (t[1] === "on") fill = r;
    out.push(r);
  }
  return out;
}

/** Pairs light and dark ranges that overlap, largest overlap first; each range pairs once. */
export function share(light, dark) {
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
export function fits(ranges) {
  let last = -Infinity;
  for (const r of [...ranges].sort((a, b) => a.hi - b.hi || a.lo - b.lo)) {
    const p = Math.max(r.lo, last + MIN_GAP);
    if (p > r.hi + 1e-9) return `no: ${r.theme} ${r.name} can't be ${MIN_GAP} grade from its neighbours`;
    last = p;
  }
  return "yes";
}

