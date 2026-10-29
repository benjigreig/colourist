/**
 * @module delta-e
 * Colour differences: how far apart two colours look.
 *
 * - ΔE 2000 is the CIE's current formula, measured in CIE Lab. ADR 0001 used it to compare
 *   each brand colour with its nearest step.
 * - ΔE OK is the straight-line distance in OKLab, which CSS Color 4 uses for gamut mapping.
 *
 * Which difference each check uses, and the thresholds, belong to the rules, not here.
 */
import type { Lab } from './cielab.ts';
import type { Oklab } from './oklab.ts';

const DEGREES = 180 / Math.PI;
const RADIANS = Math.PI / 180;
const POW25_7 = 25 ** 7;

/**
 * Hue angle in degrees, 0 up to 360, from opponent axes. A colour with no chroma gets hue 0,
 * as the CIEDE2000 formula itself specifies; this is internal to the formula, and no hue is
 * reported for greys anywhere else (D-047).
 * @param b - the yellow–blue axis
 * @param a - the red–green axis, already scaled by the formula
 * @returns the hue angle in degrees
 */
function hueAngle(b: number, a: number): number {
  if (a === 0 && b === 0) return 0;
  const h = Math.atan2(b, a) * DEGREES;
  return h < 0 ? h + 360 : h;
}

/**
 * The CIEDE2000 colour difference, following Sharma, Wu and Dalal (2005), with the parametric
 * factors kL, kC and kH all 1.
 * @param reference - the first colour in CIE Lab
 * @param sample - the second colour in CIE Lab
 * @returns ΔE 2000; about 1 is the smallest difference most people notice side by side
 */
export function deltaE2000(reference: Lab, sample: Lab): number {
  const { l: l1, a: a1, b: b1 } = reference;
  const { l: l2, a: a2, b: b2 } = sample;

  const meanC = (Math.hypot(a1, b1) + Math.hypot(a2, b2)) / 2;
  const g = 0.5 * (1 - Math.sqrt(meanC ** 7 / (meanC ** 7 + POW25_7)));
  const a1p = (1 + g) * a1;
  const a2p = (1 + g) * a2;
  const c1p = Math.hypot(a1p, b1);
  const c2p = Math.hypot(a2p, b2);
  const h1p = hueAngle(b1, a1p);
  const h2p = hueAngle(b2, a2p);

  const dLp = l2 - l1;
  const dCp = c2p - c1p;
  let dhp = 0;
  if (c1p * c2p !== 0) {
    dhp = h2p - h1p;
    if (dhp > 180) dhp -= 360;
    else if (dhp < -180) dhp += 360;
  }
  const dHp = 2 * Math.sqrt(c1p * c2p) * Math.sin((dhp / 2) * RADIANS);

  const meanLp = (l1 + l2) / 2;
  const meanCp = (c1p + c2p) / 2;
  let meanHp = h1p + h2p;
  if (c1p * c2p !== 0) {
    if (Math.abs(h1p - h2p) <= 180) meanHp /= 2;
    else meanHp = h1p + h2p < 360 ? (meanHp + 360) / 2 : (meanHp - 360) / 2;
  }

  const t =
    1 -
    0.17 * Math.cos((meanHp - 30) * RADIANS) +
    0.24 * Math.cos(2 * meanHp * RADIANS) +
    0.32 * Math.cos((3 * meanHp + 6) * RADIANS) -
    0.2 * Math.cos((4 * meanHp - 63) * RADIANS);
  const dTheta = 30 * Math.exp(-(((meanHp - 275) / 25) ** 2));
  const rc = 2 * Math.sqrt(meanCp ** 7 / (meanCp ** 7 + POW25_7));
  const sl = 1 + (0.015 * (meanLp - 50) ** 2) / Math.sqrt(20 + (meanLp - 50) ** 2);
  const sc = 1 + 0.045 * meanCp;
  const sh = 1 + 0.015 * meanCp * t;
  const rt = -Math.sin(2 * dTheta * RADIANS) * rc;

  return Math.sqrt(
    (dLp / sl) ** 2 + (dCp / sc) ** 2 + (dHp / sh) ** 2 + rt * (dCp / sc) * (dHp / sh),
  );
}

/**
 * The OKLab colour difference: the straight-line distance between two colours in OKLab.
 * @param reference - the first colour in OKLab
 * @param sample - the second colour in OKLab
 * @returns ΔE OK; CSS Color 4 treats 0.02 as just noticeable
 */
export function deltaEOk(reference: Oklab, sample: Oklab): number {
  return Math.hypot(reference.l - sample.l, reference.a - sample.a, reference.b - sample.b);
}
