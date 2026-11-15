import { exampleBrands, kerfwell, doggly, sorrel } from '@colourist/examples';
import { defaultRules as rules, type Level } from '@colourist/rules';
import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import {
  CHROMA_STAND_IN,
  coordinatesOf,
  generateScales,
  groupSettings,
  hueDifference,
  isInGamut,
  parseHex,
  relativeLuminance,
  srgbToXyz,
  type Palette,
  type ScaleColor,
} from '../src/index.ts';

const LEVELS: Level[] = ['aa', 'aaa'];
const ladders = Object.entries(rules.recipes.items).flatMap(([id, recipe]) =>
  LEVELS.map((level) => ({ label: `${id} ${level}`, steps: recipe.ladders[level] })),
);
const defaultLadder = rules.recipes.items[rules.recipes.default]?.ladders.aa ?? [];
const groups = groupSettings(rules.vividness.defaults);
const maxDrift = rules.hue.maxDrift.hueDifference;

const build = (colors: readonly ScaleColor[], ladder = defaultLadder): Palette =>
  generateScales({ colors, groups, ladder, maxDrift });

/** Any valid hex colour. */
const anyHex = fc
  .integer({ min: 0, max: 0xffffff })
  .map((v) => `#${v.toString(16).padStart(6, '0')}`);
/** Two to four brand colours, on any recipe's ladder at either target. */
const anyPalette = fc.record({
  hexes: fc.array(anyHex, { minLength: 2, maxLength: 4 }),
  ladder: fc.constantFrom(...ladders),
});
const asColors = (hexes: string[]): ScaleColor[] =>
  hexes.map((value, i) => ({ id: `c${i}`, name: `Colour ${i}`, group: 'brand', value }));

/** WCAG 2 contrast between two exact colours. */
const contrast = (a: { rgb: Parameters<typeof relativeLuminance>[0] }, b: typeof a): number => {
  const [ya, yb] = [relativeLuminance(a.rgb), relativeLuminance(b.rgb)];
  return (Math.max(ya, yb) + 0.05) / (Math.min(ya, yb) + 0.05);
};

