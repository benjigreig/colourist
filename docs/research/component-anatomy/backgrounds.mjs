/**
 * CLR-27: does a legibility token chosen for the page still pass on the backgrounds above it?
 *
 * Found while mocking up the test pattern (CLR-94, 2 November 2026). The mock-ups used the default
 * recipe's AA ladder (D-056). This script repeats that check from the ladder alone, so the figures
 * can be re-run when the mapping is retested properly.
 *
 * For each theme and each use (muted text, links, icons, control borders), it compares two mappings:
 *   - page-based: one step, chosen against the page, used on every background
 *   - per background: the step nearest each background that still meets the target
 *
 * Contrast comes from grades alone (D-049): two colours g grades apart have a ratio of 21^(g/100),
 * so no colour values are needed. Run: node backgrounds.mjs  Output: backgrounds.txt
 */
import { readFileSync } from "node:fs";

// ---- Configuration: what the mock-ups used ----------------------------------------------------

/** The ladder: the default recipe's AA steps, from the recipe research. */
const RECIPES_FILE = new URL("../ladder-derivation/recipes.json", import.meta.url);

/**
 * Each theme's backgrounds, as ladder step names, and which way its text goes (+1 darker, -1 lighter).
 * The tint isn't a fixed step: it's the step nearest to `tintGap` grades from the page, the same
 * gap the mock-ups used for hover, because tints and hover share a step.
 */
const THEMES = {
  light: { direction: +1, backgrounds: { page: 0, card: 2, overlay: 0 }, tintGap: 3.4 },
  dark: { direction: -1, backgrounds: { page: 95, card: 91, overlay: 88 }, tintGap: 9.6 },
};

/** Each use's target, as the grade gap that gives it (D-049): 50 grades is 4.5:1, 37 is 3:1. */
const USES = {
  "muted text": { gap: 50, ratio: 4.5 },
  link: { gap: 50, ratio: 4.5 },
  icon: { gap: 37, ratio: 3 },
  "control border": { gap: 37, ratio: 3 },
};

// ---- Logic -------------------------------------------------------------------------------------

/**
 * Read the default recipe's AA ladder.
 * @returns {{name: string, grade: number}[]} The ladder's steps, lightest first. A step's name is its grade, rounded.
 */
function loadLadder() {
  const recipes = JSON.parse(readFileSync(RECIPES_FILE, "utf8"));
  return recipes.recipes[recipes.default].ladders.aa.map(({ name, grade }) => ({ name, grade }));
}

/**
 * Contrast ratio between two grades (D-049).
 * @param {number} a A grade.
 * @param {number} b Another grade.
 * @returns {number} The WCAG 2 contrast ratio.
 */
const contrast = (a, b) => 21 ** (Math.abs(a - b) / 100);

/**
 * The step nearest a background that is at least `gap` grades from it, in the text's direction.
 * Grades are exact, not the rounded names, so a step named 50 grades away may fall just short.
 * @param {{name: string, grade: number}[]} ladder The ladder's steps.
 * @param {{name: string, grade: number}} background The background's step.
 * @param {number} gap The minimum grade gap.
 * @param {number} direction +1 for darker, -1 for lighter.
 * @returns {{name: string, grade: number}|null} The step, or null if none is far enough away.
 */
function nearestPassing(ladder, background, gap, direction) {
  const distance = (step) => Math.abs(step.grade - background.grade);
  const passing = ladder.filter((step) => direction * (step.grade - background.grade) >= gap);
  if (passing.length === 0) return null;
  return passing.reduce((best, step) => (distance(step) < distance(best) ? step : best));
}

/**
 * The step whose gap from a background is closest to `gap`, in the text's direction, at least 1 grade.
 * Used for the tint, which is a small separation rather than a contrast target.
 * @param {{name: string, grade: number}[]} ladder The ladder's steps.
 * @param {{name: string, grade: number}} background The background's step.
 * @param {number} gap The wanted grade gap.
 * @param {number} direction +1 for darker, -1 for lighter.
 * @returns {{name: string, grade: number}} The step.
 */
function nearestGap(ladder, background, gap, direction) {
  const miss = (step) => Math.abs(Math.abs(step.grade - background.grade) - gap);
  const candidates = ladder.filter((step) => direction * (step.grade - background.grade) >= 1);
  return candidates.reduce((best, step) => (miss(step) < miss(best) ? step : best));
}

/**
 * Look up a step by name.
 * @param {{name: string, grade: number}[]} ladder The ladder's steps.
 * @param {string|number} name The step's name.
 * @returns {{name: string, grade: number}} The step.
 * @throws {Error} If the ladder has no step of that name, so a changed ladder can't pass silently.
 */
function stepNamed(ladder, name) {
  const step = ladder.find((s) => String(s.name) === String(name));
  if (!step) throw new Error(`No step named ${name} in the ladder`);
  return step;
}

// ---- Report ------------------------------------------------------------------------------------

const ladder = loadLadder();
const fmt = (r, target) => `${r.toFixed(2)}:1 ${r >= target ? "pass" : "FAIL"}`;
const lines = [`Ladder: default recipe, AA, ${ladder.length} steps (name = grade): ${ladder.map((s) => `${s.name}=${s.grade}`).join(" ")}`];

for (const [themeName, theme] of Object.entries(THEMES)) {
  const backgrounds = Object.fromEntries(
    Object.entries(theme.backgrounds).map(([bgName, stepName]) => [bgName, stepNamed(ladder, stepName)]));
  const page = backgrounds.page;
  backgrounds.tint = nearestGap(ladder, page, theme.tintGap, theme.direction);
  lines.push("", `== ${themeName} ==  backgrounds: ${Object.entries(backgrounds).map(([n, s]) => `${n} ${s.name}`).join(", ")}`);

  for (const [useName, use] of Object.entries(USES)) {
    // Page-based: the step chosen against the page, then used everywhere.
    const pageStep = nearestPassing(ladder, page, use.gap, theme.direction);
    lines.push(`  ${useName} (target ${use.ratio}:1), page-based step ${pageStep.name}`);
    for (const [bgName, bg] of Object.entries(backgrounds)) {
      const ownStep = nearestPassing(ladder, bg, use.gap, theme.direction);
      lines.push(
        `    on ${bgName.padEnd(8)} page-based ${fmt(contrast(pageStep.grade, bg.grade), use.ratio).padEnd(14)}` +
          `per background: step ${ownStep.name}, ${fmt(contrast(ownStep.grade, bg.grade), use.ratio)}`);
    }
  }
}

console.log(lines.join("\n"));
