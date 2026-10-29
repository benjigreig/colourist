/**
 * @module polar
 * Polar forms of opponent colour spaces (CIE LCh from Lab, OKLCH from OKLab), shared by both.
 *
 * A grey has no hue, so its hue is `null` rather than a number (D-047). Whether a colour counts
 * as grey uses a rounding tolerance per space, not a method threshold: it only absorbs the
 * floating-point noise left when a grey is converted, and is far below any chroma a hex colour
 * can carry. The method's own judgements about low chroma live in the rules.
 */

/** Chroma and hue. Hue is in degrees from 0 up to 360, or `null` when the colour is grey. */
export interface ChromaHue {
  c: number;
  h: number | null;
}

/**
 * Converts opponent axes to chroma and hue.
 * @param a - the red–green axis
 * @param b - the yellow–blue axis
 * @param tolerance - chroma at or below this counts as grey; a rounding tolerance for the space
 * @returns chroma, and hue in degrees, or `null` hue (and zero chroma) for a grey
 */
export function toPolar(a: number, b: number, tolerance: number): ChromaHue {
  const c = Math.hypot(a, b);
  if (c <= tolerance) return { c: 0, h: null };
  const h = (Math.atan2(b, a) * 180) / Math.PI;
  return { c, h: h < 0 ? h + 360 : h };
}

/**
 * Converts chroma and hue to opponent axes; the inverse of {@link toPolar}.
 * @param c - chroma
 * @param h - hue in degrees, or `null` for a grey
 * @returns the two opponent axes
 * @throws {RangeError} when the hue is `null` but chroma isn't zero, since such a colour has no
 * direction to point in
 */
export function fromPolar(c: number, h: number | null): { a: number; b: number } {
  if (h === null) {
    if (c !== 0) throw new RangeError(`A colour with no hue must have zero chroma, not ${c}`);
    return { a: 0, b: 0 };
  }
  const radians = (h * Math.PI) / 180;
  return { a: c * Math.cos(radians), b: c * Math.sin(radians) };
}

/**
 * The difference between two hues, wrapped to the shorter way round.
 * @param from - the first hue in degrees
 * @param to - the second hue in degrees
 * @returns a signed difference from -180 to 180 degrees
 */
export function hueDifference(from: number, to: number): number {
  const d = (((to - from) % 360) + 360) % 360;
  return d > 180 ? d - 360 : d;
}
