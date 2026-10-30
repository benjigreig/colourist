/**
 * CLR-94: test the candidate questions the grey-only model couldn't (see questions.mjs).
 *
 * One ladder is shared by every family (D-053, D-054). Steps are placed greedily: every token of
 * one family in one theme needs its own step; tokens of different families, or of different
 * themes, may share a step when their ranges allow. Steps at the same grade count once. That's
 * an estimate, not a proven minimum.
 *
 * Scenarios, each added to an app with controls, cards, overlays and selection:
 *   - status messages: four feedback families, each with a tint, tint border, fill, fill states
 *     and text; one of them (a warning) has a light fill with dark text, as yellows need
 *   - a high-contrast version of each theme: separations from Primer, Atlassian and Apple's
 *     high-contrast modes (ladder-distribution.md, Part 4)
 *   - bright surroundings: light-theme separations near the page × 1.6, since light colours were
 *     about 60% harder to tell apart outdoors (Nikitenko et al., 2026)
 *   - people who need more contrast: AAA, and separations × 1.5 for the less sensitive third
 *     (ladder-distribution.md, Part 8). Both multipliers are assumptions to test (CLR-95).
 *   - charts: eight hues, each with a strong and a lighter version (charts.mjs)
 * Then brand style: where each hue is most colourful, which decides which step a vivid fill
 * sits on. Style changes chroma, not lightness, so it can't move the ladder itself (D-012).
 */
import { LIGHT_PAGE, DARK_PAGE, SLACK, T } from "./model.mjs";

/** Absolute grade range for a token in a theme ("sep" and "min" are measured from the page). */
function rangeOf(page, sign, kind, v) {
  if (kind === "page") return [page - 1.5, page + 1.5].map((x) => Math.min(100, Math.max(0, x)));
  if (kind === "abs") return v;                         // [lo, hi] given directly
  const [lo, hi] = kind === "sep" ? [v, v * (1 + SLACK)] : kind === "min" ? [v, v + 6] : [85, 95];
  return [page + sign * lo, page + sign * hi].sort((a, b) => a - b);
}

/** A theme: its page and the separations its uses need. */
function theme(name, page, seps, level, scale = 1) {
  const sign = page < 50 ? 1 : -1;
  const s = Object.fromEntries(Object.entries(seps).map(([k, v]) => [k, v * scale]));
  const grey = [["page", "page"], ["surface", "sep", s.surface], ["sunken", "sep", s.sunken], ["selected", "sep", s.selected],
    ["hover", "sep", s.hover], ["pressed", "sep", s.pressed], ["subtle border", "sep", s.subtle],
    ["control border", "min", s.control ?? T[level].ui], ["muted text", "min", s.muted ?? T[level].text], ["text", "text"]];
  return { name, page, sign, level, grey, s };
}

/** A colour family's tokens in a theme. White text on fills; `lightFill` uses dark text instead. */
function accent(th, lightFill = false) {
  const t = T[th.level].text;
  // A light fill sits near where yellows are most vivid (grade about 14, see the cusp table), ±6.
  const fill = lightFill ? [8, 20] : [t, t + 6];
  const dir = 1; // states move darker: towards the text's contrast on a white-text fill, away from the page on a light fill
  return [["tint", "sep", th.s.hover], ["tint border", "sep", th.s.subtle], ["fill", "abs", fill],
    ["fill hover", "abs", fill.map((x) => x + dir * 8).sort((a, b) => a - b)],
    ["fill pressed", "abs", fill.map((x) => x + dir * 15).sort((a, b) => a - b)], ["text", "min", t]];
}

/** Places steps greedily so each (theme, family) gets distinct steps in range. Returns step positions. */
function place(groups) {
  const steps = [];
  for (const { th, tokens } of groups) {
    const used = new Set();
    const ranges = tokens.map(([n, k, v]) => rangeOf(th.page, th.sign, k, v)).sort((a, b) => a[1] - b[1]);
    for (const [lo, hi] of ranges) {
      const hit = steps.find((p) => !used.has(p) && p >= lo - 1e-9 && p <= hi + 1e-9);
      if (hit !== undefined) used.add(hit);
      else { const p = Math.max(lo, Math.min(hi, hi)); steps.push(p); used.add(p); }
    }
  }
  // Two tokens of one family at the same grade are the same colour, which is fine unless they're
  // in a relationship (fill and accent text often are the same colour), so count distinct grades.
  return [...new Set(steps.map((p) => +p.toFixed(1)))].sort((a, b) => a - b);
}

