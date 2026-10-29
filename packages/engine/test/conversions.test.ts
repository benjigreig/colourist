import fc from 'fast-check';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  deltaE2000,
  deltaEOk,
  formatHex,
  labToLch,
  labToXyz,
  lchToLab,
  oklabToOklch,
  oklabToXyz,
  oklchToOklab,
  parseHex,
  srgbToHsl,
  srgbToXyz,
  xyzToLab,
  xyzToOklab,
  xyzToSrgb,
  type Rgb,
} from '../src/index.ts';
import reference from './fixtures/colorjs-0.7.1.json' with { type: 'json' };

const CRITERION = 'CLR-12: Hex and sRGB to and from the chosen model, plus CIE L*, OKLCH and ΔE';

/** Every hex colour, as a 24-bit number. */
const anyHex = fc
  .integer({ min: 0, max: 0xffffff })
  .map((value) => `#${value.toString(16).padStart(6, '0').toUpperCase()}`);

function hexToRgb(hex: string): Rgb {
  const rgb = parseHex(hex);
  if (rgb === null) throw new Error(`Fixture colour ${hex} didn't parse`);
  return rgb;
}

function expectClose(actual: readonly number[], expected: readonly (number | null)[], tol: number) {
  actual.forEach((value, i) => {
    expect(Math.abs(value - (expected[i] ?? 0))).toBeLessThanOrEqual(tol);
  });
}

describe('hex', () => {
  it(`${CRITERION} — hex parses in six-digit and three-digit forms`, () => {
    expect(parseHex('#1B548F')).toEqual({ r: 27 / 255, g: 84 / 255, b: 143 / 255 });
    expect(parseHex(' 1b548f ')).toEqual(parseHex('#1B548F'));
    expect(parseHex('#abc')).toEqual(parseHex('#AABBCC'));
  });

  it(`${CRITERION} — hex with transparency or anything else is rejected`, () => {
    for (const text of ['#1B548F80', '#abcd', '#12345', '1B548G', 'blue', '', '#']) {
      expect(parseHex(text)).toBeNull();
    }
  });

  it(`${CRITERION} — hex formats uppercase, and refuses a colour outside sRGB`, () => {
    expect(formatHex({ r: 27 / 255, g: 84 / 255, b: 143 / 255 })).toBe('#1B548F');
    expect(() => formatHex({ r: 1.01, g: 0, b: 0 })).toThrow(RangeError);
    expect(() => formatHex({ r: 0, g: -0.01, b: 0 })).toThrow(RangeError);
  });

  it(`${CRITERION} — every hex survives sRGB, XYZ, OKLCH and CIE LCh and back`, () => {
    fc.assert(
      fc.property(anyHex, (hex) => {
        const xyz = srgbToXyz(hexToRgb(hex));
        const viaOklch = oklabToXyz(oklchToOklab(oklabToOklch(xyzToOklab(xyz))));
        const viaLch = labToXyz(lchToLab(labToLch(xyzToLab(xyz))));
        expect(formatHex(xyzToSrgb(viaOklch))).toBe(hex);
        expect(formatHex(xyzToSrgb(viaLch))).toBe(hex);
      }),
      { numRuns: 2000 },
    );
  });
});

describe('greys have no hue', () => {
  it(`${CRITERION} — a grey's hue is empty in OKLCH, CIE LCh and HSL, not 0`, () => {
    for (const hex of ['#000000', '#7F7F7F', '#808080', '#FFFFFF', '#010101', '#FEFEFE']) {
      const rgb = hexToRgb(hex);
      const xyz = srgbToXyz(rgb);
      expect(oklabToOklch(xyzToOklab(xyz))).toMatchObject({ c: 0, h: null });
      expect(labToLch(xyzToLab(xyz))).toMatchObject({ c: 0, h: null });
      expect(srgbToHsl(rgb)).toMatchObject({ s: 0, h: null });
    }
  });

  it(`${CRITERION} — the least chromatic non-greys still have a hue`, () => {
    for (const hex of ['#000100', '#FFFFFE', '#7F7F80', '#FEFFFF']) {
      const xyz = srgbToXyz(hexToRgb(hex));
      expect(oklabToOklch(xyzToOklab(xyz)).h).not.toBeNull();
      expect(labToLch(xyzToLab(xyz)).h).not.toBeNull();
    }
  });

  it(`${CRITERION} — a hue-less colour with chroma is refused`, () => {
    expect(() => oklchToOklab({ l: 0.5, c: 0.1, h: null })).toThrow(RangeError);
    expect(() => lchToLab({ l: 50, c: 10, h: null })).toThrow(RangeError);
    expect(oklchToOklab({ l: 0.5, c: 0, h: null })).toEqual({ l: 0.5, a: 0, b: 0 });
  });
});

