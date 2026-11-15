/**
 * @module scales
 * Turns brand colours into families on the project's one ladder (CLR-14, D-002, D-054).
 *
 * Every family uses the same steps. Each step takes its CIE L* from the ladder and its OKLCH hue
 * and chroma from the source colour (D-012), then is mapped into sRGB, keeping L* and hue and
 * reducing chroma only as far as the gamut needs (D-047). Colours are taken as supplied: a
 * near-grey keeps its hue however faint, and only a true grey has none (D-064).
 *
 * The types describe only the fields needed, so the engine doesn't depend on the rules package;
 * a recipe's ladder from `@colourist/rules` fits `ladder` as it is.
 */
import { xyzToLab } from './cielab.ts';
import { deltaE2000 } from './delta-e.ts';
import { mapToGamut } from './gamut-mapping.ts';
import type { Rgb } from './gamut.ts';
import { contrastGrade } from './grade.ts';
import { oklabToOklch, xyzToOklab, type Oklch } from './oklab.ts';
import { hueDifference } from './polar.ts';
import { formatHex, parseHex, relativeLuminance, srgbToXyz } from './srgb.ts';

/**
 * The chroma each step asks for is the source's own, at every step, until the vividness curve
 * is decided (CLR-15). Gamut mapping then reduces it where sRGB can't hold it. Every family's
 * result carries this marker, so nothing downstream mistakes it for the method.
 */
export const CHROMA_STAND_IN = {
  ticket: 'CLR-15',
  note: "Each step asks for the source's own chroma, reduced only to fit sRGB. The vividness curve is decided in CLR-15.",
} as const;

/** A colour as the person supplied it: a name, a group and a starting value (D-025). */
export interface ScaleColor {
  /** A stable ID, unique in the project. */
  id: string;
  name: string;
  /** The ID of the group it belongs to. */
  group: string;
  /** Its starting value, as hex text. Kept exactly as supplied. */
  value: string;
  /** Its role, such as primary. Carried with the colour; the engine never acts on it (D-025). */
  role?: string;
}

/** A step of the project's ladder, as far as building scales needs it. */
export interface ScaleLadderStep {
  /** The step's name, its rounded contrast grade (D-041). */
  name: number;
  /** The CIE L* (D65) every family's step is solved to. */
  lstar: number;
}

/** The settings a group carries (D-066). */
export interface GroupSettings {
  /** The ID of the group's vividness preset. Reported, but applied only from CLR-15. */
  vividness: string;
}

/** What {@link generateScales} needs. */
export interface ScaleRequest {
  colors: readonly ScaleColor[];
  /** Settings keyed by group ID. Every colour's group must be here. */
  groups: Readonly<Record<string, GroupSettings>>;
  /** The project's ladder: the chosen recipe's steps for the project's target, light to dark. */
  ladder: readonly ScaleLadderStep[];
  /** The most hue drift allowed, as a chroma-weighted hue difference in OKLab units (D-065). */
  maxDrift: number;
}

/** One step of a family. */
export interface FamilyStep {
  /** The ladder step's name. */
  name: number;
  /** The ladder's CIE L*, which the step sits at exactly. */
  lstar: number;
  /** The exact colour, in sRGB, before rounding to hex. Checks use this (D-041). */
  rgb: Rgb;
  /** The colour as six-digit hex, as people will use it. */
  hex: string;
  /** The exact contrast grade, from WCAG 2 relative luminance. */
  grade: number;
  /** The chroma achieved, in OKLCH. */
  chroma: number;
  /** The chroma asked for, which is the stand-in for now ({@link CHROMA_STAND_IN}). */
  requestedChroma: number;
  /** True when chroma was reduced to fit sRGB. */
  reduced: boolean;
}

/** Where a source colour lands on its family's ladder (US-02). */
export interface Placement {
  /** The name of the nearest step by contrast grade. The lighter step wins a tie. */
  step: number;
  /** The source's grade minus the step's: positive when the source is darker. */
  grades: number;
  /** ΔE 2000 between the source and that step, in CIE Lab (D65). */
  deltaE: number;
}

