/**
 * Builds a colour's scale on a shared lightness ladder.
 *
 * Method (ADR 0001): each step's lightness is a CIE L* (D65) target from the ladder.
 * The colour's own OKLCH hue and chroma are held. Where a step would fall outside
 * sRGB, chroma is reduced to the most that fits, and lightness and hue are kept.
 */
import { contrast, inGamut, lstar, oklchToRgb, rgbToOklch, toHex, type Rgb } from "./colour";

/** One generated step of a scale. */
export interface Step {
  /** Step name, such as "500". */
  name: string;
  /** The ladder's CIE L* target for this step. */
  target: number;
  hex: string;
  rgb: Rgb;
  /** Text colour for a label on this swatch: whichever of black or white has more contrast. */
  label: "#000000" | "#FFFFFF";
}

/** A generated scale for one colour. */
export interface Scale {
  steps: Step[];
  /** Index of the step whose lightness is nearest the source colour's. */
  nearestStep: number;
  /** Difference in L* between the source colour and its nearest step. */
  nearestDifference: number;
}

const WHITE: Rgb = { r: 1, g: 1, b: 1 };
const BLACK: Rgb = { r: 0, g: 0, b: 0 };

/**
 * Finds the OKLCH colour with the given hue and (at most) the given chroma whose CIE L* matches the target.
 * Uses nested binary searches: chroma is reduced first to fit sRGB at each candidate lightness.
 */
function solveStep(targetLstar: number, chroma: number, hue: number): Rgb {
  const fitChroma = (l: number): number => {
    if (inGamut(oklchToRgb({ l, c: chroma, h: hue }))) return chroma;
    let lo = 0, hi = chroma;
    for (let i = 0; i < 24; i++) {
      const mid = (lo + hi) / 2;
      if (inGamut(oklchToRgb({ l, c: mid, h: hue }))) lo = mid; else hi = mid;
    }
    return lo;
  };
  let lo = 0, hi = 1;
  for (let i = 0; i < 32; i++) {
    const mid = (lo + hi) / 2;
    const rgb = oklchToRgb({ l: mid, c: fitChroma(mid), h: hue });
    if (lstar(rgb) < targetLstar) lo = mid; else hi = mid;
  }
  const l = (lo + hi) / 2;
  return oklchToRgb({ l, c: fitChroma(l), h: hue });
}

/**
 * Generates a scale for one source colour on a ladder.
 * @param source - the brand colour
 * @param ladder - CIE L* targets from lightest to darkest
 * @param stepNames - display names for each step, the same length as the ladder
 */
export function buildScale(source: Rgb, ladder: readonly number[], stepNames: readonly string[]): Scale {
  const { c, h } = rgbToOklch(source);
  const steps = ladder.map((target, i) => {
    const rgb = solveStep(target, c, h);
    const clamped = { r: Math.min(1, Math.max(0, rgb.r)), g: Math.min(1, Math.max(0, rgb.g)), b: Math.min(1, Math.max(0, rgb.b)) };
    const label = contrast(clamped, BLACK) >= contrast(clamped, WHITE) ? "#000000" : "#FFFFFF";
    return { name: stepNames[i], target, hex: toHex(clamped), rgb: clamped, label } as Step;
  });
  const sourceL = lstar(source);
  let nearestStep = 0;
  ladder.forEach((t, i) => { if (Math.abs(t - sourceL) < Math.abs(ladder[nearestStep] - sourceL)) nearestStep = i; });
  return { steps, nearestStep, nearestDifference: Math.round(Math.abs(ladder[nearestStep] - sourceL) * 10) / 10 };
}
