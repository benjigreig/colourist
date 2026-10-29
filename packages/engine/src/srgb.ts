/**
 * @module srgb
 * sRGB: hex text, the transfer function, conversion to and from XYZ (D65), and WCAG relative
 * luminance.
 *
 * The transfer function is IEC 61966-2-1's, and the matrices are the exact rational forms from
 * CSS Color 4's sample code, so values match what browsers compute (D-047).
 */
import { clampChannels, isInGamut, type Gamut, type Rgb } from './gamut.ts';
import { multiply, type Matrix3, type Xyz } from './xyz.ts';

const SRGB_TO_XYZ: Matrix3 = [
  [506752 / 1228815, 87881 / 245763, 12673 / 70218],
  [87098 / 409605, 175762 / 245763, 12673 / 175545],
  [7918 / 409605, 87881 / 737289, 1001167 / 1053270],
];

const XYZ_TO_SRGB: Matrix3 = [
  [12831 / 3959, -329 / 214, -1974 / 3959],
  [-851781 / 878810, 1648619 / 878810, 36519 / 878810],
  [705 / 12673, -2585 / 12673, 705 / 667],
];

/**
 * Converts one gamma-encoded sRGB channel to linear light. Values outside 0 to 1 are extended
 * by reflection, as CSS Color 4 does, so out-of-gamut colours convert without being clipped.
 * @param value - the encoded channel
 * @returns the linear-light channel
 */
export function srgbToLinear(value: number): number {
  const magnitude = Math.abs(value);
  if (magnitude <= 0.04045) return value / 12.92;
  return Math.sign(value) * ((magnitude + 0.055) / 1.055) ** 2.4;
}

/**
 * Converts one linear-light channel to gamma-encoded sRGB; the inverse of {@link srgbToLinear}.
 * @param value - the linear-light channel
 * @returns the encoded channel
 */
export function linearToSrgb(value: number): number {
  const magnitude = Math.abs(value);
  if (magnitude <= 0.0031308) return value * 12.92;
  return Math.sign(value) * (1.055 * magnitude ** (1 / 2.4) - 0.055);
}

/**
 * Converts sRGB to XYZ (D65).
 * @param rgb - gamma-encoded sRGB channels
 * @returns the colour in XYZ
 */
export function srgbToXyz(rgb: Rgb): Xyz {
  const [x, y, z] = multiply(SRGB_TO_XYZ, [
    srgbToLinear(rgb.r),
    srgbToLinear(rgb.g),
    srgbToLinear(rgb.b),
  ]);
  return { x, y, z };
}

/**
 * Converts XYZ (D65) to sRGB.
 * @param xyz - the colour in XYZ
 * @returns gamma-encoded sRGB channels, outside 0 to 1 when the colour is outside sRGB
 */
export function xyzToSrgb(xyz: Xyz): Rgb {
  const [r, g, b] = multiply(XYZ_TO_SRGB, [xyz.x, xyz.y, xyz.z]);
  return { r: linearToSrgb(r), g: linearToSrgb(g), b: linearToSrgb(b) };
}

/** The sRGB gamut, the target for every colour colouri.st generates in the beta (D-032). */
export const SRGB: Gamut = { id: 'srgb', toXyz: srgbToXyz, fromXyz: xyzToSrgb };

/**
 * WCAG 2 relative luminance, from 0 (black) to 1 (white). It uses WCAG's own rounded
 * coefficients rather than the matrix's Y row, so contrast figures match WCAG tools exactly.
 * The two differ by less than 0.00004.
 * @param rgb - gamma-encoded sRGB channels
 * @returns the relative luminance
 */
export function relativeLuminance(rgb: Rgb): number {
  return 0.2126 * srgbToLinear(rgb.r) + 0.7152 * srgbToLinear(rgb.g) + 0.0722 * srgbToLinear(rgb.b);
}

const HEX_PATTERN = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i;

/**
 * Parses a hex colour such as `#1B548F`, `1b548f` or `#abc`. Forms with transparency (`#RGBA`,
 * `#RRGGBBAA`) are rejected, because brand colours don't carry transparency.
 * @param text - text typed by a person
 * @returns the sRGB colour, or null when the text isn't a valid hex colour
 */
export function parseHex(text: string): Rgb | null {
  const match = HEX_PATTERN.exec(text.trim());
  const digits = match?.[1];
  if (digits === undefined) return null;
  const full = digits.length === 3 ? [...digits].map((digit) => digit + digit).join('') : digits;
  const value = Number.parseInt(full, 16);
  return { r: ((value >> 16) & 255) / 255, g: ((value >> 8) & 255) / 255, b: (value & 255) / 255 };
}

/**
 * Formats an sRGB colour as an uppercase six-digit hex string, such as `#1B548F`.
 * @param rgb - gamma-encoded sRGB channels, inside sRGB
 * @returns the hex string
 * @throws {RangeError} when the colour is outside sRGB. Map it into the gamut first, so a
 * colour is never silently clipped (D-031).
 */
export function formatHex(rgb: Rgb): string {
  if (!isInGamut(rgb)) {
    throw new RangeError(`Colour is outside sRGB (r ${rgb.r}, g ${rgb.g}, b ${rgb.b})`);
  }
  const { r, g, b } = clampChannels(rgb);
  const channel = (v: number): string =>
    Math.round(v * 255)
      .toString(16)
      .padStart(2, '0');
  return `#${channel(r)}${channel(g)}${channel(b)}`.toUpperCase();
}