describe('scales from several brand colours', () => {
  it('US-02: One ladder for every colour — every family has the same steps, at the ladder L*', () => {
    fc.assert(
      fc.property(anyPalette, ({ hexes, ladder }) => {
        const { families } = build(asColors(hexes), ladder.steps);
        for (const family of families) {
          expect(family.steps.map((s) => s.name)).toEqual(ladder.steps.map((s) => s.name));
          family.steps.forEach((step, i) => {
            const target = ladder.steps[i]?.lstar as number;
            // L* within D-047's tolerance, measured from the exact colour.
            expect(Math.abs(coordinatesOf(srgbToXyz(step.rgb)).lightness - target)).toBeLessThan(
              1e-6,
            );
            expect(isInGamut(step.rgb)).toBe(true);
          });
        }
      }),
      { numRuns: 40 },
    );
  });

  it("US-03: Hue held across the scale — every step keeps the source's hue, and drift after rounding stays within the rules", () => {
    fc.assert(
      fc.property(anyPalette, ({ hexes, ladder }) => {
        for (const family of build(asColors(hexes), ladder.steps).families) {
          const hue = family.source.oklch.h;
          for (const step of family.steps) {
            const { c, h } = coordinatesOf(srgbToXyz(step.rgb));
            // Hue as a chroma-weighted difference, so near-grey steps, where an angle is mostly
            // floating-point noise, are judged by what can be seen (D-065).
            if (hue !== null && h !== null) {
              const angle = (Math.abs(hueDifference(hue, h)) * Math.PI) / 180;
              expect(2 * c * Math.sin(angle / 2)).toBeLessThan(1e-9);
            }
          }
          expect(family.drift.withinThreshold, family.color.value).toBe(true);
          expect(family.drift.hueDifference ?? 0).toBeLessThanOrEqual(maxDrift);
        }
      }),
      { numRuns: 40 },
    );
  });

  it('US-02: Contrast rule holds on every recipe — between families, on exact values', () => {
    const rule = rules.ladders.zones.contrast.gradesFromEachPage.map((grades, i) => ({
      grades,
      ratio: [3, 4.5, 7][i] as number,
    }));
    fc.assert(
      fc.property(anyPalette, ({ hexes, ladder }) => {
        const families = build(asColors(hexes), ladder.steps).families;
        for (const a of families) {
          for (const b of families) {
            for (const [i, sa] of a.steps.entries()) {
              for (const sb of b.steps.slice(i + 1)) {
                for (const { grades, ratio } of rule) {
                  if (sb.name - sa.name >= grades)
                    expect(contrast(sa, sb)).toBeGreaterThanOrEqual(ratio);
                }
              }
            }
          }
        }
      }),
      { numRuns: 25 },
    );
  });

  it('US-02: Brand colours placed on the ladder — each source is beside its nearest step, with the difference', () => {
    fc.assert(
      fc.property(anyPalette, ({ hexes, ladder }) => {
        for (const family of build(asColors(hexes), ladder.steps).families) {
          const { step, grades, deltaE } = family.placement;
          const placed = family.steps.find((s) => s.name === step);
          expect(placed).toBeDefined();
          expect(grades).toBeCloseTo(family.source.grade - (placed?.grade ?? 0), 9);
          for (const other of family.steps) {
            expect(Math.abs(grades)).toBeLessThanOrEqual(
              Math.abs(family.source.grade - other.grade) + 1e-9,
            );
          }
          expect(deltaE).toBeGreaterThanOrEqual(0);
        }
      }),
      { numRuns: 40 },
    );
  });

  it('CLR-14: Colours can be grouped, and groups carry their own settings — reported, not yet applied', () => {
    const colors: ScaleColor[] = [
      { id: 'a', name: 'A', group: 'brand', value: '#1b998b' },
      { id: 'b', name: 'B', group: 'feedback', value: '#c4362b' },
      { id: 'c', name: 'C', group: 'brand', value: '#53599a' },
    ];
    const withOverride = groupSettings(rules.vividness.defaults, { brand: { vividness: 'other' } });
    const palette = generateScales({
      colors,
      groups: withOverride,
      ladder: defaultLadder,
      maxDrift,
    });
    expect(palette.groups).toEqual([
      { id: 'brand', settings: { vividness: 'other' }, colors: ['a', 'c'] },
      { id: 'feedback', settings: { vividness: 'hold' }, colors: ['b'] },
    ]);
    // Settings don't change the steps until vividness is applied (CLR-15).
    expect(palette.families.map((f) => f.steps)).toEqual(
      build(colors).families.map((f) => f.steps),
    );
    for (const family of palette.families) expect(family.chroma.placeholder).toBe(CHROMA_STAND_IN);
  });

  it("CLR-14: A colour's role is carried, never acted on (D-025)", () => {
    fc.assert(
      fc.property(
        anyHex,
        fc.constantFrom('primary', 'secondary', 'tertiary', undefined),
        (value, role) => {
          const color: ScaleColor = {
            id: 'x',
            name: 'X',
            group: 'brand',
            value,
            ...(role ? { role } : {}),
          };
          const [family] = build([color]).families;
          expect(family?.color).toEqual(color);
          expect(family?.steps).toEqual(
            build([{ id: 'x', name: 'X', group: 'brand', value }]).families[0]?.steps,
          );
        },
      ),
      { numRuns: 20 },
    );
  });

  it('CLR-14: Refuses colours it can’t build', () => {
    const ok: ScaleColor = { id: 'a', name: 'A', group: 'brand', value: '#123456' };
    expect(() => build([{ ...ok, value: 'blue' }])).toThrow(RangeError);
    expect(() => build([{ ...ok, group: 'nope' }])).toThrow(RangeError);
    expect(() => build([ok, ok])).toThrow(RangeError);
    expect(() => build([ok], [])).toThrow(RangeError);
    expect(() => build([ok], [...defaultLadder].reverse())).toThrow(RangeError);
    expect(() =>
      generateScales({ colors: [ok], groups, ladder: defaultLadder, maxDrift: -1 }),
    ).toThrow(RangeError);
  });

  it('CLR-14: A true grey has no hue and no drift; a near-grey keeps its hue (D-064)', () => {
    const [grey, nearGrey] = build(asColors(['#777777', '#787777'])).families;
    expect(grey?.source.oklch.h).toBeNull();
    expect(grey?.drift).toMatchObject({
      hueDifference: null,
      degrees: null,
      withinThreshold: true,
    });
    expect(nearGrey?.source.oklch.h).not.toBeNull();
  });
});

