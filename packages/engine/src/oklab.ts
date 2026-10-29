/**
 * @module oklab
 * OKLab and OKLCH, Björn Ottosson's perceptual colour space, which holds each colour's hue and
 * vividness in the engine (ADR 0001).
 *
 * The matrices are CSS Color 4's, which recompute Ottosson's from XYZ at higher precision, so the
 * engine's `oklch()` values match what browsers render (D-047).
 */
import { toPolar, fromPolar, type ChromaHue } from './polar.ts';
import { multiply, type Matrix3, type Xyz } from './xyz.ts';

/** An OKLab colour. Lightness runs from 0 (black) to 1 (white). */
export interface Oklab {
  l: number;
  a: number;
  b: number;
}

/** An OKLCH colour: OKLab in polar form. Hue is `null` for a grey. */
export interface Oklch extends ChromaHue {
  l: number;
}

const XYZ_TO_LMS: Matrix3 = [
  [0.819022437996703, 0.3619062600528904, -0.1288737815209879],
  [0.0329836539323885, 0.9292868615863434, 0.0361446663506424],
  [0.0481771893596242, 0.2642395317527308, 0.6335478284694309],
];

const LMS_TO_OKLAB: Matrix3 = [
  [0.210454268309314, 0.7936177747023054, -0.0040720430116193],
  [1.9779985324311684, -2.4285922420485799, 0.450593709617411],
  [0.0259040424655478, 0.7827717124575296, -0.8086757549230774],
];

const OKLAB_TO_LMS: Matrix3 = [
  [1, 0.3963377773761749, 0.2158037573099136],
  [1, -0.1055613458156586, -0.0638541728258133],
  [1, -0.0894841775298119, -1.2914855480194092],
];

const LMS_TO_XYZ: Matrix3 = [
  [1.2268798758459243, -0.5578149944602171, 0.2813910456659647],
  [-0.0405757452148008, 1.112286803280317, -0.0717110580655164],
  [-0.0763729366746601, -0.4214933324022432, 1.5869240198367816],
];

/**
 * Rounding tolerance for OKLab chroma: greys convert with chroma below 1e-14, and the least
 * chromatic non-grey hex colour has chroma above 0.001.
 */
export const OKLAB_ACHROMATIC_TOLERANCE = 1e-6;

/**
 * Converts XYZ (D65) to OKLab.
 * @param xyz - the colour in XYZ
 * @returns the colour in OKLab
 */
export function xyzToOklab(xyz: Xyz): Oklab {
  const lms = multiply(XYZ_TO_LMS, [xyz.x, xyz.y, xyz.z]);
  const [l, a, b] = multiply(LMS_TO_OKLAB, [
    Math.cbrt(lms[0]),
    Math.cbrt(lms[1]),
    Math.cbrt(lms[2]),
  ]);
  return { l, a, b };
}

/**
 * Converts OKLab to XYZ (D65); the inverse of {@link xyzToOklab}.
 * @param oklab - the colour in OKLab
 * @returns the colour in XYZ
 */
export function oklabToXyz(oklab: Oklab): Xyz {
  const lms = multiply(OKLAB_TO_LMS, [oklab.l, oklab.a, oklab.b]);
  const [x, y, z] = multiply(LMS_TO_XYZ, [lms[0] ** 3, lms[1] ** 3, lms[2] ** 3]);
  return { x, y, z };
}

/**
 * Converts OKLab to OKLCH.
 * @param oklab - the colour in OKLab
 * @returns the colour in OKLCH, with a `null` hue for a grey
 */
export function oklabToOklch(oklab: Oklab): Oklch {
  return { l: oklab.l, ...toPolar(oklab.a, oklab.b, OKLAB_ACHROMATIC_TOLERANCE) };
}

/**
 * Converts OKLCH to OKLab; the inverse of {@link oklabToOklch}.
 * @param oklch - the colour in OKLCH
 * @returns the colour in OKLab
 * @throws {RangeError} when the hue is `null` but chroma isn't zero
 */
export function oklchToOklab(oklch: Oklch): Oklab {
  return { l: oklch.l, ...fromPolar(oklch.c, oklch.h) };
}
