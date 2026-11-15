/**
 * @module scales
 * Turns brand colours into families on the project's one ladder (CLR-14, D-002, D-054).
 *
 * Every family uses the same steps. Each step takes its CIE L* from the ladder and its OKLCH hue
 * from the source colour (D-012). Its chroma comes from the source's and the family's vividness
 * settings, recovery and ceiling (D-069), and it's then mapped into sRGB, keeping L* and hue and
 * reducing chroma only as far as the gamut needs (D-047). Vividness never moves L*, so it never
 * changes a contrast figure. Colours are taken as supplied: the source is never changed, a
 * near-grey keeps its hue however faint, and only a true grey has none (D-064).
 *
 * The types describe only the fields needed, so the engine doesn't depend on the rules package;
 * a recipe's ladder from `@colourist/rules` fits `ladder` as it is.
 */
import { xyzToLab } from './cielab.ts';
import { deltaE2000 } from './delta-e.ts';
import { mapToGamut, type MappedColor } from './gamut-mapping.ts';
import type { Rgb } from './gamut.ts';
import { contrastGrade } from './grade.ts';
import { OKLAB_ACHROMATIC_TOLERANCE, oklabToOklch, xyzToOklab, type Oklch } from './oklab.ts';
import { hueDifference } from './polar.ts';
import { formatHex, parseHex, relativeLuminance, srgbToXyz } from './srgb.ts';

/**
 * More chroma than any colour has in any gamut the engine maps to. Asking for it at a step's L*
 * and hue returns the most that fits, which is the step's maximum (D-069). OKLCH chroma tops out
 * near 0.32 in sRGB and 0.37 in Display P3.
 */
const UNREACHABLE_CHROMA = 1;

/**
 * Each step's most vivid colour, by L* and hue. It doesn't depend on the settings, so moving a
 * slider needn't search for it again. Cleared when full, which only costs a search per step.
 */
const maximumCache = new Map<string, MappedColor>();
/** The most kept: enough for a large palette on the longest ladder, several times over. */
const MAXIMUM_CACHE_SIZE = 10_000;

/**
 * The most vivid colour sRGB can show at an L* and OKLCH hue, from the CLR-12 gamut mapping
 * (D-047). Its chroma is the step's maximum (D-069).
 * @param lstar - the step's CIE L*
 * @param hue - the source's OKLCH hue
 * @returns the mapped colour at the most chroma that fits
 */
function mostVivid(lstar: number, hue: number): MappedColor {
  const key = `${lstar}|${hue}`;
  let color = maximumCache.get(key);
  if (color === undefined) {
    color = mapToGamut({ lightness: lstar, chroma: UNREACHABLE_CHROMA, hue });
    if (maximumCache.size >= MAXIMUM_CACHE_SIZE) maximumCache.clear();
    maximumCache.set(key, color);
  }
  return color;
}

/** The order a tie between limits is broken in: the settings people change first (D-072). */
const LIMIT_ORDER = ['ceiling', 'recovery', 'gamut'] as const;

/** What limits a step's chroma: recovery, the ceiling, or the screen's gamut (D-069). */
export type VividnessLimit = (typeof LIMIT_ORDER)[number];

/** Recovery and ceiling, each a share of what a step can show, from 0 to 1 (D-069). */
export interface VividnessSettings {
  /** Lifts each step's chroma from the source's own towards the step's maximum. 0 holds it. */
  recovery: number;
  /** Caps each step's chroma at this share of the step's maximum. 1 is no cap. */
  ceiling: number;
}

/** Where a setting came from: the group's preset, the group itself, or the colour (D-072). */
export type SettingSource = 'preset' | 'group' | 'color';

/** One vividness setting as applied, and where it came from. */
export interface AppliedSetting {
  value: number;
  from: SettingSource;
}

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
  /** Recovery or ceiling set for this colour alone, over its group's (D-069, D-072). */
  vividness?: Partial<VividnessSettings>;
}

/** A step of the project's ladder, as far as building scales needs it. */
export interface ScaleLadderStep {
  /** The step's name, its rounded contrast grade (D-041). */
  name: number;
  /** The CIE L* (D65) every family's step is solved to. */
  lstar: number;
}

