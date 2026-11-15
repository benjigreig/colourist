import { exampleBrands, kerfwell, doggly, sorrel } from '@colourist/examples';
import { defaultRules as rules, type Level } from '@colourist/rules';
import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import tuner from './fixtures/vividness-tuner.json' with { type: 'json' };
import {
  coordinatesOf,
  formatHex,
  generateScales,
  groupSettings,
  hueDifference,
  isInGamut,
  parseHex,
  relativeLuminance,
  srgbToXyz,
  mapToGamut,
  type GroupSettings,
  type Rgb,
  type Palette,
  type ScaleColor,
  type ScaleLadderStep,
  type VividnessSettings,
} from '../src/index.ts';

const LEVELS: Level[] = ['aa', 'aaa'];
const ladders = Object.entries(rules.recipes.items).flatMap(([id, recipe]) =>
  LEVELS.map((level) => ({ label: `${id} ${level}`, steps: recipe.ladders[level] })),
);
const defaultLadder = rules.recipes.items[rules.recipes.default]?.ladders.aa ?? [];
const groups = groupSettings(rules.vividness.defaults);
const maxDrift = rules.hue.maxDrift.hueDifference;
const presets = rules.vividness.presets;

const build = (
  colors: readonly ScaleColor[],
  ladder: readonly ScaleLadderStep[] = defaultLadder,
  groupsUsed: Readonly<Record<string, GroupSettings>> = groups,
): Palette => generateScales({ colors, groups: groupsUsed, presets, ladder, maxDrift });

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

/** The D-049 rule: steps 37, 50 and 64 grades apart give 3:1, 4.5:1 and 7:1. */
const contrastRule = rules.ladders.zones.contrast.gradesFromEachPage.map((grades, i) => ({
  grades,
  ratio: [3, 4.5, 7][i] as number,
}));

/**
 * Checks the contrast rule between every pair of steps, within and between families, on exact
 * values.
 * @param families - the families to check
 */
