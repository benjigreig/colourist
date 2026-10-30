/**
 * @module @colourist/engine
 * The colouri.st engine: pure TypeScript colour maths, with no interface or framework code
 * (D-010). It reads the method from `@colourist/rules` and returns results that carry their
 * reasoning, so the guided app and AI tools can both explain them (D-019).
 *
 * Colour conversions and gamut mapping (CLR-12) follow ADR 0001 and D-047.
 */
export { D65_WHITE, type Xyz } from './xyz.ts';
export { GAMUT_TOLERANCE, clampChannels, isInGamut, type Gamut, type Rgb } from './gamut.ts';
export {
  SRGB,
  formatHex,
  linearToSrgb,
  parseHex,
  relativeLuminance,
  srgbToLinear,
  srgbToXyz,
  xyzToSrgb,
} from './srgb.ts';
export { hueDifference, type ChromaHue } from './polar.ts';
export {
  LAB_ACHROMATIC_TOLERANCE,
  labToLch,
  labToXyz,
  lchToLab,
  lstarFromY,
  xyzToLab,
  yFromLstar,
  type Lab,
  type Lch,
} from './cielab.ts';
export {
  OKLAB_ACHROMATIC_TOLERANCE,
  oklabToOklch,
  oklabToXyz,
  oklchToOklab,
  xyzToOklab,
  type Oklab,
  type Oklch,
} from './oklab.ts';
export { srgbToHsl, type Hsl } from './hsl.ts';
export { deltaE2000, deltaEOk } from './delta-e.ts';
export { contrastGrade, gradesForRatio } from './grade.ts';
export {
  chooseRecipe,
  type ChoiceDefault,
  type RecipeChoice,
  type RecipeChoiceResult,
  type RecipeOption,
  type RecipeQuestion,
} from './recipe.ts';
export {
  CIE_LCH,
  CIE_LCH_METHOD,
  CIE_LSTAR,
  HYBRID_METHOD,
  OKLAB_LIGHTNESS,
  OKLCH,
  OKLCH_METHOD,
  coordinatesOf,
  type ColorMethod,
  type HueChromaModel,
  type LightnessModel,
  type MethodCoordinates,
  type PolarColor,
} from './model.ts';
export {
  mapToGamut,
  type ColorTarget,
  type MapOptions,
  type MappedColor,
} from './gamut-mapping.ts';
