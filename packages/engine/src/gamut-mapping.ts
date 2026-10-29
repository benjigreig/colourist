/**
 * @module gamut-mapping
 * Finds the colour a scale step should be: the most vivid colour inside the target gamut at a
 * given lightness and hue (ADR 0001, D-047).
 *
 * Where the requested chroma doesn't fit, chroma is reduced and lightness and hue are kept
 * exactly, and the result says so. CSS Color 4's own gamut mapping isn't used, because it keeps
 * OKLCH lightness rather than CIE L*, which would break counting steps to get contrast.
 */
import { clampChannels, isInGamut, type Gamut, type Rgb } from './gamut.ts';
import { HYBRID_METHOD, type ColorMethod } from './model.ts';
import { SRGB } from './srgb.ts';
import type { Xyz } from './xyz.ts';

/** What to map: a lightness in the method's lightness model, a hue, and the chroma wanted. */
export interface ColorTarget {
  /** Lightness from 0 (black) to 100 (white), in the method's lightness model. */
  lightness: number;
  /** The chroma wanted, in the method's hue and chroma model. */
  chroma: number;
  /** Hue in degrees, or `null` for a grey, which must then have zero chroma. */
  hue: number | null;
}

/** The colour a target maps to, and how much chroma had to give way. */
export interface MappedColor {
  /** Channels in the target gamut's encoding, each within 0 to 1. */
  rgb: Rgb;
  /** The gamut the colour was mapped into, such as `"srgb"`. */
  gamut: string;
  /** The colour in XYZ (D65). */
  xyz: Xyz;
  /** Lightness, as requested. */
  lightness: number;
  /** Hue, as requested. */
  hue: number | null;
  /** The chroma achieved: the requested chroma, or the most that fits. */
  chroma: number;
  /** The chroma requested. */
  requestedChroma: number;
  /** True when chroma was reduced to fit the gamut. */
  reduced: boolean;
}

/** Options for {@link mapToGamut}. */
export interface MapOptions {
  /** The colour method; the recommended hybrid method if left out. */
  method?: ColorMethod;
  /** The target gamut; sRGB if left out. */
  gamut?: Gamut;
}

/**
 * How close the solved lightness must be to the target. A rounding tolerance for the numerical
 * search, not a method threshold.
 */
const LIGHTNESS_TOLERANCE = 1e-9;
/** Bisection rounds; each halves the interval, so 60 rounds reach floating-point precision. */
const ROUNDS = 60;

/**
 * Solves for the colour with the given chroma and hue whose lightness matches the target.
 * Searches the hue model's own lightness coordinate, since it differs from the method's
 * (OKLCH lightness against CIE L*, for the recommended method).
 * @param target - the lightness wanted, in the method's lightness model
 * @param chroma - the chroma, in the method's hue and chroma model
 * @param hue - the hue in degrees, or `null` for a grey
 * @param method - the colour method
 * @returns the colour in XYZ, or null when no colour with that chroma reaches the lightness
 */
function solveLightness(
  target: number,
  chroma: number,
  hue: number | null,
  method: ColorMethod,
): Xyz | null {
  const { lightness, hueChroma } = method;
  const at = (l: number): Xyz => hueChroma.toXyz({ l, c: chroma, h: hue });
  // Chroma can push lightness either way, so search past white as well.
  let lo = 0;
  let hi = hueChroma.whiteLightness * 1.5;
  for (let i = 0; i < ROUNDS; i++) {
    const mid = (lo + hi) / 2;
    if (lightness.lightnessOf(at(mid)) < target) lo = mid;
    else hi = mid;
  }
  const xyz = at((lo + hi) / 2);
  return Math.abs(lightness.lightnessOf(xyz) - target) <= LIGHTNESS_TOLERANCE ? xyz : null;
}

/**
 * Maps a target into a gamut: the colour at exactly the target lightness and hue, with the
 * requested chroma if it fits, or otherwise the most chroma that fits. Chroma is never reduced
 * further than the gamut requires.
 * @param target - lightness, chroma and hue, in the method's models
 * @param options - the colour method and target gamut; the hybrid method and sRGB by default
 * @returns the mapped colour, saying whether chroma was reduced
 * @throws {RangeError} when lightness is outside 0 to 100, chroma is negative, or a `null` hue
 * comes with chroma above zero
 * @throws {Error} when not even a grey at that lightness fits the gamut, which would mean the
 * gamut or method is defined wrongly
 */
export function mapToGamut(target: ColorTarget, options: MapOptions = {}): MappedColor {
  const { method = HYBRID_METHOD, gamut = SRGB } = options;
  const { lightness, chroma, hue } = target;
  if (!(lightness >= 0 && lightness <= 100)) {
    throw new RangeError(`Lightness must be from 0 to 100, not ${lightness}`);
  }
  if (!(chroma >= 0)) throw new RangeError(`Chroma must be zero or more, not ${chroma}`);
  if (hue === null && chroma !== 0) {
    throw new RangeError(`A colour with no hue must have zero chroma, not ${chroma}`);
  }

  const fits = (c: number): Xyz | null => {
    const xyz = solveLightness(lightness, c, hue, method);
    return xyz !== null && isInGamut(gamut.fromXyz(xyz)) ? xyz : null;
  };

  let achieved = chroma;
  let xyz = fits(chroma);
  if (xyz === null) {
    // A grey at any lightness fits every gamut, so zero chroma is a safe lower bound.
    let lo = 0;
    let hi = chroma;
    let best = fits(0);
    for (let i = 0; i < ROUNDS; i++) {
      const mid = (lo + hi) / 2;
      const candidate = fits(mid);
      if (candidate === null) hi = mid;
      else {
        lo = mid;
        best = candidate;
      }
    }
    if (best === null) throw new Error(`No grey fits gamut ${gamut.id} at lightness ${lightness}`);
    achieved = lo;
    xyz = best;
  }

  return {
    rgb: clampChannels(gamut.fromXyz(xyz)),
    gamut: gamut.id,
    xyz,
    lightness,
    hue,
    chroma: achieved,
    requestedChroma: chroma,
    reduced: achieved < chroma,
  };
}
