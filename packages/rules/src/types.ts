/**
 * @module types
 * TypeScript types for the rules file, written by hand and checked against the schema by Ajv's
 * `JSONSchemaType` (ADR 0006). The shape follows ADR 0005; D-048 records what CLR-7 added.
 *
 * Every rule carries a `reason`: a key into the app's language files, never the text itself
 * (D-035). A value that isn't decided yet carries a `placeholder` naming the ticket deciding it.
 */

/** A key into the language files, such as `rules.contrast.uses.bodyText.reason`. */
export type ReasonKey = string;

/** Marks a stand-in value: which ticket decides it, and what the stand-in is. */
export interface Placeholder {
  /** The Plane ticket that decides the value, such as `CLR-13`. */
  ticket: string;
  /** What the stand-in is and where it came from. */
  note: string;
}

/** Versions, so projects can say which rules made them (D-045). */
export interface Meta {
  /** Semantic version of these rules. 0.x while any placeholder remains. */
  rulesVersion: string;
  /** Version of the schema the file follows. */
  schemaVersion: number;
}

/** One step of a ladder. */
export interface LadderStep {
  /** The CIE L* (D65) the engine solves each colour to (ADR 0001). */
  lstar: number;
  /** The step's contrast grade, rounded for people (D-041, D-043). */
  grade: number;
}

/** A ladder preset: a shared set of lightness steps for every colour. */
export interface LadderPreset {
  /** Steps from lightest to darkest. */
  steps: LadderStep[];
  reason: ReasonKey;
  placeholder?: Placeholder;
}

/** Ladder presets, and which one is recommended (US-02). */
export interface Ladders {
  presets: Record<string, LadderPreset>;
  recommended: {
    /** The ID of the recommended preset. */
    preset: string;
    reason: ReasonKey;
    placeholder?: Placeholder;
  };
  /** Whether states (hover, pressed and so on) are ladder steps or overlays (CLR-13). */
  states: {
    reason: ReasonKey;
    placeholder?: Placeholder;
  };
}

/** A WCAG conformance level a project can target (D-030, D-044). */
export type Level = 'aa' | 'aaa';

/** A contrast requirement. */
export interface ContrastTarget {
  /** The WCAG 2 contrast ratio. Checks use this exact value (D-041). */
  ratio: number;
  /**
   * The same requirement as a grade difference, rounded up, for teaching (D-043). The stated
   * rule ("37, 50, 64 apart") is promised only for colouri.st's own steps; other colours, such
   * as a brand colour, are checked on the exact ratio (D-049).
   */
  grades: number;
}

/** What a use requires at each level, or in one context. */
export interface LevelTargets {
  aa: ContrastTarget;
  aaa: ContrastTarget;
}

/** Changes to a use's targets in one context. Levels left out keep the use's own targets. */
export interface ContextTargets {
  aa?: ContrastTarget;
  aaa?: ContrastTarget;
  placeholder?: Placeholder;
}

/**
 * A minimum separation from what a colour sits on, in grades, for uses WCAG sets no ratio for,
 * such as surfaces, hover and subtle borders. Keyed by level, then by context ID, because the
 * separation needed changes with context (the CLR-13 research found about twice as much in dark
 * mode as in light).
 */
export interface SeparationTargets {
  aa: Record<string, number>;
  aaa: Record<string, number>;
  placeholder?: Placeholder;
}

/**
 * A use: a job a colour does, such as body text, with its targets. A use has WCAG targets, or a
 * separation target where WCAG sets no ratio, but not both.
 */
export interface ContrastUse {
  /** The WCAG success criteria the targets come from, such as `1.4.3`. */
  wcag?: string[];
  /** WCAG 2 contrast targets, at both levels (D-044). */
  targets?: LevelTargets;
  /** A minimum separation in grades, where WCAG sets no ratio. */
  separation?: SeparationTargets;
  /** WCAG targets that differ in a context, keyed by context ID. */
  contexts?: Record<string, ContextTargets>;
  reason: ReasonKey;
  placeholder?: Placeholder;
}

/** A context a palette is used in, such as dark mode. */
export interface ContrastContext {
  reason: ReasonKey;
  placeholder?: Placeholder;
}

/** Contrast: the default level, contexts, and targets by use (US-07). */
export interface Contrast {
  defaultLevel: Level;
  /** An open list of contexts, keyed by ID. */
  contexts: Record<string, ContrastContext>;
  /** An open list of uses, keyed by ID; uses will grow beyond text and interface elements. */
  uses: Record<string, ContrastUse>;
  /** APCA targets, checked alongside WCAG 2 (ADR 0002, CLR-17). */
  apca: {
    /** Lc targets keyed by use ID. */
    targets?: Record<string, number>;
    reason: ReasonKey;
    placeholder?: Placeholder;
  };
}

