/**
 * @module cielab
 * CIE L*, Lab and LCh, all relative to a D65 white (ADR 0001).
 *
 * The formulas are CIE 15:2004's, with ε and κ as exact fractions, as CSS Color 4 writes them.
 * CSS's own `lab()` uses a D50 white; ours uses D65 on purpose, because WCAG contrast does.
 */
import { toPolar, fromPolar, type ChromaHue } from './polar.ts';
import { D65_WHITE, type Xyz } from './xyz.ts';

/** A CIE Lab colour (D65). L* runs from 0 (black) to 100 (white). */
export interface Lab {
  l: number;
  a: number;
  b: number;
}

/** A CIE LCh colour (D65): Lab in polar form. Hue is `null` for a grey. */
export interface Lch extends ChromaHue {
  l: number;
}

const EPSILON = 216 / 24389;
const KAPPA = 24389 / 27;

/**
 * Rounding tolerance for CIE chroma: greys convert with chroma below 1e-13, and the least
 * chromatic non-grey hex colour has chroma above 0.27.
 */
export const LAB_ACHROMATIC_TOLERANCE = 1e-4;

/**
 * CIE L* from relative luminance (Y, with white at 1).
 * @param y - relative luminance
 * @returns L*, from 0 (black) to 100 (white)
 */
export function lstarFromY(y: number): number {
  return y > EPSILON ? 116 * Math.cbrt(y) - 16 : KAPPA * y;
}

/**
 * Relative luminance from CIE L*; the inverse of {@link lstarFromY}.
 * @param lstar - L*, from 0 to 100
 * @returns relative luminance, with white at 1
 */
export function yFromLstar(lstar: number): number {
  return lstar > KAPPA * EPSILON ? ((lstar + 16) / 116) ** 3 : lstar / KAPPA;
}

const f = (t: number): number => (t > EPSILON ? Math.cbrt(t) : (KAPPA * t + 16) / 116);
const fInverse = (t: number): number => (t ** 3 > EPSILON ? t ** 3 : (116 * t - 16) / KAPPA);

/**
 * Converts XYZ (D65) to CIE Lab (D65).
 * @param xyz - the colour in XYZ
 * @returns the colour in Lab
 */
export function xyzToLab(xyz: Xyz): Lab {
  const fx = f(xyz.x / D65_WHITE.x);
  const fy = f(xyz.y / D65_WHITE.y);
  const fz = f(xyz.z / D65_WHITE.z);
  return { l: 116 * fy - 16, a: 500 * (fx - fy), b: 200 * (fy - fz) };
}

/**
 * Converts CIE Lab (D65) to XYZ (D65); the inverse of {@link xyzToLab}.
 * @param lab - the colour in Lab
 * @returns the colour in XYZ
 */
export function labToXyz(lab: Lab): Xyz {
  const fy = (lab.l + 16) / 116;
  const fx = fy + lab.a / 500;
  const fz = fy - lab.b / 200;
  return {
    x: fInverse(fx) * D65_WHITE.x,
    y: yFromLstar(lab.l) * D65_WHITE.y,
    z: fInverse(fz) * D65_WHITE.z,
  };
}

/**
 * Converts CIE Lab to LCh.
 * @param lab - the colour in Lab
 * @returns the colour in LCh, with a `null` hue for a grey
 */
export function labToLch(lab: Lab): Lch {
  return { l: lab.l, ...toPolar(lab.a, lab.b, LAB_ACHROMATIC_TOLERANCE) };
}

/**
 * Converts CIE LCh to Lab; the inverse of {@link labToLch}.
 * @param lch - the colour in LCh
 * @returns the colour in Lab
 * @throws {RangeError} when the hue is `null` but chroma isn't zero
 */
export function lchToLab(lch: Lch): Lab {
  return { l: lch.l, ...fromPolar(lch.c, lch.h) };
}