describe('cross-checked with Color.js', () => {
  // Color.js is maintained by editors of the CSS colour specifications. The fixture records its
  // version and is generated outside the dependency tree (see generate-colorjs.mjs).
  it(`${CRITERION} — XYZ, CIE Lab, OKLab and OKLCH match Color.js for ${reference.colors.length} colours`, () => {
    expect(reference.source).toBe('colorjs.io 0.7.1');
    for (const color of reference.colors) {
      const rgb = hexToRgb(color.hex);
      const xyz = srgbToXyz(rgb);
      const lab = xyzToLab(xyz);
      const oklab = xyzToOklab(xyz);
      const oklch = oklabToOklch(oklab);
      expectClose([xyz.x, xyz.y, xyz.z], color.xyz, 1e-9);
      expectClose([lab.l, lab.a, lab.b], color.lab, 1e-7);
      expectClose([oklab.l, oklab.a, oklab.b], color.oklab, 1e-9);
      expectClose([oklch.l, oklch.c], color.oklch, 1e-9);
      // Both agree on which colours are grey.
      const [, , hue] = color.oklch;
      expect(oklch.h === null).toBe(hue === null);
      if (oklch.h !== null && hue !== null && hue !== undefined) {
        expect(Math.abs(oklch.h - hue)).toBeLessThan(1e-6);
      }
    }
  });

  it(`${CRITERION} — HSL matches Color.js`, () => {
    for (const color of reference.colors) {
      const hsl = srgbToHsl(hexToRgb(color.hex));
      const [h, s, l] = color.hsl;
      expect(hsl.h === null).toBe(h === null);
      if (hsl.h !== null && h !== null && h !== undefined) expect(hsl.h).toBeCloseTo(h, 6);
      expect(hsl.s).toBeCloseTo(s ?? 0, 6);
      expect(hsl.l).toBeCloseTo(l ?? 0, 6);
    }
  });

  it(`${CRITERION} — ΔE 2000 and ΔE OK match Color.js`, () => {
    const byHex = new Map(reference.colors.map((color) => [color.hex, hexToRgb(color.hex)]));
    for (const pair of reference.differences) {
      const a = srgbToXyz(byHex.get(pair.reference) ?? hexToRgb(pair.reference));
      const b = srgbToXyz(byHex.get(pair.sample) ?? hexToRgb(pair.sample));
      expect(deltaE2000(xyzToLab(a), xyzToLab(b))).toBeCloseTo(pair.deltaE2000, 6);
      expect(deltaEOk(xyzToOklab(a), xyzToOklab(b))).toBeCloseTo(pair.deltaEOk, 9);
    }
  });
});

describe('engine boundaries', () => {
  it('CLR-12: No UI or framework imports', () => {
    const dir = join(import.meta.dirname, '../src');
    for (const file of readdirSync(dir).filter((name) => name.endsWith('.ts'))) {
      const source = readFileSync(join(dir, file), 'utf8');
      const specifiers = [...source.matchAll(/\bfrom\s+['"]([^'"]+)['"]/g)].map((m) => m[1]);
      for (const specifier of specifiers) expect(specifier, file).toMatch(/^\.\//);
      expect(source, file).not.toMatch(/\bimport\s*\(/);
    }
  });
});