const LIGHT = { surface: 1.9, sunken: 3.1, selected: 2.8, hover: 3.4, pressed: 7.9, subtle: 8.9 };
const DARK = { surface: 4.0, sunken: 7.9, selected: 12.0, hover: 9.6, pressed: 10.8, subtle: 14.2 };
const HC_LIGHT = { surface: 5.7, sunken: 7.8, selected: 7.0, hover: 9.4, pressed: 19.8, subtle: 20.9, control: 64, muted: 80 };
const HC_DARK = { surface: 5.7, sunken: 19.8, selected: 30, hover: 14.8, pressed: 27, subtle: 36.6, control: 64, muted: 75 };

/** Builds a scenario's groups. */
function scenario({ level = "aa", scaleLight = 1, scaleAll = 1, status = false, hc = false, charts = false }) {
  const themes = [theme("light", LIGHT_PAGE, LIGHT, level, scaleLight * scaleAll), theme("dark", DARK_PAGE, DARK, level, scaleAll)];
  if (hc) themes.push(theme("light HC", LIGHT_PAGE, HC_LIGHT, level), theme("dark HC", DARK_PAGE, HC_DARK, level));
  const groups = [];
  for (const th of themes) {
    groups.push({ th, tokens: th.grey });
    groups.push({ th, tokens: accent(th) });                 // the brand accent
    if (status) for (let i = 0; i < 4; i++) groups.push({ th, tokens: accent(th, i === 1) });
    // Charts: eight hues in order, each with a strong version that reaches 3:1 on the page and a
    // lighter one 12 to 21 grades away, as in Elastic's and ColorBrewer's paired palettes (charts.mjs).
    if (charts) for (let i = 0; i < 8; i++) groups.push({ th, tokens: [["chart", "sep", 37], ["chart light", "sep", 18]] });
  }
  return place(groups);
}

const report = (label, steps) => {
  const light = steps.filter((p) => p <= 15).length, dark = steps.filter((p) => p >= 80).length;
  console.log(`${label.padEnd(58)} ${String(steps.length).padStart(2)} steps · ${light} near the light page · ${dark} near the dark page`);
  return steps;
};

console.log("App with controls, cards, overlays and selection, light and dark, grey plus one brand accent:\n");
const base = report("Baseline", scenario({}));
report("+ status messages (four feedback colours)", scenario({ status: true }));
report("+ charts (eight hues, strong and light)", scenario({ charts: true }));
report("+ a high-contrast version of each theme", scenario({ hc: true }));
report("+ often seen in bright surroundings", scenario({ scaleLight: 1.6 }));
report("+ people who need more contrast (AAA, separations × 1.5)", scenario({ level: "aaa", scaleAll: 1.5 }));
console.log("\nBaseline steps:", base.map((p) => p.toFixed(1)).join(", "));

// ---- Brand style: where each hue is most colourful (the sRGB cusp), as L* and contrast grade.
const lin = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
function oklchToLinearRGB(L, C, h) {
  const a = C * Math.cos((h * Math.PI) / 180), b = C * Math.sin((h * Math.PI) / 180);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3, m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3,
        s = (L - 0.0894841775 * a - 1.2914855480 * b) ** 3;
  return [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s, -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
          -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s];
}
const inGamut = (rgb) => rgb.every((x) => x >= -1e-6 && x <= 1 + 1e-6);
const Yof = ([r, g, b]) => 0.2126729 * r + 0.7151522 * g + 0.072175 * b;
const LstarOf = (Y) => (Y > 216 / 24389 ? 116 * Math.cbrt(Y) - 16 : (Y * 24389) / 27);
const gradeOf = (Y) => (100 * Math.log(1.05 / (Y + 0.05))) / Math.log(21);
console.log("\nWhere each hue is most colourful (OKLCH hue → L* and grade at its most vivid in sRGB):");
const cusps = [];
for (let h = 0; h < 360; h += 30) {
  let best = { C: 0 };
  for (let L = 0.05; L <= 0.99; L += 0.005) {
    let lo = 0, hi = 0.4;
    for (let i = 0; i < 30; i++) { const mid = (lo + hi) / 2; inGamut(oklchToLinearRGB(L, mid, h)) ? (lo = mid) : (hi = mid); }
    if (lo > best.C) best = { C: lo, Y: Yof(oklchToLinearRGB(L, lo, h)) };
  }
  cusps.push({ hue: h, "L*": +LstarOf(best.Y).toFixed(0), grade: +gradeOf(best.Y).toFixed(0), chroma: +best.C.toFixed(3) });
}
console.table(cusps);
void lin;
