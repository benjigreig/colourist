/**
 * CLR-13: work out the beta recipes' ladders (D-054, D-055), placing every step by the use that
 * needs it, so each step's zone and purpose come from the model rather than being assigned later.
 *
 * Every recipe carries greys, one brand colour and four feedback colours (error, warning, success,
 * info), since feedback colours are always in the beta (US-05). The warning has a light fill with
 * dark text; the others have white text, except on the dark page at AAA, where a white-text fill
 * can't also stand 3:1 from the page, so it becomes a light fill with dark text (model.mjs). Charts and high contrast are after the beta.
 *
 * Placement, for each theme and family in turn:
 *   - each token has a range (model.mjs) and a preferred grade: its target separation, its
 *     contrast threshold, or practice for text (91 grades from the page in light, 89 in dark)
 *   - it reuses an existing step in its range that its own family and theme isn't already using,
 *     the one nearest its preference; an accent's text may share its fill's step
 *   - otherwise a new step goes at the preferred grade, nudged within range so it's at least
 *     MIN_GAP grades from every other step, which also keeps rounded names unique
 * If a pair of steps then misses the contrast rule only through rounding (D-049), one step is
 * nudged by up to 1 grade within all its tokens' ranges until the rule holds.
 * Then each ladder is checked: every token placed in range; rounded names unique; and the
 * contrast rule (D-049) on rounded names: pairs 37, 50 or 64 apart meet 3:1, 4.5:1 or 7:1 exactly.
 *
 * Each recipe is worked out at AA and at AAA, since the target moves the contrast zone (D-054,
 * US-02). Writes recipes.json: each recipe's answers, themes and, per target, steps (grade, L*, name, zone and the
 * uses that placed it, as theme, family and use), for the rules file (CLR-100). The default
 * recipe is the most common shape among the 27 design systems (prevalence.mjs, D-056).
 */
import { writeFileSync } from "node:fs";
import { LIGHT_PAGE, DARK_PAGE, rangeOf, theme, familyTokens, LIGHT, DARK } from "./model.mjs";

const MIN_GAP = 1; // grades between any two steps; about 1.2 L* near white, the stand-in for D-053's minimum gap

/** Grey uses each answer adds (D-055). Reading and a plain page are always on; controls are on by default. */
const ANSWER_USES = {
  read: ["page", "subtle border", "muted text", "text"],
  controls: ["hover", "pressed", "control border"],
  cards: ["surface"],
  overlays: ["sunken"],          // a second surface layer
  selection: ["selected"],
};

/** The beta recipes (D-054), as answers. */
const RECIPES = {
  "content-light": { answers: ["read", "controls"], themes: ["light"] },
  "content-light-dark": { answers: ["read", "controls"], themes: ["light", "dark"] },
  "simple-app-light-dark": { answers: ["read", "controls", "cards"], themes: ["light", "dark"] },
  "layered-app-light-dark": { answers: ["read", "controls", "cards", "overlays"], themes: ["light", "dark"] },
  "app-light": { answers: ["read", "controls", "cards", "overlays", "selection"], themes: ["light"] },
  "app-light-dark": { answers: ["read", "controls", "cards", "overlays", "selection"], themes: ["light", "dark"] },
};
export const DEFAULT_RECIPE = "layered-app-light-dark";
const FAMILIES = [["brand", false], ["error", false], ["warning", true], ["success", false], ["info", false]];

/** Preferred grade for a token: where practice or the rule says it should sit. */
function preferred(th, [name, kind, v], [lo, hi]) {
  if (kind === "page") return th.page;
  if (kind === "sep" || kind === "min") return th.page + th.sign * v;
  if (kind === "text") return th.page + th.sign * (th.page < 50 ? 91 : 89);
  if (name === "fill") return lo >= 50 ? lo : hi > 25 ? hi : 14; // white-text fills on their threshold; dark-text fills as light as allowed; a warning where yellows are most vivid
  return (lo + hi) / 2;                               // fill states mid-range
}

