/**
 * Writes vividness-tuner.json: every step of every example colour as the Vividness Tuner computes
 * it, to check the engine applies recovery and ceiling the same way (CLR-15, D-069).
 *
 * The Tuner (docs/research/vividness-tuner/index.html) reimplements the method in plain JS. This
 * script runs its own colour maths, unchanged, on the rules' ladders, so a difference between the
 * two is a difference in method rather than in the ladder's rounding. Run it again whenever the
 * Tuner's maths, the ladders or the example brands change:
 *
 *   node packages/engine/test/fixtures/generate-vividness-tuner.ts
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { exampleBrands } from '@colourist/examples';
import { defaultRules as rules } from '@colourist/rules';

/** The Tuner functions this script uses, as the page defines them. */
interface TunerMaths {
  hexToOklab: (hex: string) => [number, number, number];
  maxChroma: (lstar: number, hueDeg: number) => number;
  stepChroma: (
    source: number,
    maximum: number,
    recovery: number,
    ceiling: number,
  ) => { chroma: number; limit: 'recovery' | 'ceiling' | 'gamut' | 'none' };
  solveAtLstar: (lstar: number, chroma: number, hueDeg: number) => [number, number, number];
  oklabToHex: (lab: [number, number, number]) => string;
}

const page = readFileSync(
  new URL('../../../../docs/research/vividness-tuner/index.html', import.meta.url),
  'utf8',
);
// The colour maths sit between these two section headings, with nothing from the page in them.
const start = page.indexOf('// CSS Color 4 matrices');
const end = page.indexOf(' * Model: each family');
if (start < 0 || end < start)
  throw new Error('The Tuner page has changed shape; update this script');
const maths = page.slice(start, page.lastIndexOf('/*', end));
const tuner = new Function(
  `${maths}\nreturn { hexToOklab, maxChroma, stepChroma, solveAtLstar, oklabToHex };`,
)() as TunerMaths;

/** The settings checked: the brief's 0.5 recovery with no cap, and one where the ceiling binds. */
const SETTINGS = [
  { recovery: 0.5, ceiling: 1, ladders: 'all' },
  { recovery: 0.5, ceiling: 0.8, ladders: 'default' },
] as const;

const colors = exampleBrands.flatMap((brand) => brand.colors);
const cases = SETTINGS.flatMap(({ recovery, ceiling, ladders }) =>
  Object.entries(rules.recipes.items)
    .filter(([id]) => ladders === 'all' || id === rules.recipes.default)
    .flatMap(([id, recipe]) =>
      (['aa', 'aaa'] as const).map((level) => ({
        recovery,
        ceiling,
        recipe: id,
        level,
        families: Object.fromEntries(
          colors.map((color) => {
            const lab = tuner.hexToOklab(color.value);
            const chroma = Math.hypot(lab[1], lab[2]);
            const hue = ((Math.atan2(lab[2], lab[1]) * 180) / Math.PI + 360) % 360;
            const steps = recipe.ladders[level].map((step) => {
              const max = tuner.maxChroma(step.lstar, hue);
              const out = tuner.stepChroma(chroma, max, recovery, ceiling);
              return [tuner.oklabToHex(tuner.solveAtLstar(step.lstar, out.chroma, hue)), out.limit];
            });
            return [color.id, steps];
          }),
        ),
      })),
    ),
);

writeFileSync(
  new URL('vividness-tuner.json', import.meta.url),
  // One case per line, for readable diffs.
  `{"source":"docs/research/vividness-tuner/index.html","cases":[\n${cases.map((c) => JSON.stringify(c)).join(',\n')}\n]}\n`,
);
