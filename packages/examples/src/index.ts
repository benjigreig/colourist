/**
 * @module @colourist/examples
 * The invented example brands, Doggly, Kerfwell and Sorrel, as data for demos, tests and
 * "Try an example" (US-01, CLR-9, D-067). The stories behind them, and what each one tests, are
 * in `docs/example-brands.md`. Any resemblance to a real business is unintended.
 *
 * Each colour is a name, a group and a starting value (D-025), plus a role that the engine
 * carries but never acts on. Values are kept exactly as supplied (D-064). Brand descriptions are
 * text people read, so they belong in the language files, not here.
 */

/** A colour's role in its brand. Carried with the colour; the engine attaches no meaning to it. */
export type ExampleRole = 'primary' | 'secondary' | 'tertiary';

/** One colour of an example brand, in the shape the engine takes. */
export interface ExampleColor {
  /** A stable ID, unique within the brand. */
  id: string;
  name: string;
  /** The group it belongs to. Every example colour is a brand colour. */
  group: 'brand';
  role: ExampleRole;
  /** The hex value, as supplied. */
  value: string;
}

/** An invented example brand. */
export interface ExampleBrand {
  /** A stable ID. */
  id: string;
  name: string;
  colors: readonly ExampleColor[];
}

/** Doggly: the saturated brand, with Neon pink near the edge of sRGB. */
export const doggly: ExampleBrand = {
  id: 'doggly',
  name: 'Doggly',
  colors: [
    { id: 'verdigris', name: 'Verdigris', group: 'brand', role: 'primary', value: '#1b998b' },
    { id: 'neonPink', name: 'Neon pink', group: 'brand', role: 'secondary', value: '#ff297b' },
    { id: 'dustyGrape', name: 'Dusty grape', group: 'brand', role: 'secondary', value: '#53599a' },
    {
      id: 'tangerineDream',
      name: 'Tangerine dream',
      group: 'brand',
      role: 'secondary',
      value: '#ff9b71',
    },
  ],
};

/** Kerfwell: a strong primary, with a near-black and a faintly pink near-white of its own. */
export const kerfwell: ExampleBrand = {
  id: 'kerfwell',
  name: 'Kerfwell',
  colors: [
    { id: 'brickRed', name: 'Brick red', group: 'brand', role: 'primary', value: '#bb0a21' },
    {
      id: 'airForceBlue',
      name: 'Air Force blue',
      group: 'brand',
      role: 'secondary',
      value: '#4b88a2',
    },
    { id: 'monoDark', name: 'Mono dark', group: 'brand', role: 'tertiary', value: '#252627' },
    { id: 'monoLight', name: 'Mono light', group: 'brand', role: 'tertiary', value: '#fff9fb' },
  ],
};

/** Sorrel: the pastel stress test, with two pairs of close hues. */
export const sorrel: ExampleBrand = {
  id: 'sorrel',
  name: 'Sorrel',
  colors: [
    { id: 'pinkMist', name: 'Pink mist', group: 'brand', role: 'primary', value: '#d991ba' },
    { id: 'sageGreen', name: 'Sage green', group: 'brand', role: 'secondary', value: '#60992d' },
    { id: 'mutedOlive', name: 'Muted olive', group: 'brand', role: 'secondary', value: '#8cae68' },
    { id: 'pinkOrchid', name: 'Pink orchid', group: 'brand', role: 'tertiary', value: '#ebb9df' },
    { id: 'petalFrost', name: 'Petal frost', group: 'brand', role: 'tertiary', value: '#f5d5ed' },
  ],
};

/** Every example brand, in the order they're offered. */
export const exampleBrands: readonly ExampleBrand[] = [doggly, kerfwell, sorrel];