/** The worst drift on the default recipe's AA ladder, from docs/research/hue-drift/drift.txt. */
const RESEARCH: Record<string, { degrees: number; hueDifference: number }> = {
  verdigris: { degrees: 1.29, hueDifference: 0.0012 },
  neonPink: { degrees: 3.63, hueDifference: 0.0011 },
  dustyGrape: { degrees: 1.84, hueDifference: 0.001 },
  tangerineDream: { degrees: 5.38, hueDifference: 0.0011 },
  brickRed: { degrees: 7.3, hueDifference: 0.0012 },
  airForceBlue: { degrees: 1.46, hueDifference: 0.001 },
  monoDark: { degrees: 19.13, hueDifference: 0.0009 },
  monoLight: { degrees: 8.81, hueDifference: 0.001 },
  pinkMist: { degrees: 2.07, hueDifference: 0.0009 },
  sageGreen: { degrees: 0.55, hueDifference: 0.0005 },
  mutedOlive: { degrees: 0.33, hueDifference: 0.0005 },
  pinkOrchid: { degrees: 1.87, hueDifference: 0.0011 },
  petalFrost: { degrees: 1.7, hueDifference: 0.0009 },
};

describe('the example brands', () => {
  it('CLR-14: Example brands for "Try an example" (US-01) — three invented brands, every colour a valid hex brand colour with a role', () => {
    expect(exampleBrands.map((b) => b.name)).toEqual(['Doggly', 'Kerfwell', 'Sorrel']);
    for (const brand of exampleBrands) {
      for (const color of brand.colors) {
        expect(parseHex(color.value), color.name).not.toBeNull();
        expect(color.group).toBe('brand');
      }
      // Each builds without error, keeping every value exactly as supplied.
      const { families } = build(brand.colors);
      expect(families.map((f) => f.color.value)).toEqual(brand.colors.map((c) => c.value));
    }
  });

  it.each(exampleBrands.flatMap((b) => b.colors.map((c) => [`${b.name} ${c.name}`, c] as const)))(
    'US-03: Hue held across the scale — %s matches the hue drift research',
    (_, color) => {
      const [family] = build([color]).families;
      const expected = RESEARCH[color.id];
      expect(expected).toBeDefined();
      expect(family?.drift.hueDifference).toBeCloseTo(expected?.hueDifference ?? NaN, 4);
      expect(family?.drift.degrees).toBeCloseTo(expected?.degrees ?? NaN, 1);
      expect(family?.drift.withinThreshold).toBe(true);
    },
  );

  it('US-03: Hue held across the scale — Neon pink has its chroma reduced at several steps', () => {
    const neonPink = build(doggly.colors).families.find((f) => f.color.id === 'neonPink');
    const reduced = neonPink?.steps.filter((s) => s.reduced) ?? [];
    expect(reduced.length).toBeGreaterThan(10);
    for (const step of reduced) expect(step.chroma).toBeLessThan(step.requestedChroma);
  });

  it("US-03: Hue held across the scale — Kerfwell's Mono light keeps its faint pink hue (D-064)", () => {
    const families = build(kerfwell.colors).families;
    const monoLight = families.find((f) => f.color.id === 'monoLight');
    expect(monoLight?.source.oklch.h).toBeCloseTo(354.8, 1);
    expect(monoLight?.source.oklch.c).toBeGreaterThan(0.005);
    // Its tinted steps lean pink, not grey: every step that still has chroma keeps the hue.
    const tinted = monoLight?.steps.filter((s) => coordinatesOf(srgbToXyz(s.rgb)).c > 1e-4) ?? [];
    expect(tinted.length).toBeGreaterThan(10);
    for (const step of tinted) {
      expect(
        Math.abs(hueDifference(354.8, coordinatesOf(srgbToXyz(step.rgb)).h ?? 0)),
      ).toBeLessThan(0.1);
    }
    // Mono dark keeps its hue too, rather than being treated as grey.
    expect(families.find((f) => f.color.id === 'monoDark')?.source.oklch.h).not.toBeNull();
  });

  it('US-02: Brand colours placed on the ladder — Sorrel’s light colours land near the top of the ladder', () => {
    const placed = Object.fromEntries(
      build(sorrel.colors).families.map((f) => [f.color.id, f.placement]),
    );
    expect(placed.petalFrost?.step).toBeLessThan(placed.pinkMist?.step ?? 0);
    for (const placement of Object.values(placed))
      expect(placement.deltaE).toBeGreaterThanOrEqual(0);
  });
});
