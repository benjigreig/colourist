import { chooseRecipe, contrastGrade, gradesForRatio, yFromLstar } from '@colourist/engine';
import { describe, expect, it } from 'vitest';
import { defaultRules as rules, type LadderStep, type Level } from '../src/index.ts';

const COVERS = 'CLR-100: The integrity tests cover the recipes, questions and zones';
const LEVELS: Level[] = ['aa', 'aaa'];
const choices = rules.questions.flatMap((group) => group.choices);
const recipes = Object.entries(rules.recipes.items);

/** Every recipe's ladder at both targets, with a label for failure messages. */
const ladders: [string, LadderStep[]][] = recipes.flatMap(([id, recipe]) =>
  LEVELS.map((level): [string, LadderStep[]] => [`${id} ${level}`, recipe.ladders[level]]),
);

/** WCAG 2 contrast between two steps, from their exact L*. */
function ratio(a: LadderStep, b: LadderStep): number {
  const [ya, yb] = [yFromLstar(a.lstar), yFromLstar(b.lstar)];
  return (Math.max(ya, yb) + 0.05) / (Math.min(ya, yb) + 0.05);
}

describe('recipes and questions', () => {
  it(`${COVERS} — the questions are the three D-055 groups, in order, with unique choices`, () => {
    expect(rules.questions.map((group) => group.id)).toEqual([
      'activities',
      'structure',
      'viewing',
    ]);
    const ids = choices.map((choice) => choice.id);
    expect(new Set(ids).size).toBe(ids.length);
    // Only choices held for after the beta carry `later`, and they're never on by default.
    for (const choice of choices.filter((c) => c.later))
      expect(choice.default, choice.id).toBe('off');
    expect(
      choices
        .filter((c) => c.later)
        .map((c) => c.id)
        .sort(),
    ).toEqual(['brightLight', 'charts', 'highContrast']);
  });

  it(`${COVERS} — every effect refers to a real use, context or zone`, () => {
    for (const { id, effects } of choices) {
      for (const use of effects.addsUses ?? [])
        expect(Object.keys(rules.ladders.uses), id).toContain(use);
      for (const context of effects.addsContexts ?? []) {
        expect(Object.keys(rules.contrast.contexts), id).toContain(context);
      }
      for (const zone of Object.keys(effects.separationMultipliers ?? {})) {
        expect(Object.keys(rules.ladders.zones), id).toContain(zone);
      }
    }
    for (const [id, use] of Object.entries(rules.ladders.uses)) {
      if (use.contrastUse) expect(Object.keys(rules.contrast.uses), id).toContain(use.contrastUse);
    }
  });

  it(`${COVERS} — every recipe's answers refer to real choices, and its themes to real contexts`, () => {
    const answerable = choices.filter(
      (c) => c.default !== 'always' && (c.effects.addsUses?.length ?? 0) > 0,
    );
    for (const [id, recipe] of recipes) {
      for (const answer of recipe.answers) {
        expect(
          answerable.map((c) => c.id),
          id,
        ).toContain(answer);
      }
      for (const theme of recipe.themes)
        expect(Object.keys(rules.contrast.contexts), id).toContain(theme);
    }
  });

  it(`${COVERS} — the default recipe exists, and the default answers choose it`, () => {
    expect(Object.keys(rules.recipes.items)).toContain(rules.recipes.default);
    const ticked = choices.filter((c) => c.default === 'on').map((c) => c.id);
    for (const level of LEVELS) {
      expect(chooseRecipe({ choices, recipes: rules.recipes.items, ticked, level })).toEqual({
        recipe: rules.recipes.default,
        exact: true,
        uncovered: [],
      });
    }
  });

  it(`${COVERS} — each recipe is chosen by exactly its own answers`, () => {
    for (const [id, recipe] of recipes) {
      const ticked = [
        ...recipe.answers,
        ...choices
          .filter((c) => c.effects.addsContexts?.length === 1)
          .filter((c) => recipe.themes.includes(c.effects.addsContexts?.[0] ?? ''))
          .map((c) => c.id),
      ];
      expect(
        chooseRecipe({ choices, recipes: rules.recipes.items, ticked, level: 'aa' }),
        id,
      ).toEqual({ recipe: id, exact: true, uncovered: [] });
    }
  });

  it(`${COVERS} — every recipe's steps serve the uses its answers add, in each of its themes`, () => {
    for (const [id, recipe] of recipes) {
      const active = choices.filter((c) => c.default === 'always' || recipe.answers.includes(c.id));
      const needed = active.flatMap((c) => c.effects.addsUses ?? []);
      for (const level of LEVELS) {
        const placed = recipe.ladders[level].flatMap((step) =>
          step.uses.filter((u) => u.family === 'neutral').map((u) => `${u.theme}/${u.use}`),
        );
        for (const theme of recipe.themes) {
          for (const use of needed) expect(placed, `${id} ${level}`).toContain(`${theme}/${use}`);
        }
      }
    }
  });
});

