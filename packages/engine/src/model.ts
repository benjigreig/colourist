/**
 * @module model
 * Colour methods: a lightness model paired with a hue and chroma model.
 *
 * ADR 0001 keeps the two behind separate interfaces so either can be replaced later (HCT, for
 * example) without a rebuild. The recommended method takes lightness from CIE L* (D65) and hue
 * and chroma from OKLCH. The other two methods exist for the "Compare methods" scenario in US-03.
 */
import { labToLch, labToXyz, lchToLab, lstarFromY, xyzToLab } from './cielab.ts';
import { oklabToOklch, oklabToXyz, oklchToOklab, xyzToOklab } from './oklab.ts';
import type { ChromaHue } from './polar.ts';
import type { Xyz } from './xyz.ts';

/** How a method measures lightness. Every lightness model uses a scale from 0 to 100. */
export interface LightnessModel {
  /** A stable identifier, such as `"cie-lstar"`. */
  readonly id: string;
  /**
   * Measures a colour's lightness.
   * @param xyz - the colour in XYZ (D65)
   * @returns lightness from 0 (black) to 100 (white)
   */
  lightnessOf(xyz: Xyz): number;
}

/** A colour in a hue and chroma model's own polar coordinates. Hue is `null` for a grey. */
export interface PolarColor extends ChromaHue {
  /** The model's own lightness coordinate, which may differ from the method's lightness. */
  l: number;
}

/** How a method holds a colour's hue and chroma (vividness). */
export interface HueChromaModel {
  /** A stable identifier, such as `"oklch"`. */
  readonly id: string;
  /** The model's own lightness coordinate runs from 0 up to this value for white. */
  readonly whiteLightness: number;
  /**
   * Converts XYZ to the model's polar coordinates.
   * @param xyz - the colour in XYZ (D65)
   * @returns the colour in the model, with a `null` hue for a grey
   */
  fromXyz(xyz: Xyz): PolarColor;
  /**
   * Converts the model's polar coordinates to XYZ.
   * @param color - the colour in the model
   * @returns the colour in XYZ (D65)
   * @throws {RangeError} when the hue is `null` but chroma isn't zero
   */
  toXyz(color: PolarColor): Xyz;
}

/** A colour method: where lightness comes from, and where hue and chroma come from. */
export interface ColorMethod {
  /** A stable identifier, such as `"hybrid"`. */
  readonly id: string;
  readonly lightness: LightnessModel;
  readonly hueChroma: HueChromaModel;
}

/**
 * CIE L* of a colour.
 * @param xyz - the colour in XYZ (D65)
 * @returns L*, from 0 to 100
 */
function lstarOf(xyz: Xyz): number {
  return lstarFromY(xyz.y);
}

/**
 * OKLab lightness of a colour, scaled to 0 to 100.
 * @param xyz - the colour in XYZ (D65)
 * @returns OKLab lightness × 100
 */
function oklabLightnessOf(xyz: Xyz): number {
  return xyzToOklab(xyz).l * 100;
}

/**
 * XYZ to OKLCH.
 * @param xyz - the colour in XYZ (D65)
 * @returns the colour in OKLCH
 */
function xyzToOklchPolar(xyz: Xyz): PolarColor {
  return oklabToOklch(xyzToOklab(xyz));
}

/**
 * OKLCH to XYZ.
 * @param color - the colour in OKLCH
 * @returns the colour in XYZ (D65)
 * @throws {RangeError} when the hue is `null` but chroma isn't zero
 */
function oklchPolarToXyz(color: PolarColor): Xyz {
  return oklabToXyz(oklchToOklab(color));
}

/**
 * XYZ to CIE LCh (D65).
 * @param xyz - the colour in XYZ (D65)
 * @returns the colour in CIE LCh
 */
function xyzToLchPolar(xyz: Xyz): PolarColor {
  return labToLch(xyzToLab(xyz));
}

/**
 * CIE LCh (D65) to XYZ.
 * @param color - the colour in CIE LCh
 * @returns the colour in XYZ (D65)
 * @throws {RangeError} when the hue is `null` but chroma isn't zero
 */
function lchPolarToXyz(color: PolarColor): Xyz {
  return labToXyz(lchToLab(color));
}

/** CIE L* (D65), from XYZ's Y. The step-counting promise rests on it (ADR 0001). */
export const CIE_LSTAR: LightnessModel = { id: 'cie-lstar', lightnessOf: lstarOf };

/** OKLab lightness, scaled to 0 to 100. Used only to show what OKLCH alone would do. */
export const OKLAB_LIGHTNESS: LightnessModel = { id: 'oklab-l', lightnessOf: oklabLightnessOf };

/** OKLCH hue and chroma: they hold a colour's hue steadiest across a scale (ADR 0001). */
export const OKLCH: HueChromaModel = {
  id: 'oklch',
  whiteLightness: 1,
  fromXyz: xyzToOklchPolar,
  toXyz: oklchPolarToXyz,
};

/** CIE LCh (D65) hue and chroma. Used only to show what CIE LCh would do. */
export const CIE_LCH: HueChromaModel = {
  id: 'cie-lch',
  whiteLightness: 100,
  fromXyz: xyzToLchPolar,
  toXyz: lchPolarToXyz,
};

/** The recommended method: lightness from CIE L* (D65), hue and chroma from OKLCH (ADR 0001). */
export const HYBRID_METHOD: ColorMethod = {
  id: 'hybrid',
  lightness: CIE_LSTAR,
  hueChroma: OKLCH,
};

/** CIE LCh (D65) alone, for comparison (US-03). Vivid blues drift towards purple. */
export const CIE_LCH_METHOD: ColorMethod = {
  id: 'cie-lch',
  lightness: CIE_LSTAR,
  hueChroma: CIE_LCH,
};

/** OKLCH alone, for comparison (US-03). Contrast by step distance isn't reliable. */
export const OKLCH_METHOD: ColorMethod = {
  id: 'oklch',
  lightness: OKLAB_LIGHTNESS,
  hueChroma: OKLCH,
};

/** A colour as a method sees it. Hue is `null` for a grey. */
export interface MethodCoordinates extends ChromaHue {
  /** Lightness from the method's lightness model, 0 to 100. */
  lightness: number;
}

/**
 * Measures a colour the way a method sees it: its lightness, chroma and hue.
 * @param xyz - the colour in XYZ (D65)
 * @param method - the colour method; the recommended one if left out
 * @returns lightness from the lightness model, and chroma and hue from the hue model
 */
export function coordinatesOf(xyz: Xyz, method: ColorMethod = HYBRID_METHOD): MethodCoordinates {
  const { c, h } = method.hueChroma.fromXyz(xyz);
  return { lightness: method.lightness.lightnessOf(xyz), c, h };
}
