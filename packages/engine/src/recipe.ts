/**
 * @module recipe
 * Chooses the recipe for a person's answers at the ladder stage (D-054, D-056, CLR-100).
 *
 * The types here describe only the fields the choice needs, so the engine doesn't depend on the
 * rules package; `@colourist/rules` objects fit them as they are.
 */

/** How a choice is set when the person hasn't changed it. */
export type ChoiceDefault = 'always' | 'on' | 'off';

/** A choice, as far as choosing a recipe needs it. */
export interface RecipeChoice {
  id: string;
  default: ChoiceDefault;
  effects: {
    /** Ladder uses it adds. A choice that adds uses is an answer a recipe can cover. */
    addsUses?: readonly string[];
    /** Contexts it adds, such as a dark theme. These are covered by a recipe's themes. */
    addsContexts?: readonly string[];
  };
}

/** A recipe, as far as choosing one needs it. `L` is the targets it has ladders for. */
export interface RecipeOption<L extends string = string> {
  /** The choice IDs it covers that add uses, leaving out choices that are always on. */
  answers: readonly string[];
  /** The context IDs of the themes it builds for. */
  themes: readonly string[];
  /** Its ladder for each target. Only the number of steps is used, to break ties. */
  ladders: Readonly<Record<L, readonly unknown[]>>;
}

/** What {@link chooseRecipe} needs. `L` is the targets the recipes have ladders for. */
export interface RecipeQuestion<L extends string = string> {
  /** Every choice, from every question group. */
  choices: readonly RecipeChoice[];
  /** The recipes, keyed by ID. */
  recipes: Readonly<Record<string, RecipeOption<L>>>;
  /** The IDs of the choices the person has ticked. Choices that are always on count anyway. */
  ticked: readonly string[];
  /** The project's target, such as `aa`, which picks the ladder counted for ties (D-044). */
  level: L;
}

/** The recipe chosen, and anything it doesn't cover. */
export interface RecipeChoiceResult {
  /** The ID of the chosen recipe. */
  recipe: string;
  /** True when the recipe matches the answers and themes exactly. */
  exact: boolean;
  /**
   * The IDs of ticked choices the recipe doesn't cover, so the app can say so. Empty when it
   * covers them all.
   */
  uncovered: string[];
}

/**
 * Chooses a recipe for the ticked answers. In order of preference:
 * 1. the recipe that matches the answers and themes exactly
 * 2. the smallest recipe that covers them all
 * 3. the recipe that covers the most, with what it misses returned
 *
 * "Smallest" means fewest answers, then fewest themes, then fewest steps at the project's
 * target, then the ID in alphabetical order, so the choice is always the same for the same input.
 * Only choices that add uses or themes count towards coverage; a choice that only suggests a
 * target or widens separations doesn't choose a recipe.
 * @param question - the choices, the recipes, the ticked choice IDs and the project's target
 * @returns the chosen recipe's ID, whether it matched exactly, and the choices it doesn't cover
 * @throws {RangeError} when there are no recipes, or a ticked ID isn't a choice
 */
export function chooseRecipe<L extends string>(question: RecipeQuestion<L>): RecipeChoiceResult {
  const { choices, recipes, ticked, level } = question;
  const ids = Object.keys(recipes).sort();
  if (ids.length === 0) throw new RangeError('There are no recipes to choose from');

  const byId = new Map(choices.map((choice) => [choice.id, choice]));
  const active = new Set(choices.filter((choice) => choice.default === 'always').map((c) => c.id));
  for (const id of ticked) {
    if (!byId.has(id)) throw new RangeError(`"${id}" isn't a choice`);
    active.add(id);
  }

  // What the recipe has to cover: answers that add uses, and the themes the answers add.
  const answers = new Set<string>();
  const themes = new Map<string, string[]>();
  for (const id of active) {
    const choice = byId.get(id);
    if (!choice) continue;
    if (choice.default !== 'always' && (choice.effects.addsUses?.length ?? 0) > 0) answers.add(id);
    for (const context of choice.effects.addsContexts ?? []) {
      themes.set(context, [...(themes.get(context) ?? []), id]);
    }
  }

  const missing = (recipe: RecipeOption<L>): Set<string> => {
    const out = new Set([...answers].filter((answer) => !recipe.answers.includes(answer)));
    for (const [context, from] of themes) {
      if (!recipe.themes.includes(context)) for (const id of from) out.add(id);
    }
    return out;
  };
  const isExact = (recipe: RecipeOption<L>): boolean =>
    recipe.answers.length === answers.size &&
    recipe.themes.length === themes.size &&
    missing(recipe).size === 0;
  const size = (id: string): number[] => {
    const recipe = recipes[id] as RecipeOption<L>;
    return [recipe.answers.length, recipe.themes.length, recipe.ladders[level].length];
  };
  const smaller = (a: string, b: string): number => {
    const [sa, sb] = [size(a), size(b)];
    for (let i = 0; i < sa.length; i++) {
      const d = (sa[i] as number) - (sb[i] as number);
      if (d !== 0) return d;
    }
    return a < b ? -1 : a > b ? 1 : 0;
  };

  const exact = ids.find((id) => isExact(recipes[id] as RecipeOption<L>));
  if (exact !== undefined) return { recipe: exact, exact: true, uncovered: [] };

  // Covering everything is a missing count of zero, so one ordering handles steps 2 and 3.
  const [best] = [...ids].sort(
    (a, b) =>
      missing(recipes[a] as RecipeOption<L>).size - missing(recipes[b] as RecipeOption<L>).size ||
      smaller(a, b),
  );
  const chosen = best as string;
  const uncovered = [...missing(recipes[chosen] as RecipeOption<L>)].sort();
  return { recipe: chosen, exact: false, uncovered };
}
