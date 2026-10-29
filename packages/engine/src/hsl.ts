/**
 * @module hsl
 * Hue, saturation and lightness, shown beside each brand colour on the first stage (US-01). HSL
 * is for display only; the method never uses it.
 */
import type { Rgb } from './gamut.ts';

/**
 * HSL as people read it. Hue is in degrees from 0 up to 360, or `null` for a grey; saturation
 * and lightness are percentages.
 */
export interface Hsl {
  h: number | null;
  s: number;
  l: number;
}

/**
 * Converts sRGB to HSL, as CSS Color 4 defines it. Values aren't rounded; the view rounds them.
 * Unlike OKLCH, a hex grey has exactly equal channels, so no tolerance is needed to find one.
 * @param rgb - gamma-encoded sRGB channels
 * @returns the colour in HSL, with a `null` hue for a grey
 */
export function srgbToHsl(rgb: Rgb): Hsl {
  const max = Math.max(rgb.r, rgb.g, rgb.b);
  const min = Math.min(rgb.r, rgb.g, rgb.b);
  const l = (max + min) / 2;
  const d = max - min;
  if (d === 0) return { h: null, s: 0, l: l * 100 };
  const s = d / (1 - Math.abs(2 * l - 1));
  let h: number;
  if (max === rgb.r) h = ((rgb.g - rgb.b) / d) % 6;
  else if (max === rgb.g) h = (rgb.b - rgb.r) / d + 2;
  else h = (rgb.r - rgb.g) / d + 4;
  h *= 60;
  return { h: h < 0 ? h + 360 : h, s: s * 100, l: l * 100 };
}