/** How far a family's hue drifts across its steps, after rounding to hex (US-03, D-065). */
export interface Drift {
  /** The worst chroma-weighted hue difference, in OKLab units, or null when nothing has a hue. */
  hueDifference: number | null;
  /** The step where the worst hue difference is. */
  hueDifferenceStep: number | null;
  /** The worst hue angle, in degrees, so the interface can describe it in familiar terms. */
  degrees: number | null;
  /** The step where the worst angle is. */
  degreesStep: number | null;
  /** True when the worst hue difference is within the rules' limit. */
  withinThreshold: boolean;
}

/** A brand colour's family. */
export interface Family {
  /** The colour as supplied, including its role, unchanged. */
  color: ScaleColor;
  /** The source colour, measured. */
  source: {
    rgb: Rgb;
    /** CIE L* (D65). */
    lstar: number;
    /** Exact contrast grade. */
    grade: number;
    /** OKLCH chroma and hue. Hue is null only for a true grey (D-047). */
    oklch: Oklch;
  };
  /** One step per ladder step, light to dark. */
  steps: FamilyStep[];
  placement: Placement;
  drift: Drift;
  /** Marks the chroma at each step as a stand-in until CLR-15. */
  chroma: { placeholder: typeof CHROMA_STAND_IN };
}

/** A group, its settings, and the IDs of its colours, in the order supplied. */
export interface ScaleGroup {
  id: string;
  settings: GroupSettings;
  colors: string[];
}

/** Every family, and the groups they belong to. */
export interface Palette {
  /** One family per colour, in the order supplied. */
  families: Family[];
  /** Each group that has colours, in the order its first colour was supplied. */
  groups: ScaleGroup[];
}

/**
 * Builds a family for each brand colour on one shared ladder.
 * @param request - the colours, the group settings, the ladder and the hue drift limit
 * @returns every family, with its steps, placement and drift, and the groups
 * @throws {RangeError} when a colour's value isn't valid hex, its group has no settings, two
 * colours share an ID, the ladder is empty or not light to dark, or the drift limit is negative
 */
export function generateScales(request: ScaleRequest): Palette {
  const { colors, groups, ladder, maxDrift } = request;
  if (ladder.length === 0) throw new RangeError('The ladder has no steps');
  ladder.forEach((step, i) => {
    const previous = ladder[i - 1];
    if (previous && !(step.lstar < previous.lstar)) {
      throw new RangeError(`The ladder must run from light to dark, but step ${step.name} doesn't`);
    }
  });
  if (!(maxDrift >= 0))
    throw new RangeError(`The drift limit must be zero or more, not ${maxDrift}`);

  const ids = new Set<string>();
  const byGroup = new Map<string, string[]>();
  const families = colors.map((color) => {
    if (ids.has(color.id)) throw new RangeError(`Two colours share the ID "${color.id}"`);
    ids.add(color.id);
    if (!Object.hasOwn(groups, color.group)) {
      throw new RangeError(
        `Colour "${color.id}" is in group "${color.group}", which has no settings`,
      );
    }
    byGroup.set(color.group, [...(byGroup.get(color.group) ?? []), color.id]);
    return buildFamily(color, ladder, maxDrift);
  });

  return {
    families,
    groups: [...byGroup].map(([id, members]) => ({
      id,
      settings: { ...(groups[id] as GroupSettings) },
      colors: members,
    })),
  };
}

/**
 * Settings for each group: the rules' defaults, with any of the person's overrides on top.
 * @param defaults - the default vividness preset ID for each group, from the rules
 * @param overrides - the person's changes, by group ID
 * @returns settings for every group in `defaults`, or in `overrides`
 * @throws {RangeError} when an overridden group has no vividness preset at all
 */
export function groupSettings(
  defaults: Readonly<Record<string, string>>,
  overrides: Readonly<Record<string, Partial<GroupSettings>>> = {},
): Record<string, GroupSettings> {
  const out: Record<string, GroupSettings> = {};
  for (const id of new Set([...Object.keys(defaults), ...Object.keys(overrides)])) {
    const vividness = overrides[id]?.vividness ?? defaults[id];
    if (vividness === undefined) throw new RangeError(`Group "${id}" has no vividness preset`);
    out[id] = { vividness };
  }
  return out;
}

