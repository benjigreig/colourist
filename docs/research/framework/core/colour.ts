/**
 * Colour conversions used by the spike.
 *
 * Purpose: just enough colour maths to build a hybrid ladder (ADR 0001):
 * lightness from CIE L* (D65), hue and chroma held in OKLCH.
 * This is spike code. The real engine (CLR-12) is written and tested separately.
 *
 * All functions are pure and framework-free.
 */

/** An sRGB colour with channels in the range 0 to 1. */
export interface Rgb { r: number; g: number; b: number }

/** An OKLCH colour: lightness 0 to 1, chroma 0 and up, hue in degrees. */
export interface Oklch { l: number; c: number; h: number }

/** Hue, saturation and lightness as shown to people (degrees and percentages). */
export interface Hsl { h: number; s: number; l: number }

const HEX_PATTERN = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i;

/**
 * Parses a hex colour such as "#1B548F", "1b548f" or "#abc".
 * @param input - text typed by the person
 * @returns the colour, or null when the text isn't a valid hex colour
 */
export function parseHex(input: string): Rgb | null {
  const match = HEX_PATTERN.exec(input.trim());
  if (!match) return null;
  let digits = match[1];
  if (digits.length === 3) digits = digits.split("").map((d) => d + d).join("");
  const value = parseInt(digits, 16);
  return { r: ((value >> 16) & 255) / 255, g: ((value >> 8) & 255) / 255, b: (value & 255) / 255 };
}

/**
 * Formats a colour as an uppercase six-digit hex string.
 * @param rgb - channels 0 to 1; values outside the range are clamped
 */
export function toHex(rgb: Rgb): string {
  const channel = (v: number) => Math.round(Math.min(1, Math.max(0, v)) * 255).toString(16).padStart(2, "0");
  return `#${channel(rgb.r)}${channel(rgb.g)}${channel(rgb.b)}`.toUpperCase();
}

/** Converts one gamma-encoded sRGB channel to linear light. */
function toLinear(v: number): number {
  return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
}

/** Converts one linear-light channel back to gamma-encoded sRGB. */
function fromLinear(v: number): number {
  return v <= 0.0031308 ? v * 12.92 : 1.055 * v ** (1 / 2.4) - 0.055;
}

/**
 * Relative luminance (Y) as defined by WCAG 2, from 0 (black) to 1 (white).
 */
export function luminance(rgb: Rgb): number {
  return 0.2126 * toLinear(rgb.r) + 0.7152 * toLinear(rgb.g) + 0.0722 * toLinear(rgb.b);
}

/**
 * CIE L* (D65 white) from relative luminance. 0 is black, 100 is white.
 * D65 matters: WCAG measures contrast against a D65 white (see ADR 0001).
 */
export function lstarFromY(y: number): number {
  return y > 216 / 24389 ? 116 * Math.cbrt(y) - 16 : (24389 / 27) * y;
}

/** The relative luminance that gives a CIE L* value; the inverse of lstarFromY. */
export function yFromLstar(lstar: number): number {
  return lstar > 8 ? ((lstar + 16) / 116) ** 3 : (lstar * 27) / 24389;
}

/** CIE L* (D65) of an sRGB colour. */
export function lstar(rgb: Rgb): number {
  return lstarFromY(luminance(rgb));
}

/** Converts sRGB to OKLCH (Björn Ottosson's OKLab, in polar form). */
export function rgbToOklch(rgb: Rgb): Oklch {
  const r = toLinear(rgb.r), g = toLinear(rgb.g), b = toLinear(rgb.b);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  const h = (Math.atan2(B, A) * 180) / Math.PI;
  return { l: L, c: Math.hypot(A, B), h: h < 0 ? h + 360 : h };
}

/**
 * Converts OKLCH to sRGB. Channels may fall outside 0 to 1 when the colour is out of gamut.
 */
export function oklchToRgb({ l: L, c, h }: Oklch): Rgb {
  const rad = (h * Math.PI) / 180;
  const A = c * Math.cos(rad), B = c * Math.sin(rad);
  const l = (L + 0.3963377774 * A + 0.2158037573 * B) ** 3;
  const m = (L - 0.1055613458 * A - 0.0638541728 * B) ** 3;
  const s = (L - 0.0894841775 * A - 1.291485548 * B) ** 3;
  return {
    r: fromLinear(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    g: fromLinear(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    b: fromLinear(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
  };
}

/** True when every channel is inside sRGB, with a tiny tolerance for rounding. */
export function inGamut(rgb: Rgb): boolean {
  const ok = (v: number) => v >= -1e-4 && v <= 1 + 1e-4;
  return ok(rgb.r) && ok(rgb.g) && ok(rgb.b);
}

/**
 * Hue, saturation and lightness for display beside each brand colour (stage 1).
 * @returns hue in degrees, saturation and lightness as percentages, all rounded
 */
export function toHsl(rgb: Rgb): Hsl {
  const max = Math.max(rgb.r, rgb.g, rgb.b), min = Math.min(rgb.r, rgb.g, rgb.b);
  const l = (max + min) / 2;
  const d = max - min;
  let h = 0, s = 0;
  if (d !== 0) {
    s = d / (1 - Math.abs(2 * l - 1));
    if (max === rgb.r) h = 60 * (((rgb.g - rgb.b) / d) % 6);
    else if (max === rgb.g) h = 60 * ((rgb.b - rgb.r) / d + 2);
    else h = 60 * ((rgb.r - rgb.g) / d + 4);
  }
  return { h: Math.round(h < 0 ? h + 360 : h), s: Math.round(s * 100), l: Math.round(l * 100) };
}

/**
 * WCAG 2 contrast ratio between two colours, from 1 to 21.
 */
export function contrast(a: Rgb, b: Rgb): number {
  const ya = luminance(a), yb = luminance(b);
  return (Math.max(ya, yb) + 0.05) / (Math.min(ya, yb) + 0.05);
}
