/**
 * @module gamut
 * The range of colours a screen can show. The engine generates colours for one target gamut at a
 * time: sRGB in the beta, and Display P3 later (CLR-74), so the gamut is a parameter rather than
 * built in (D-047).
 */
import type { Xyz } from './xyz.ts';

/** A colour in an RGB gamut, with gamma-encoded channels from 0 to 1 when inside it. */
export interface Rgb {
  r: number;
  g: number;
  b: number;
}

/** An RGB gamut the engine can map colours into, such as sRGB. */
export interface Gamut {
  /** A stable identifier, such as `"srgb"`. */
  readonly id: string;
  /**
   * Converts a colour in this gamut's encoding to XYZ (D65).
   * @param rgb - gamma-encoded channels; values outside 0 to 1 are extended, not clipped
   * @returns the colour in XYZ
   */
  toXyz(rgb: Rgb): Xyz;
  /**
   * Converts an XYZ (D65) colour to this gamut's encoding.
   * @param xyz - the colour in XYZ
   * @returns gamma-encoded channels, outside 0 to 1 when the colour is outside the gamut
   */
  fromXyz(xyz: Xyz): Rgb;
}

/**
 * How far a channel may stray past 0 or 1 and still count as inside the gamut. This is a
 * floating-point rounding tolerance, not a method threshold: white converted to XYZ and back
 * comes out a few units in the 16th decimal place away from 1.
 */
export const GAMUT_TOLERANCE = 1e-9;

/**
 * Whether every channel is inside the gamut, allowing for floating-point rounding.
 * @param rgb - gamma-encoded channels in some gamut's encoding
 * @returns true when each channel is within 0 to 1, give or take {@link GAMUT_TOLERANCE}
 */
export function isInGamut(rgb: Rgb): boolean {
  const inside = (v: number): boolean => v >= -GAMUT_TOLERANCE && v <= 1 + GAMUT_TOLERANCE;
  return inside(rgb.r) && inside(rgb.g) && inside(rgb.b);
}

/**
 * Clamps each channel to 0 to 1. Use it only to tidy rounding on a colour already known to be in
 * the gamut; it is not a gamut mapping, because it shifts hue and lightness.
 * @param rgb - gamma-encoded channels
 * @returns the channels clamped to 0 to 1
 */
export function clampChannels(rgb: Rgb): Rgb {
  const clamp = (v: number): number => Math.min(1, Math.max(0, v));
  return { r: clamp(rgb.r), g: clamp(rgb.g), b: clamp(rgb.b) };
}