/**
 * Builds one colour's family: maps every ladder step, then measures placement and drift.
 * @param color - the colour as supplied
 * @param ladder - the project's ladder
 * @param maxDrift - the hue drift limit
 * @returns the family
 * @throws {RangeError} when the colour's value isn't valid hex
 */
function buildFamily(
  color: ScaleColor,
  ladder: readonly ScaleLadderStep[],
  maxDrift: number,
): Family {
  const rgb = parseHex(color.value);
  if (rgb === null)
    throw new RangeError(`Colour "${color.id}" has a value that isn't hex: ${color.value}`);
  const xyz = srgbToXyz(rgb);
  const oklch = oklabToOklch(xyzToOklab(xyz));
  const lab = xyzToLab(xyz);
  const source = { rgb, lstar: lab.l, grade: contrastGrade(relativeLuminance(rgb)), oklch };

  const mapped = ladder.map((step) => ({
    step,
    color: mapToGamut({ lightness: step.lstar, chroma: oklch.c, hue: oklch.h }),
  }));
  const steps: FamilyStep[] = mapped.map(({ step, color: m }) => ({
    name: step.name,
    lstar: step.lstar,
    rgb: m.rgb,
    hex: formatHex(m.rgb),
    grade: contrastGrade(relativeLuminance(m.rgb)),
    chroma: m.chroma,
    requestedChroma: m.requestedChroma,
    reduced: m.reduced,
  }));

  // The nearest step by grade; with `<`, the lighter of two equally near steps is kept.
  let nearest = 0;
  steps.forEach((step, i) => {
    const best = steps[nearest] as FamilyStep;
    if (Math.abs(step.grade - source.grade) < Math.abs(best.grade - source.grade)) nearest = i;
  });
  const near = mapped[nearest] as (typeof mapped)[number];
  const placement: Placement = {
    step: (steps[nearest] as FamilyStep).name,
    grades: source.grade - (steps[nearest] as FamilyStep).grade,
    deltaE: deltaE2000(lab, xyzToLab(near.color.xyz)),
  };

  return {
    color: { ...color },
    source,
    steps,
    placement,
    drift: measureDrift(oklch.h, steps, maxDrift),
    chroma: { placeholder: CHROMA_STAND_IN },
  };
}

/**
 * Measures hue drift on each step as people will use it, rounded to hex, against the source's
 * hue. The hue difference weights the angle by chroma, ΔH = 2·√(C₁·C₂)·sin(Δh/2), between the
 * step's mapped chroma and its rounded chroma (D-065). Steps whose rounded colour has no hue,
 * such as the white page, are skipped.
 * @param sourceHue - the source's OKLCH hue, or null for a true grey
 * @param steps - the family's steps
 * @param maxDrift - the hue drift limit
 * @returns the worst hue difference and angle, where each is, and whether it's within the limit
 */
function measureDrift(
  sourceHue: number | null,
  steps: readonly FamilyStep[],
  maxDrift: number,
): Drift {
  const drift: Drift = {
    hueDifference: null,
    hueDifferenceStep: null,
    degrees: null,
    degreesStep: null,
    withinThreshold: true,
  };
  if (sourceHue === null) return drift;
  for (const step of steps) {
    // parseHex can't fail on formatHex's output.
    const rounded = oklabToOklch(xyzToOklab(srgbToXyz(parseHex(step.hex) as Rgb)));
    if (rounded.h === null) continue;
    const angle = Math.abs(hueDifference(sourceHue, rounded.h));
    const difference =
      2 * Math.sqrt(step.chroma * rounded.c) * Math.sin(((angle / 2) * Math.PI) / 180);
    if (drift.hueDifference === null || difference > drift.hueDifference) {
      drift.hueDifference = difference;
      drift.hueDifferenceStep = step.name;
    }
    if (drift.degrees === null || angle > drift.degrees) {
      drift.degrees = angle;
      drift.degreesStep = step.name;
    }
  }
  drift.withinThreshold = (drift.hueDifference ?? 0) <= maxDrift;
  return drift;
}
