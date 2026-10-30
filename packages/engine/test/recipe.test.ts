import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { chooseRecipe, type RecipeChoice, type RecipeOption } from '../src/index.ts';

const CRITERION =
  'CLR-100: Choosing a recipe — an exact match, else the smallest that covers, else the most';

const steps = (n: number): unknown[] => Array.from({ length: n });

const choices: RecipeChoice[] = [
  { id: 'read', default: 'always', effects: { addsUses: ['text'] } },
  { id: 'controls', default: 'on', effects: { addsUses: ['hover'] } },
  { id: 'cards', default: 'off', effects: { addsUses: ['surface'] } },
  { id: 'selection', default: 'off', effects: { addsUses: ['selected'] } },
  { id: 'light', default: 'on', effects: { addsContexts: ['light'] } },
  { id: 'dark', default: 'off', effects: { addsContexts: ['dark'] } },
  { id: 'device', default: 'off', effects: { addsContexts: ['light', 'dark'] } },
  { id: 'moreContrast', default: 'off', effects: {} },
];

const recipes: Record<string, RecipeOption> = {
  content: { answers: ['controls'], themes: ['light'], ladders: { aa: steps(10) } },
  contentDark: { answers: ['controls'], themes: ['light', 'dark'], ladders: { aa: steps(16) } },
  cardsDark: {
    answers: ['controls', 'cards'],
    themes: ['light', 'dark'],
    ladders: { aa: steps(18) },
  },
  // Same size as cardsDark except for steps, to show steps break the tie.
  cardsDarkBig: {
    answers: ['controls', 'cards'],
    themes: ['light', 'dark'],
    ladders: { aa: steps(30) },
  },
};

const choose = (ticked: string[]) => chooseRecipe({ choices, recipes, ticked, level: 'aa' });

describe('choosing a recipe', () => {
  it(`${CRITERION} — an exact match wins`, () => {
    expect(choose(['controls', 'light'])).toEqual({
      recipe: 'content',
      exact: true,
      uncovered: [],
    });
    expect(choose(['controls', 'light', 'dark'])).toEqual({
      recipe: 'contentDark',
      exact: true,
      uncovered: [],
    });
  });

  it(`${CRITERION} — following the device adds both themes`, () => {
    expect(choose(['controls', 'device'])).toMatchObject({ recipe: 'contentDark', exact: true });
  });

  it(`${CRITERION} — otherwise the smallest recipe that covers everything`, () => {
    // Only a dark theme: no recipe is dark only, so the smallest with dark covers it.
    expect(choose(['controls', 'dark'])).toEqual({
      recipe: 'contentDark',
      exact: false,
      uncovered: [],
    });
    // Cards in light only: both cards recipes cover it; the one with fewer steps wins.
    expect(choose(['controls', 'cards', 'light'])).toEqual({
      recipe: 'cardsDark',
      exact: false,
      uncovered: [],
    });
  });

  it(`${CRITERION} — otherwise the one covering the most, saying what it misses`, () => {
    expect(choose(['controls', 'cards', 'selection', 'light'])).toEqual({
      recipe: 'cardsDark',
      exact: false,
      uncovered: ['selection'],
    });
  });

  it(`${CRITERION} — choices that add no uses or themes don't change the recipe`, () => {
    expect(choose(['controls', 'light', 'moreContrast'])).toEqual(choose(['controls', 'light']));
  });

  it(`${CRITERION} — refuses unknown choices and empty recipes`, () => {
    expect(() => choose(['nope'])).toThrow(RangeError);
    expect(() => chooseRecipe({ choices, recipes: {}, ticked: [], level: 'aa' })).toThrow(
      RangeError,
    );
  });

  it(`${CRITERION} — the same answers always choose the same recipe, in any order`, () => {
    const ids = choices.map((choice) => choice.id);
    fc.assert(
      fc.property(fc.subarray(ids), fc.integer({ min: 0, max: 1000 }), (ticked, seed) => {
        const shuffled = [...ticked].sort(
          (a, b) => ((a.charCodeAt(0) * seed) % 7) - ((b.charCodeAt(0) * seed) % 7),
        );
        const result = choose(ticked);
        expect(choose(shuffled)).toEqual(result);
        // Whatever is chosen, it only reports choices that were ticked.
        for (const id of result.uncovered) expect(ticked).toContain(id);
        if (result.exact) expect(result.uncovered).toEqual([]);
      }),
    );
  });
});