/** Places one recipe's ladder. Returns steps with their purposes, and any conflicts. */
function build(recipe, level) {
  const steps = [], conflicts = [];
  const themes = recipe.themes.map((t) => t === "light" ? theme("light", LIGHT_PAGE, LIGHT, level) : theme("dark", DARK_PAGE, DARK, level));
  const greyNames = recipe.answers.flatMap((a) => ANSWER_USES[a]);
  const groups = [];
  for (const th of themes) {
    groups.push({ th, family: "grey", tokens: th.grey.filter(([n]) => greyNames.includes(n)) });
    for (const [family, lightFill] of FAMILIES) groups.push({ th, family, tokens: familyTokens(th, lightFill, { fitFillToPage: true }) });
  }
  for (const { th, family, tokens } of groups) {
    const used = new Map(); // step → token name, within this family and theme
    const items = tokens.map((tok) => { const r = rangeOf(th.page, th.sign, tok[1], tok[2]); return { tok, r, pref: preferred(th, tok, r) }; })
      .sort((a, b) => a.r[1] - a.r[0] - (b.r[1] - b.r[0]) || a.r[1] - b.r[1]); // narrowest ranges first
    for (const { tok, r: [lo, hi], pref } of items) {
      const [name] = tok;
      const free = (s) => !used.has(s) || (family !== "grey" && name === "text" && used.get(s) === "fill");
      const options = steps.filter((s) => s.grade >= lo - 1e-9 && s.grade <= hi + 1e-9 && free(s))
        .sort((a, b) => Math.abs(a.grade - pref) - Math.abs(b.grade - pref));
      let step = options[0];
      if (!step) {
        const tries = [];
        for (let d = 0; d <= hi - lo + 1e-9; d += 0.1) tries.push(pref + d, pref - d);
        const g = tries.find((x) => x >= lo - 1e-9 && x <= hi + 1e-9 && steps.every((s) => Math.abs(s.grade - x) >= MIN_GAP - 1e-9));
        if (g === undefined) { conflicts.push(`${th.name} ${family} ${name}: no room in ${lo.toFixed(1)}–${hi.toFixed(1)}`); continue; }
        step = { grade: +g.toFixed(1), purposes: [] };
        steps.push(step);
      }
      used.set(step, name);
      (step.ranges ??= []).push([lo, hi]);
      step.purposes.push(`${th.name} ${family === "grey" ? "" : family + " "}${name}`);
      (step.uses ??= []).push({ theme: th.name, family, use: name });
    }
  }
  steps.sort((a, b) => a.grade - b.grade);
  repair(steps);
  return { steps, conflicts, themes };
}

/** Nudges steps so no pair misses the contrast rule only through rounding (D-049). */
function repair(steps) {
  for (let pass = 0; pass < 20 && check(steps).fails.length; pass++) {
    const [i, j] = firstFail(steps);
    for (const k of [j, i]) {
      const s = steps[k], start = s.grade;
      const ok = [];
      for (let d = 0.1; d <= 1.0001; d += 0.1) ok.push(start - d, start + d);
      const g = ok.find((x) => s.ranges.every(([lo, hi]) => x >= lo - 1e-9 && x <= hi + 1e-9)
        && steps.every((o) => o === s || Math.abs(o.grade - x) >= MIN_GAP - 1e-9)
        && (s.grade = +x.toFixed(1), check(steps).fails.length < check(steps.map((o) => o === s ? { ...o, grade: start } : o)).fails.length));
      if (g !== undefined) break;
      s.grade = start;
    }
  }
}

/** The indices of the first pair that misses the contrast rule. */
function firstFail(steps) {
  for (let i = 0; i < steps.length; i++) for (let j = i + 1; j < steps.length; j++) {
    const dn = Math.round(steps[j].grade) - Math.round(steps[i].grade), dg = steps[j].grade - steps[i].grade;
    if ([[37, 3], [50, 4.5], [64, 7]].some(([n, r]) => dn >= n && 21 ** (dg / 100) < r)) return [i, j];
  }
  return null;
}