/** A vividness preset (US-04). */
export interface VividnessPreset {
  /** The most of a colour's own chroma any step may keep, from 0 to 1. */
  ceiling: number;
  /** How much chroma the dark steps get back, from 0 to 1. */
  recovery: number;
  reason: ReasonKey;
  placeholder?: Placeholder;
}

/** Vividness presets, and the default preset for each group. */
export interface Vividness {
  presets: Record<string, VividnessPreset>;
  /** Preset ID keyed by group ID. */
  defaults: Record<string, string>;
}

/** A group of colours, such as the brand colours (D-025). */
export interface Group {
  /** Language-file key for the group's name. */
  nameKey: string;
  reason: ReasonKey;
  placeholder?: Placeholder;
}

/** A colour colouri.st can add, such as a default feedback colour (US-05). */
export interface PalettePreset {
  /** Language-file key for the colour's default name. */
  nameKey: string;
  /** The ID of the group it joins. */
  group: string;
  /** Its starting value, as six-digit hex. */
  value: string;
  reason: ReasonKey;
  placeholder?: Placeholder;
}

/** A colour difference two colours must keep. */
export interface SeparationRule {
  /** Which colour difference measures it. */
  metric: 'deltaE2000' | 'deltaEOk';
  /** The smallest difference allowed. */
  minimum: number;
  reason: ReasonKey;
  placeholder?: Placeholder;
}

/** A limit in degrees of hue. */
export interface HueRule {
  degrees: number;
  reason: ReasonKey;
  placeholder?: Placeholder;
}

/** Distinctness: how far apart colours' shades must stay (D-026, US-05, US-07). */
export interface Distinctness {
  betweenGroups: SeparationRule;
  withinGroup: SeparationRule;
  /** The allowance for the lightest and darkest steps, which carry little colour identity. */
  extremeSteps: {
    /** How many steps at each end get the allowance. */
    steps: number;
    /** The factor applied to the minimum there, from 0 to 1. */
    factor: number;
    reason: ReasonKey;
    placeholder?: Placeholder;
  };
  /** The early similar-hue warning on input (CLR-18). */
  similarHue: HueRule;
}

/** Hue: how far a colour's hue may drift across its scale (US-03). */
export interface Hue {
  maxDrift: HueRule;
}

/** A semantic token: a named job in the interface, mapped to a grade in each context (US-06). */
export interface SemanticToken {
  /** What the token is for, such as `text` or `border` (D-041). */
  purpose: string;
  /** The ID of the palette preset or brand colour it takes its colour from. */
  source: string;
  /** The contrast grade it uses, keyed by context ID. */
  grade: Record<string, number>;
  /** The ID of the token it sits on, if any. */
  on?: string;
  /** The ID of the use it must meet; none only for the page background, which sits on nothing. */
  use?: string;
  /** Overrides the project's level for this token (D-044). */
  target?: Level;
  /** The IDs of the states it has, such as `hover`. */
  states?: string[];
  reason: ReasonKey;
  placeholder?: Placeholder;
}

/** Naming of tokens and steps (US-08). */
export interface Naming {
  /** Which way grades count (D-042). */
  direction: {
    value: 'towardsDark' | 'towardsLight';
    reason: ReasonKey;
  };
  /** The token pattern, case and separator (D-027). */
  token: {
    /** A pattern with named parts, such as `{group}-{color}-{grade}`. */
    pattern: string;
    case: 'kebab' | 'camel' | 'snake';
    separator: '-' | '.' | '/' | '_';
    reason: ReasonKey;
    placeholder?: Placeholder;
  };
  /** Familiar step naming, such as Tailwind-style 50 to 950 (D-041). */
  presets: Record<
    string,
    {
      nameKey: string;
      /** The step names, from lightest to darkest. */
      steps: string[];
      reason: ReasonKey;
      placeholder?: Placeholder;
    }
  >;
}

/** Adaptive guidance (US-11). */
export interface Guidance {
  /** Full guidance comes back after this many months away from a stage. */
  refreshAfterMonths: number;
  reason: ReasonKey;
}

/** The whole rules file (ADR 0005). */
export interface Rules {
  /** The schema the file follows, for editors. */
  $schema?: string;
  meta: Meta;
  ladders: Ladders;
  contrast: Contrast;
  vividness: Vividness;
  groups: Record<string, Group>;
  palettePresets: Record<string, PalettePreset>;
  distinctness: Distinctness;
  hue: Hue;
  semantic: Record<string, SemanticToken>;
  naming: Naming;
  guidance: Guidance;
}
