import { describe, expect, it } from 'vitest';
import {
  D65_WHITE,
  deltaE2000,
  linearToSrgb,
  lstarFromY,
  srgbToLinear,
  srgbToXyz,
  xyzToOklab,
  yFromLstar,
} from '../src/index.ts';
import { SHARMA_PAIRS } from './fixtures/sharma-ciede2000.ts';

const CRITERION = 'CLR-12: Unit tests against published reference values';

/** Passes when the value rounds to the published figure at its published number of decimals. */
function expectPublished(actual: number, published: number, decimals: number): void {
  expect(Math.abs(actual - published)).toBeLessThanOrEqual(0.5 * 10 ** -decimals + 1e-12);
}

describe('published reference values', () => {
  it(`${CRITERION} — CIEDE2000, the 34 pairs from Sharma, Wu and Dalal (2005)`, () => {
    expect(SHARMA_PAIRS).toHaveLength(34);
    for (const [l1, a1, b1, l2, a2, b2, expected] of SHARMA_PAIRS) {
      const forward = deltaE2000({ l: l1, a: a1, b: b1 }, { l: l2, a: a2, b: b2 });
      const backward = deltaE2000({ l: l2, a: a2, b: b2 }, { l: l1, a: a1, b: b1 });
      expectPublished(forward, expected, 4);
      // Swapping the two colours must give the same difference.
      expect(backward).toBeCloseTo(forward, 12);
    }
  });

  it(`${CRITERION} — OKLab, Ottosson's table of XYZ and OKLab pairs`, () => {
    // https://bottosson.github.io/posts/oklab/, "Table of example XYZ and Oklab pairs",
    // rounded by the author to three decimals.
    const table = [
      [0.95, 1.0, 1.089, 1.0, 0.0, 0.0],
      [1.0, 0.0, 0.0, 0.45, 1.236, -0.019],
      [0.0, 1.0, 0.0, 0.922, -0.671, 0.263],
      [0.0, 0.0, 1.0, 0.153, -1.415, -0.449],
    ] as const;
    for (const [x, y, z, l, a, b] of table) {
      const oklab = xyzToOklab({ x, y, z });
      expectPublished(oklab.l, l, 3);
      expectPublished(oklab.a, a, 3);
      expectPublished(oklab.b, b, 3);
    }
  });

  it(`${CRITERION} — sRGB primaries and white, IEC 61966-2-1`, () => {
    // IEC 61966-2-1:1999 gives the sRGB to XYZ matrix and the D65 white to four decimals.
    const table = [
      [{ r: 1, g: 0, b: 0 }, 0.4124, 0.2126, 0.0193],
      [{ r: 0, g: 1, b: 0 }, 0.3576, 0.7152, 0.1192],
      [{ r: 0, g: 0, b: 1 }, 0.1805, 0.0722, 0.9505],
    ] as const;
    for (const [rgb, x, y, z] of table) {
      const xyz = srgbToXyz(rgb);
      expectPublished(xyz.x, x, 4);
      expectPublished(xyz.y, y, 4);
      expectPublished(xyz.z, z, 4);
    }
    // The standard's white (0.9505, 1.0000, 1.0890) is the sum of three rounded entries, so it
    // can be out by up to three half-units in the last place.
    const sum = srgbToXyz({ r: 1, g: 1, b: 1 });
    for (const [actual, published] of [
      [sum.x, 0.9505],
      [sum.y, 1.0],
      [sum.z, 1.089],
    ] as const) {
      expect(Math.abs(actual - published)).toBeLessThanOrEqual(1.5e-4);
    }
    // White maps to the D65 white itself, with no chromatic adaptation.
    const white = srgbToXyz({ r: 1, g: 1, b: 1 });
    expect(white.x).toBeCloseTo(D65_WHITE.x, 12);
    expect(white.y).toBeCloseTo(1, 12);
    expect(white.z).toBeCloseTo(D65_WHITE.z, 12);
  });

  it(`${CRITERION} — sRGB transfer function, IEC 61966-2-1`, () => {
    // The two pieces meet at encoded 0.04045, which is linear 0.0031308 to the precision given.
    expect(srgbToLinear(0.04045)).toBeCloseTo(0.0031308, 7);
    expect(linearToSrgb(0.0031308)).toBeCloseTo(0.04045, 5);
    expect(srgbToLinear(0)).toBe(0);
    expect(srgbToLinear(1)).toBeCloseTo(1, 15);
    expect(linearToSrgb(1)).toBeCloseTo(1, 15);
    // The extended form reflects negative values, as CSS Color 4 specifies.
    expect(srgbToLinear(-0.5)).toBeCloseTo(-srgbToLinear(0.5), 15);
  });

  it(`${CRITERION} — CIE L*, CIE 15:2004`, () => {
    expect(lstarFromY(0)).toBe(0);
    expect(lstarFromY(1)).toBeCloseTo(100, 12);
    // 18% grey, the photographic mid-grey, is L* 49.496.
    expectPublished(lstarFromY(0.18), 49.496, 3);
    // At the breakpoint ε = (6/29)³ both pieces give L* = 8, so the curve is continuous.
    expect(lstarFromY(216 / 24389)).toBeCloseTo(8, 12);
    expect(116 * Math.cbrt(216 / 24389) - 16).toBeCloseTo(8, 12);
    // L* 50 is Y 0.18419, and the inverse undoes the forward on both pieces.
    expectPublished(yFromLstar(50), 0.18419, 5);
    for (const lstar of [0, 4, 8, 25, 50, 75, 100]) {
      expect(lstarFromY(yFromLstar(lstar))).toBeCloseTo(lstar, 10);
    }
  });
});
