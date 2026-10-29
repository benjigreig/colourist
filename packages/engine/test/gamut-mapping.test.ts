import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import {
  CIE_LCH_METHOD,
  HYBRID_METHOD,
  OKLCH_METHOD,
  SRGB,
  coordinatesOf,
  formatHex,
  hueDifference,
  isInGamut,
  linearToSrgb,
  mapToGamut,
  srgbToLinear,
  type ColorMethod,
  type Gamut,
} from '../src/index.ts';

const CRITERION =
  'CLR-12: Gamut mapping to sRGB that preserves lightness and hue, with clipping reported';

/**
 * Display P3, defined here only to show the target gamut is a parameter. The engine itself
 * ships sRGB alone until CLR-74. Matrices from CSS Color 4's sample code; P3 shares sRGB's
 * transfer function.
 */
const DISPLAY_P3: Gamut = {
  id: 'display-p3',
  toXyz: ({ r, g, b }) => {
    const [lr, lg, lb] = [r, g, b].map(srgbToLinear) as [number, number, number];
    return {
      x: (608311 / 1250200) * lr + (189793 / 714400) * lg + (198249 / 1000160) * lb,
      y: (35783 / 156275) * lr + (247089 / 357200) * lg + (198249 / 2500400) * lb,
      z: (32229 / 714400) * lg + (5220557 / 5000800) * lb,
    };
  },
  fromXyz: ({ x, y, z }) => ({
    r: linearToSrgb((446124 / 178915) * x - (333277 / 357830) * y - (72051 / 178915) * z),
    g: linearToSrgb((-14852 / 17905) * x + (63121 / 35810) * y + (423 / 17905) * z),
    b: linearToSrgb((11844 / 330415) * x - (50337 / 660830) * y + (316169 / 330415) * z),
  }),
};

/** Checks the result keeps its lightness and hue, fits the gamut, and has the most chroma. */
function expectMaximal(
  target: { lightness: number; chroma: number; hue: number },
  method: ColorMethod,
  gamut: Gamut = SRGB,
): void {
  const mapped = mapToGamut(target, { method, gamut });
  const measured = coordinatesOf(mapped.xyz, method);
  expect(isInGamut(gamut.fromXyz(mapped.xyz))).toBe(true);
  expect(Math.abs(measured.lightness - target.lightness)).toBeLessThan(1e-6);
  if (mapped.chroma > 1e-4 && measured.h !== null) {
    expect(Math.abs(hueDifference(measured.h, target.hue))).toBeLessThan(1e-6);
  }
  expect(mapped.chroma).toBeLessThanOrEqual(target.chroma);
  expect(mapped.reduced).toBe(mapped.chroma < target.chroma);
  if (mapped.reduced) {
    // A hair more chroma would not fit: nothing was dulled further than the gamut forced.
    const more = mapToGamut({ ...target, chroma: mapped.chroma + 1e-6 }, { method, gamut });
    expect(more.reduced).toBe(true);
  }
}

describe('gamut mapping', () => {
  it(`${CRITERION} — a colour that fits keeps its chroma and isn't reported`, () => {
    // The invented brand blue #1B548F, rebuilt at its own lightness, hue and chroma.
    const mapped = mapToGamut({ lightness: 35.1157, chroma: 0.1132, hue: 252.62 });
    expect(mapped).toMatchObject({ reduced: false, chroma: 0.1132, requestedChroma: 0.1132 });
    expect(formatHex(mapped.rgb)).toBe('#1B548F');
  });

  it(`${CRITERION} — a colour that doesn't fit loses chroma only, and says by how much`, () => {
    // A vivid blue held at a pale step: far too much chroma for sRGB.
    const mapped = mapToGamut({ lightness: 92, chroma: 0.2, hue: 264 });
    expect(mapped.reduced).toBe(true);
    expect(mapped.requestedChroma).toBe(0.2);
    expect(mapped.chroma).toBeGreaterThan(0);
    expect(mapped.chroma).toBeLessThan(0.2);
    expect(mapped.gamut).toBe('srgb');
    expectMaximal({ lightness: 92, chroma: 0.2, hue: 264 }, HYBRID_METHOD);
  });

  it(`${CRITERION} — any lightness, hue and chroma keeps lightness and hue, at the most chroma that fits`, () => {
    fc.assert(
      fc.property(
        fc.double({ min: 0.5, max: 99.5, noNaN: true }),
        fc.double({ min: 0, max: 0.4, noNaN: true }),
        fc.double({ min: 0, max: 359.999, noNaN: true }),
        (lightness, chroma, hue) => expectMaximal({ lightness, chroma, hue }, HYBRID_METHOD),
      ),
      { numRuns: 300 },
    );
  });

  it(`${CRITERION} — the comparison methods map the same way in their own models`, () => {
    for (const lightness of [5, 25, 46, 68, 86, 98]) {
      for (const hue of [30, 140, 264]) {
        expectMaximal({ lightness, chroma: 0.3, hue }, OKLCH_METHOD);
        expectMaximal({ lightness, chroma: 120, hue }, CIE_LCH_METHOD);
      }
    }
  });

  it(`${CRITERION} — black, white and greys map to themselves`, () => {
    expect(formatHex(mapToGamut({ lightness: 0, chroma: 0, hue: null }).rgb)).toBe('#000000');
    expect(formatHex(mapToGamut({ lightness: 100, chroma: 0, hue: null }).rgb)).toBe('#FFFFFF');
    expect(formatHex(mapToGamut({ lightness: 100, chroma: 0.2, hue: 30 }).rgb)).toBe('#FFFFFF');
    const grey = mapToGamut({ lightness: 50, chroma: 0, hue: null });
    expect(grey).toMatchObject({ hue: null, chroma: 0, reduced: false });
    expect(grey.rgb.r).toBeCloseTo(grey.rgb.g, 12);
    expect(grey.rgb.g).toBeCloseTo(grey.rgb.b, 12);
  });

  it(`${CRITERION} — impossible targets are refused`, () => {
    expect(() => mapToGamut({ lightness: -1, chroma: 0, hue: null })).toThrow(RangeError);
    expect(() => mapToGamut({ lightness: 101, chroma: 0, hue: null })).toThrow(RangeError);
    expect(() => mapToGamut({ lightness: Number.NaN, chroma: 0, hue: 0 })).toThrow(RangeError);
    expect(() => mapToGamut({ lightness: 50, chroma: -0.1, hue: 0 })).toThrow(RangeError);
    expect(() => mapToGamut({ lightness: 50, chroma: 0.1, hue: null })).toThrow(RangeError);
  });

  it(`${CRITERION} — the target gamut is a parameter, ready for Display P3 (CLR-74)`, () => {
    const target = { lightness: 57, chroma: 0.3, hue: 140 };
    const srgb = mapToGamut(target);
    const p3 = mapToGamut(target, { gamut: DISPLAY_P3 });
    expect(p3.gamut).toBe('display-p3');
    // P3 is wider, so the same vivid green keeps more of its chroma there.
    expect(p3.chroma).toBeGreaterThan(srgb.chroma);
    expectMaximal(target, HYBRID_METHOD, DISPLAY_P3);
    // Every sRGB colour is also inside P3.
    expect(isInGamut(DISPLAY_P3.fromXyz(srgb.xyz))).toBe(true);
  });
});
