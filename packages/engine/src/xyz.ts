/**
 * @module xyz
 * CIE XYZ, the space every conversion in the engine passes through, relative to a D65 white.
 *
 * D65 matters because WCAG measures contrast against sRGB's own D65 white (ADR 0001). The white
 * and the matrix arithmetic follow CSS Color 4's sample code (D-047).
 */

/** A CIE XYZ colour relative to D65, scaled so the white has Y = 1. */
export interface Xyz {
  x: number;
  y: number;
  z: number;
}

/** A 3 × 3 matrix, row by row. */
export type Matrix3 = readonly [
  readonly [number, number, number],
  readonly [number, number, number],
  readonly [number, number, number],
];

/** The D65 white in XYZ, from its CIE 1931 chromaticity (0.3127, 0.3290), as CSS Color 4 uses. */
export const D65_WHITE: Xyz = {
  x: 0.3127 / 0.329,
  y: 1,
  z: (1 - 0.3127 - 0.329) / 0.329,
};

/**
 * Multiplies a matrix by a three-component vector.
 * @param m - the matrix, row by row
 * @param v - the vector
 * @returns the product, as a vector
 */
export function multiply(
  m: Matrix3,
  v: readonly [number, number, number],
): [number, number, number] {
  const [r0, r1, r2] = m;
  return [
    r0[0] * v[0] + r0[1] * v[1] + r0[2] * v[2],
    r1[0] * v[0] + r1[1] * v[1] + r1[2] * v[2],
    r2[0] * v[0] + r2[1] * v[1] + r2[2] * v[2],
  ];
}