describe('recipe ladders', () => {
  it.each(ladders)(
    'US-02: Every step has a reason — %s: a zone and at least one real use',
    (_, steps) => {
      const families = [...Object.keys(rules.palettePresets), ...Object.keys(rules.groups)];
      for (const step of steps) {
        expect(Object.keys(rules.ladders.zones)).toContain(step.zone);
        expect(step.uses.length).toBeGreaterThan(0);
        for (const use of step.uses) {
          expect(Object.keys(rules.ladders.uses)).toContain(use.use);
          expect(Object.keys(rules.contrast.contexts)).toContain(use.theme);
          expect(families).toContain(use.family);
        }
      }
    },
  );

  it.each(ladders)(
    `${COVERS} — %s: names are unique rounded grades that match each step's L*`,
    (_, steps) => {
      const names = steps.map((step) => step.name);
      expect(new Set(names).size).toBe(names.length);
      for (const step of steps) {
        expect(step.name).toBe(Math.round(step.grade));
        // The copied values are rounded: L* to 2 places and grades to 1.
        expect(Math.abs(contrastGrade(yFromLstar(step.lstar)) - step.grade)).toBeLessThan(0.06);
      }
    },
  );

  it.each(ladders)(
    `${COVERS} — %s: light to dark, zones in order, at least the minimum gap apart`,
    (_, steps) => {
      const order = ['lightBackground', 'contrast', 'darkBackground'];
      steps.forEach((step, i) => {
        const previous = steps[i - 1];
        if (!previous) return;
        expect(step.lstar).toBeLessThan(previous.lstar);
        expect(order.indexOf(step.zone)).toBeGreaterThanOrEqual(order.indexOf(previous.zone));
        // The model keeps 1 grade between steps; the copied grades are rounded to 1 place.
        expect(step.grade - previous.grade).toBeGreaterThanOrEqual(
          rules.ladders.minimumGap.grades - 0.05,
        );
      });
      // Pages are steps (D-056).
      expect(steps[0]?.uses.some((u) => u.use === 'page')).toBe(true);
    },
  );

  it.each(ladders)(
    'US-02: Contrast rule holds on every recipe — %s: names 37, 50 or 64 apart reach 3:1, 4.5:1 or 7:1 on exact values',
    (_, steps) => {
      const rule = rules.ladders.zones.contrast.gradesFromEachPage.map((grades, i) => ({
        grades,
        ratio: [3, 4.5, 7][i] as number,
      }));
      // The thresholds are the WCAG ratios as grades, rounded up (D-049).
      for (const { grades, ratio: r } of rule) expect(grades).toBe(Math.ceil(gradesForRatio(r)));
      for (const [i, a] of steps.entries()) {
        for (const b of steps.slice(i + 1)) {
          for (const { grades, ratio: r } of rule) {
            if (b.name - a.name >= grades) {
              expect(ratio(a, b), `${a.name} and ${b.name}`).toBeGreaterThanOrEqual(r);
            }
          }
        }
      }
    },
  );
});