const Y = (g) => 1.05 / 21 ** (g / 100) - 0.05;
const Lstar = (y) => (y > 216 / 24389 ? 116 * Math.cbrt(y) - 16 : (y * 24389) / 27);

/** Checks rounded names: unique, and the D-049 rule holds on exact values. */
function check(steps) {
  const names = steps.map((s) => Math.round(s.grade));
  const unique = new Set(names).size === names.length;
  const fails = [];
  for (let i = 0; i < steps.length; i++) for (let j = i + 1; j < steps.length; j++) {
    const dn = names[j] - names[i], dg = steps[j].grade - steps[i].grade;
    for (const [need, ratio] of [[37, 3], [50, 4.5], [64, 7]])
      if (dn >= need && 21 ** (dg / 100) < ratio) fails.push(`${names[i]} and ${names[j]}: ${(21 ** (dg / 100)).toFixed(2)}:1 < ${ratio}:1`);
  }
  const gapsL = steps.slice(1).map((s, i) => Lstar(Y(steps[i].grade)) - Lstar(Y(s.grade)));
  return { unique, fails, minGapL: Math.min(...gapsL) };
}

/** Zones by position: up to the furthest light background use, from the nearest dark one, and between. */
function zoneOf(step, steps) {
  const bg = /(page|surface|sunken|selected|hover|pressed|subtle border|tint)/;
  const lightEdge = Math.max(...steps.filter((s) => s.purposes.some((p) => p.startsWith("light") && bg.test(p) && !/fill/.test(p))).map((s) => s.grade));
  const darkBg = steps.filter((s) => s.purposes.some((p) => p.startsWith("dark") && bg.test(p) && !/fill/.test(p)));
  const darkEdge = darkBg.length ? Math.min(...darkBg.map((s) => s.grade)) : Infinity;
  return step.grade <= lightEdge ? "light background" : step.grade >= darkEdge ? "dark background" : "contrast";
}

const summary = [], out = { default: DEFAULT_RECIPE, minGapGrades: MIN_GAP, recipes: {} };
for (const [id, recipe] of Object.entries(RECIPES)) {
  out.recipes[id] = { answers: recipe.answers, themes: recipe.themes, ladders: {} };
  for (const level of ["aa", "aaa"]) {
    const { steps, conflicts } = build(recipe, level);
    const c = check(steps);
    console.log(`\n=== ${id}, ${level.toUpperCase()} (${recipe.answers.join(", ")}; ${recipe.themes.join(" and ")}) ===`);
    console.table(steps.map((s) => ({ name: Math.round(s.grade), grade: s.grade, "L*": +Lstar(Y(s.grade)).toFixed(1), zone: zoneOf(s, steps), purposes: s.purposes.join("; ") })));
    console.log(`conflicts: ${conflicts.length ? conflicts.join(" | ") : "none"} · names unique: ${c.unique ? "yes" : "no"} · contrast rule: ${c.fails.length ? c.fails.join(" | ") : "holds"} · smallest L* gap: ${c.minGapL.toFixed(1)}`);
    out.recipes[id].ladders[level] = steps.map((s) => ({
      name: Math.round(s.grade), grade: s.grade, lstar: +Lstar(Y(s.grade)).toFixed(2), zone: zoneOf(s, steps), uses: s.uses }));
    const z = (n) => steps.filter((s) => zoneOf(s, steps) === n).length;
    summary.push({ recipe: id, target: level.toUpperCase(), steps: steps.length, "light zone": z("light background"), contrast: z("contrast"), "dark zone": z("dark background"), "rule holds": c.fails.length === 0 && c.unique && conflicts.length === 0 });
  }
}
console.log("\nSummary (default: " + DEFAULT_RECIPE + "):"); console.table(summary);
writeFileSync(new URL("./recipes.json", import.meta.url), JSON.stringify(out, null, 1) + "\n");