/** The settings a group carries (D-066, D-072). */
export interface GroupSettings {
  /** The ID of the group's vividness preset, which gives its recovery and ceiling. */
  vividness: string;
  /** Recovery set for the group, over its preset's. */
  recovery?: number;
  /** Ceiling set for the group, over its preset's. */
  ceiling?: number;
}

/** What {@link generateScales} needs. */
export interface ScaleRequest {
  colors: readonly ScaleColor[];
  /** Settings keyed by group ID. Every colour's group must be here. */
  groups: Readonly<Record<string, GroupSettings>>;
  /** Vividness presets keyed by ID, such as the rules' `vividness.presets`. */
  presets: Readonly<Record<string, VividnessSettings>>;
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
  /**
   * The chroma asked of the gamut mapping: the ceiling's cap where that's the limit, and
   * otherwise what recovery gives, which the gamut may then reduce.
   */
  requestedChroma: number;
  /** True when chroma was reduced to fit sRGB. */
  reduced: boolean;
  /** The most chroma sRGB can show at this step's L* and the source's hue (D-069). */
  maximum: number;
  /** What limits this step's chroma, or null when the step can show no colour at all. */
  limit: VividnessLimit | null;
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

/** The vividness a family was built with, and what limits it (D-069, D-072). */
export interface FamilyVividness {
  /** The ID of the group's preset. */
  preset: string;
  recovery: AppliedSetting;
  ceiling: AppliedSetting;
  /**
   * What limits the most steps, so the interface can show that control first (US-04). A tie
   * goes to the ceiling, then recovery, then the gamut. Null when no step can show colour.
   */
  limit: VividnessLimit | null;
}

/** A brand colour's family. */
export interface Family {
  /** The colour as supplied, including its role and any settings, unchanged. */
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
  vividness: FamilyVividness;
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
 * @param request - the colours, the group settings, the presets, the ladder and the drift limit
 * @returns every family, with its steps, placement, drift and vividness, and the groups
 * @throws {RangeError} when a colour's value isn't valid hex, its group has no settings, a
 * group's preset doesn't exist, a recovery or ceiling is outside 0 to 1, two colours share an
 * ID, the ladder is empty or not light to dark, or the drift limit is negative
 */
export function generateScales(request: ScaleRequest): Palette {
  const { colors, groups, presets, ladder, maxDrift } = request;
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
    const vividness = resolveVividness(color, groups[color.group] as GroupSettings, presets);
    return buildFamily(color, vividness, ladder, maxDrift);
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
 * @param overrides - the person's changes by group ID: another preset, or a recovery or ceiling
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
    const { recovery, ceiling } = overrides[id] ?? {};
    out[id] = {
      vividness,
      ...(recovery === undefined ? {} : { recovery }),
      ...(ceiling === undefined ? {} : { ceiling }),
    };
  }
  return out;
}

/**
 * Works out a colour's recovery and ceiling: the colour's own if set, otherwise its group's,
 * otherwise its group's preset's (D-072).
 * @param color - the colour, with any settings of its own
 * @param group - its group's settings
 * @param presets - the vividness presets
 * @returns the settings applied, each with where it came from
 * @throws {RangeError} when the group's preset doesn't exist, or a setting is outside 0 to 1
 */
function resolveVividness(
  color: ScaleColor,
  group: GroupSettings,
  presets: Readonly<Record<string, VividnessSettings>>,
): Omit<FamilyVividness, 'limit'> {
  if (!Object.hasOwn(presets, group.vividness)) {
    throw new RangeError(
      `Group "${color.group}" uses vividness preset "${group.vividness}", which doesn't exist`,
    );
  }
  const preset = presets[group.vividness] as VividnessSettings;
  const pick = (key: keyof VividnessSettings): AppliedSetting => {
    const own = color.vividness?.[key];
    const applied: AppliedSetting =
      own !== undefined
        ? { value: own, from: 'color' }
        : group[key] !== undefined
          ? { value: group[key], from: 'group' }
          : { value: preset[key], from: 'preset' };
    if (!(applied.value >= 0 && applied.value <= 1)) {
      throw new RangeError(
        `Colour "${color.id}" has a ${key} of ${applied.value}, from its ${applied.from}; it must be from 0 to 1`,
      );
    }
    return applied;
  };
  return { preset: group.vividness, recovery: pick('recovery'), ceiling: pick('ceiling') };
}

/**
 * One step's chroma under D-069: the lower of what recovery gives and what the ceiling allows,
 * never above the step's maximum. Matches the Vividness Tuner's `stepChroma`.
 * @param source - the source's OKLCH chroma
 * @param maximum - the most chroma the step can show
 * @param settings - recovery and ceiling
 * @returns the chroma to ask the gamut mapping for, and what limits it, null when the step can
 * show no colour
 */
function stepChroma(
  source: number,
  maximum: number,
  settings: VividnessSettings,
): { request: number; limit: VividnessLimit | null } {
  const { recovery, ceiling } = settings;
  // The same as source + recovery × (maximum − source), written so recovery 1 gives exactly the
  // maximum rather than a rounding hair under it.
  const lifted = (1 - recovery) * source + recovery * maximum;
  const capped = ceiling * maximum;
  if (maximum <= OKLAB_ACHROMATIC_TOLERANCE) return { request: lifted, limit: null };
  if (capped < lifted && capped < maximum) return { request: capped, limit: 'ceiling' };
  // Ask for what recovery gives, even past the maximum, so the gamut mapping reduces it exactly
  // as it would with no settings at all.
  return { request: lifted, limit: lifted >= maximum ? 'gamut' : 'recovery' };
}

/**
 * The family's limit: whatever limits the most steps, with ties broken ceiling, then recovery,
 * then gamut (D-072).
 * @param steps - the family's steps
 * @returns the limit, or null when no step can show colour
 */
function familyLimit(steps: readonly FamilyStep[]): VividnessLimit | null {
  let best: VividnessLimit | null = null;
  let bestCount = 0;
  for (const limit of LIMIT_ORDER) {
    const count = steps.filter((step) => step.limit === limit).length;
    if (count > bestCount) {
      best = limit;
      bestCount = count;
    }
  }
  return best;
}

/**
 * Builds one colour's family: maps every ladder step, then measures placement and drift.
 * @param color - the colour as supplied
 * @param vividness - the colour's recovery and ceiling, and where they came from
 * @param ladder - the project's ladder
 * @param maxDrift - the hue drift limit
 * @returns the family
 * @throws {RangeError} when the colour's value isn't valid hex
 */
function buildFamily(
  color: ScaleColor,
  vividness: Omit<FamilyVividness, 'limit'>,
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

  const settings = { recovery: vividness.recovery.value, ceiling: vividness.ceiling.value };
  const mapped = ladder.map((step) => {
    // A true grey has no hue, so no chroma at all fits it.
    const vivid = oklch.h === null ? null : mostVivid(step.lstar, oklch.h);
    const maximum = vivid?.chroma ?? 0;
    const { request, limit } = stepChroma(oklch.c, maximum, settings);
    if (limit === 'gamut' && vivid !== null) {
      // The gamut is the limit, so the step is the most vivid colour, already found.
      const m = { ...vivid, requestedChroma: request, reduced: request > maximum };
      return { step, color: m, maximum, limit };
    }
    const m = mapToGamut({ lightness: step.lstar, chroma: request, hue: oklch.h });
    // Search precision can leave recovery a hair under a maximum the mapping then meets.
    return { step, color: m, maximum, limit: limit === 'recovery' && m.reduced ? 'gamut' : limit };
  });
  const steps: FamilyStep[] = mapped.map(({ step, color: m, maximum, limit }) => ({
    name: step.name,
    lstar: step.lstar,
    rgb: m.rgb,
    hex: formatHex(m.rgb),
    grade: contrastGrade(relativeLuminance(m.rgb)),
    chroma: m.chroma,
    requestedChroma: m.requestedChroma,
    reduced: m.reduced,
    maximum,
    limit,
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
    vividness: { ...vividness, limit: familyLimit(steps) },
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