const expectContrastRule = (families: Palette['families']): void => {
  for (const a of families) {
    for (const b of families) {
      for (const [i, sa] of a.steps.entries()) {
        for (const sb of b.steps.slice(i + 1)) {
          for (const { grades, ratio } of contrastRule) {
            if (sb.name - sa.name >= grades) expect(contrast(sa, sb)).toBeGreaterThanOrEqual(ratio);
          }
        }
      }
    }
  }
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
    fc.assert(
      fc.property(anyPalette, ({ hexes, ladder }) => {
        expectContrastRule(build(asColors(hexes), ladder.steps).families);
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

  it('CLR-14: Colours can be grouped, and groups carry their own settings', () => {
    const colors: ScaleColor[] = [
      { id: 'a', name: 'A', group: 'brand', value: '#1b998b' },
      { id: 'b', name: 'B', group: 'feedback', value: '#c4362b' },
      { id: 'c', name: 'C', group: 'brand', value: '#53599a' },
    ];
    const withOverride = groupSettings(rules.vividness.defaults, { brand: { recovery: 0.4 } });
    const palette = build(colors, defaultLadder, withOverride);
    expect(palette.groups).toEqual([
      { id: 'brand', settings: { vividness: 'hold', recovery: 0.4 }, colors: ['a', 'c'] },
      { id: 'feedback', settings: { vividness: 'hold' }, colors: ['b'] },
    ]);
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
      generateScales({ colors: [ok], groups, presets, ladder: defaultLadder, maxDrift: -1 }),
    ).toThrow(RangeError);
  });

  it('CLR-15: Refuses vividness settings it can’t apply', () => {
    const ok: ScaleColor = { id: 'a', name: 'A', group: 'brand', value: '#123456' };
    const withGroup = (settings: GroupSettings): Palette =>
      build([ok], defaultLadder, { brand: settings });
    expect(() => withGroup({ vividness: 'nope' })).toThrow(RangeError);
    expect(() => withGroup({ vividness: 'hold', recovery: 1.1 })).toThrow(RangeError);
    expect(() => withGroup({ vividness: 'hold', ceiling: -0.1 })).toThrow(RangeError);
    expect(() => withGroup({ vividness: 'hold', ceiling: Number.NaN })).toThrow(RangeError);
    expect(() => build([{ ...ok, vividness: { recovery: 2 } }])).toThrow(RangeError);
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

/** Any recovery and ceiling, boundaries included. */
const anySetting = fc.oneof(fc.constantFrom(0, 1), fc.double({ min: 0, max: 1, noNaN: true }));
const anySettings = fc.record({ recovery: anySetting, ceiling: anySetting });
/** Every brand colour in one group with these settings. */
const brandWith = (settings: Partial<VividnessSettings>): Record<string, GroupSettings> => ({
  brand: { vividness: 'hold', ...settings },
});

describe('vividness: recovery and ceiling', () => {
  it('US-04: Vividness never changes contrast — any recovery and ceiling, on every recipe at AA and AAA', () => {
    fc.assert(
      fc.property(anyPalette, anySettings, anySettings, ({ hexes, ladder }, group, own) => {
        const colors = asColors(hexes);
        // One colour overrides its group's settings, so both levels are exercised.
        const adjusted = colors.map((c, i) => (i === 0 ? { ...c, vividness: own } : c));
        const held = build(colors, ladder.steps).families;
        const changed = build(adjusted, ladder.steps, brandWith(group)).families;
        changed.forEach((family, f) => {
          family.steps.forEach((step, i) => {
            const before = held[f]?.steps[i];
            // Every step keeps its grade and its L*, so its CIE luminance is unchanged.
            expect(step.name).toBe(before?.name);
            expect(step.lstar).toBe(before?.lstar);
            expect(
              Math.abs(coordinatesOf(srgbToXyz(step.rgb)).lightness - step.lstar),
            ).toBeLessThan(1e-6);
            // WCAG 2 weights the channels with rounded coefficients (0.2126, 0.7152, 0.0722)
            // rather than CIE Y's, so a step's exact WCAG grade moves by a few thousandths as
            // its chroma changes. That's far below the 0.5 that would change a rounded grade.
            expect(Math.abs(step.grade - (before?.grade ?? NaN))).toBeLessThan(0.01);
          });
          expect(family.placement.step).toBe(held[f]?.placement.step);
        });
        // And the contrast rule still holds on exact values, within and between families.
        expectContrastRule(changed);
      }),
      { numRuns: 40 },
    );
  });

  it('US-04: My colours start as supplied — by default every step keeps the source’s chroma, reduced only to fit the screen', () => {
    fc.assert(
      fc.property(anyPalette, ({ hexes, ladder }) => {
        const colors = asColors(hexes);
        for (const family of build(colors, ladder.steps).families) {
          expect(family.vividness).toMatchObject({
            preset: 'hold',
            recovery: { value: 0, from: 'preset' },
            ceiling: { value: 1, from: 'preset' },
          });
          const { c, h } = family.source.oklch;
          family.steps.forEach((step, i) => {
            // As CLR-14 built it: the source's own chroma, through the gamut mapping. Where the
            // gamut limits a step, its most vivid colour is reused from an earlier search, which
            // agrees to floating-point precision and gives the same hex.
            const lstar = ladder.steps[i]?.lstar as number;
            const clr14 = mapToGamut({ lightness: lstar, chroma: c, hue: h });
            expect(step.hex).toBe(formatHex(clr14.rgb));
            for (const channel of ['r', 'g', 'b'] as const)
              expect(Math.abs(step.rgb[channel] - clr14.rgb[channel])).toBeLessThan(1e-12);
            expect(step.reduced).toBe(clr14.reduced);
            if (step.limit !== null) expect(step.limit).toBe(step.reduced ? 'gamut' : 'recovery');
          });
        }
        // The source colours themselves are never changed (D-064).
        expect(build(colors, ladder.steps).families.map((f) => f.color)).toEqual(colors);
      }),
      { numRuns: 40 },
    );
  });

  it('US-04: Adjust vividness for a group — changing one group changes only that group', () => {
    const colors: ScaleColor[] = [
      { id: 'pink', name: 'Pink', group: 'brand', value: '#d991ba' },
      { id: 'olive', name: 'Olive', group: 'brand', value: '#8cae68' },
      { id: 'red', name: 'Red', group: 'feedback', value: '#c4362b' },
    ];
    const held = build(colors).families;
    const adjusted = build(colors, defaultLadder, {
      ...groups,
      brand: { vividness: 'hold', recovery: 0.5 },
    }).families;
    expect(adjusted[0]?.steps).not.toEqual(held[0]?.steps);
    expect(adjusted[1]?.steps).not.toEqual(held[1]?.steps);
    expect(adjusted[2]).toEqual(held[2]);
    expect(adjusted[0]?.vividness.recovery).toEqual({ value: 0.5, from: 'group' });
    expect(adjusted[0]?.vividness.ceiling).toEqual({ value: 1, from: 'preset' });
  });

  it('US-04: Adjust vividness for a group — a colour’s own setting changes only that colour', () => {
    const colors: ScaleColor[] = [
      { id: 'pink', name: 'Pink', group: 'brand', value: '#d991ba', vividness: { ceiling: 0.6 } },
      { id: 'olive', name: 'Olive', group: 'brand', value: '#8cae68' },
    ];
    const groupOnly = brandWith({ recovery: 0.5 });
    const plain = build(
      colors.map(({ id, name, group, value }) => ({ id, name, group, value })),
      defaultLadder,
      groupOnly,
    );
    const [pink, olive] = build(colors, defaultLadder, groupOnly).families;
    expect(pink?.steps).not.toEqual(plain.families[0]?.steps);
    expect(olive?.steps).toEqual(plain.families[1]?.steps);
    // The colour's own ceiling wins over the preset's; recovery still comes from the group.
    expect(pink?.vividness).toMatchObject({
      recovery: { value: 0.5, from: 'group' },
      ceiling: { value: 0.6, from: 'color' },
    });
    expect(pink?.color.vividness).toEqual({ ceiling: 0.6 });
  });

  describe('US-04: The setting that matters is shown first', () => {
    const neonPink = doggly.colors.find((c) => c.id === 'neonPink') as ScaleColor;
    const pinkMist = sorrel.colors.find((c) => c.id === 'pinkMist') as ScaleColor;
    const familyOf = (
      color: ScaleColor,
      settings: Partial<VividnessSettings>,
      ladder: readonly ScaleLadderStep[] = defaultLadder,
    ) => build([color], ladder, brandWith(settings)).families[0];
    const withColor = (color: ScaleColor, settings: Partial<VividnessSettings>) =>
      familyOf(color, settings)?.steps.filter((s) => s.limit !== null) ?? [];

    it('US-04: The setting that matters is shown first — at recovery 1 the gamut limits every step', () => {
      for (const color of [neonPink, pinkMist]) {
        const steps = withColor(color, { recovery: 1 });
        expect(steps.length).toBeGreaterThan(10);
        for (const step of steps) {
          expect(step.limit).toBe('gamut');
          expect(step.chroma).toBeCloseTo(step.maximum, 9);
        }
        expect(familyOf(color, { recovery: 1 })?.vividness.limit).toBe('gamut');
      }
    });

    it('US-04: The setting that matters is shown first — at recovery 0 recovery limits each step the source fits, and the gamut the rest', () => {
      const steps = withColor(neonPink, { recovery: 0 });
      expect(steps.some((s) => s.limit === 'recovery')).toBe(true);
      expect(steps.some((s) => s.limit === 'gamut')).toBe(true);
      for (const step of steps) {
        const fits = (familyOf(neonPink, {})?.source.oklch.c ?? NaN) < step.maximum;
        expect(step.limit).toBe(fits ? 'recovery' : 'gamut');
      }
    });

    it('US-04: The setting that matters is shown first — at ceiling 0 the ceiling limits every step, and no step has colour', () => {
      for (const recovery of [0, 0.5, 1]) {
        const family = familyOf(pinkMist, { recovery, ceiling: 0 });
        for (const step of family?.steps.filter((s) => s.limit !== null) ?? []) {
          expect(step.limit).toBe('ceiling');
          expect(step.chroma).toBe(0);
        }
        expect(family?.vividness.limit).toBe('ceiling');
      }
    });

    it('US-04: The setting that matters is shown first — at ceiling 1 the ceiling never limits', () => {
      fc.assert(
        fc.property(anyHex, anySetting, (value, recovery) => {
          const family = familyOf(
            { id: 'x', name: 'X', group: 'brand', value },
            { recovery, ceiling: 1 },
          );
          for (const step of family?.steps ?? []) expect(step.limit).not.toBe('ceiling');
        }),
        { numRuns: 40 },
      );
    });

    it('US-04: The setting that matters is shown first — a ceiling below what recovery gives is the limit', () => {
      const family = familyOf(pinkMist, { recovery: 1, ceiling: 0.5 });
      expect(family?.vividness.limit).toBe('ceiling');
      for (const step of family?.steps.filter((s) => s.limit !== null) ?? []) {
        expect(step.limit).toBe('ceiling');
        expect(step.chroma).toBeCloseTo(0.5 * step.maximum, 9);
      }
    });

    it('US-04: The setting that matters is shown first — a tie goes to the ceiling, then recovery, then the gamut (D-072)', () => {
      /** A two-step ladder: the first step limited by each of two limits, in ladder order. */
      const tie = (
        color: ScaleColor,
        settings: Partial<VividnessSettings>,
        a: string,
        b: string,
      ) => {
        const steps = familyOf(color, settings)?.steps ?? [];
        const picked = [a, b].map((limit) => steps.find((s) => s.limit === limit));
        expect(picked.every(Boolean), `${a} and ${b} both occur`).toBe(true);
        const ladder = picked
          .map((s) => ({ name: s?.name ?? 0, lstar: s?.lstar ?? 0 }))
          .sort((x, y) => y.lstar - x.lstar);
        return familyOf(color, settings, ladder)?.vividness.limit;
      };
      expect(tie(neonPink, { recovery: 0 }, 'recovery', 'gamut')).toBe('recovery');
      expect(tie(pinkMist, { recovery: 0, ceiling: 0.4 }, 'recovery', 'ceiling')).toBe('ceiling');
      // The gamut and the ceiling can't tie: with any ceiling below 1, the ceiling caps a step
      // before the gamut would, so the gamut limits nothing.
    });

    it('US-04: The setting that matters is shown first — a true grey has no colour to limit', () => {
      const family = familyOf(
        { id: 'g', name: 'Grey', group: 'brand', value: '#777777' },
        { recovery: 1 },
      );
      for (const step of family?.steps ?? []) {
        expect(step.limit).toBeNull();
        expect(step.maximum).toBe(0);
      }
      expect(family?.vividness.limit).toBeNull();
    });
  });

  it.each(
    tuner.cases.map(
      (c) => [`recovery ${c.recovery}, ceiling ${c.ceiling}, ${c.recipe} ${c.level}`, c] as const,
    ),
  )('CLR-15: The example brands match the Vividness Tuner — %s', (_, c) => {
    const ladder = rules.recipes.items[c.recipe]?.ladders[c.level as Level] ?? [];
    const colors = exampleBrands.flatMap((b) => b.colors);
    const families = build(colors, ladder, brandWith(c)).families;
    const expected: Record<string, string[][]> = c.families;
    for (const family of families) {
      const tunerSteps = expected[family.color.id] ?? [];
      expect(family.steps.map((s) => s.limit ?? 'none')).toEqual(tunerSteps.map(([, l]) => l));
      family.steps.forEach((step, i) => {
        const tunerHex = tunerSteps[i]?.[0] ?? '';
        if (step.hex.toLowerCase() === tunerHex) return;
        // The Tuner's search for the maximum is coarser (30 rounds against 60), so where a
        // channel sits on a rounding half the two can round apart. That's the only difference
        // allowed: one hex unit, on a channel within 1e-4 of a half (Sage green at step 9).
        const ours = parseHex(step.hex) as Rgb;
        const theirs = parseHex(tunerHex) as Rgb;
        for (const channel of ['r', 'g', 'b'] as const) {
          const units = Math.round(Math.abs(ours[channel] - theirs[channel]) * 255);
          if (units === 0) continue;
          expect(units, `${family.color.id} step ${step.name}`).toBe(1);
          const exact = step.rgb[channel] * 255;
          expect(Math.abs(exact - Math.floor(exact) - 0.5)).toBeLessThan(1e-4);
        }
      });
    }
  });
});
