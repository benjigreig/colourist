/**
 * @module lang/en-AU
 * Australian English text for the interface. Every string people read lives in a language
 * file, never in a component (D-035, CLR-78).
 *
 * The file format is a placeholder until the language files are designed in CLR-78.
 */

/** A point on the placeholder page: a short bold lead, then the sentence that explains it. */
export interface Point {
  /** The bold lead-in. */
  lead: string;
  /** The sentence that follows it. */
  body: string;
}

/** Text for the coming-soon placeholder page (CLR-1). Approved by Benji, 29 Oct 2026. */
export const placeholder = {
  title: 'colouri.st: accessible colour systems from your brand colours',
  description:
    "colouri.st turns your brand's colours into an accessible colour system for your product, explaining the colour theory at each step.",
  name: 'colouri.st',
  tagline: 'Brand colours are chosen for logos. Your product needs a colour system.',
  intro:
    "colouri.st turns your brand's colours into an accessible colour system for your product, explaining the colour theory at each step.",
  points: [
    {
      lead: 'Accessible from the first shade.',
      body: 'Contrast is built into how every shade is made, not checked at the end.',
    },
    {
      lead: 'The why, not just the values.',
      body: 'Each step explains its reasoning, so you can adjust your palette and defend it.',
    },
    {
      lead: 'Free, open and private.',
      body: 'Open source, and it runs entirely in your browser. Your colours never leave it, and nothing tracks you.',
    },
  ] satisfies Point[],
  statistic: 'Low-contrast text is on 83.9% of the top million home pages.',
  statisticSource: { label: 'WebAIM Million, 2026', href: 'https://webaim.org/projects/million/' },
  status: 'Beta coming in December 2026.',
  repository: { label: 'Follow along on GitHub', href: 'https://github.com/benjigreig/colourist' },
} as const;

/**
 * The reasoning behind each rule, and the names rules give things, keyed as the rules file
 * refers to them (ADR 0005). A rule's `reason` key, such as `rules.contrast.uses.bodyText.reason`,
 * is a path into this object.
 *
 * Draft: every entry is first-pass text awaiting Benji's `[content]` review (D-034), and none is
 * approved yet. Text for a rule that's still a placeholder says
 * which ticket decides it, and is replaced when the rule is.
 */
export const rules = {
  ladders: {
    steps11: { reason: 'Placeholder: CLR-13 decides the 11-step ladder.' },
    steps13: { reason: 'Placeholder: CLR-13 decides the 13-step ladder.' },
    steps15: { reason: 'Placeholder: CLR-13 decides the 15-step ladder.' },
    recommended: { reason: 'Placeholder: CLR-13 decides which ladder is recommended, and why.' },
    states: { reason: 'Placeholder: CLR-13 decides whether states are ladder steps or overlays.' },
  },
  contrast: {
    contexts: {
      light: {
        reason: 'Most interfaces are read on a light background, so every colour is checked there.',
      },
      dark: {
        reason:
          'Dark mode reverses the background, so every colour is checked against a dark one too.',
      },
      moreContrast: {
        reason:
          'Placeholder: CLR-13 decides whether there is a more-contrast version, and its targets.',
      },
    },
    uses: {
      bodyText: {
        reason:
          'Body text needs 4.5:1 against its background to meet AA, and 7:1 for AAA, so people with low vision can read it (WCAG 1.4.3 and 1.4.6).',
      },
      largeText: {
        reason:
          'Large text is easier to read, so it needs 3:1 to meet AA and 4.5:1 for AAA (WCAG 1.4.3 and 1.4.6).',
      },
      surface: {
        reason:
          'Placeholder: CLR-13 decides how far a surface must stand out from what it sits on.',
      },
      hover: {
        reason:
          'Placeholder: CLR-13 decides how far a hover state must stand out from what it sits on.',
      },
      subtleBorder: {
        reason:
          'Placeholder: CLR-13 decides how far a subtle border must stand out from what it sits on.',
      },
      interfaceElement: {
        reason:
          'Controls, focus indicators and graphics need 3:1 against what is next to them. WCAG has no AAA level for these (WCAG 1.4.11).',
      },
    },
    apca: { reason: 'Placeholder: CLR-17 decides the APCA targets.' },
  },
  vividness: {
    hold: { reason: 'Placeholder: CLR-15 decides the vividness presets.' },
  },
  groups: {
    brand: {
      name: 'Brand colours',
      reason:
        'Your brand colours are the starting point, so the system is built from the whole brand.',
    },
    feedback: { name: 'Feedback colours', reason: 'Placeholder: CLR-3 decides the feedback set.' },
    neutral: { name: 'Neutrals', reason: 'Placeholder: CLR-3 decides the neutral colours.' },
  },
  palettePresets: {
    neutral: { name: 'Neutral', reason: 'Placeholder: CLR-3 decides the neutral colours.' },
    error: { name: 'Error', reason: 'Placeholder: CLR-3 decides the feedback set.' },
    warning: { name: 'Warning', reason: 'Placeholder: CLR-3 decides the feedback set.' },
    success: { name: 'Success', reason: 'Placeholder: CLR-3 decides the feedback set.' },
    info: { name: 'Info', reason: 'Placeholder: CLR-3 decides the feedback set.' },
  },
  distinctness: {
    betweenGroups: {
      reason: 'Placeholder: CLR-16 decides how far apart colours in different groups must stay.',
    },
    withinGroup: {
      reason: 'Placeholder: CLR-16 decides how far apart colours in the same group must stay.',
    },
    extremeSteps: {
      reason: 'Placeholder: CLR-16 decides the allowance for the lightest and darkest steps.',
    },
    similarHue: { reason: 'Placeholder: CLR-18 decides when two hues are too similar.' },
  },
  hue: {
    maxDrift: {
      reason: "Placeholder: CLR-14 decides how far a colour's hue may drift across its scale.",
    },
  },
  semantic: {
    surfaceDefault: { reason: 'Placeholder: CLR-27 decides the semantic tokens.' },
    surfaceRaised: { reason: 'Placeholder: CLR-27 decides the semantic tokens.' },
    textBody: { reason: 'Placeholder: CLR-27 decides the semantic tokens.' },
    borderControl: { reason: 'Placeholder: CLR-27 decides the semantic tokens.' },
  },
  naming: {
    direction: {
      reason:
        'Grades count up towards dark, as familiar shade names do, so 0 is white and 100 is black.',
    },
    token: { reason: 'Placeholder: CLR-72 decides the token pattern, case and separator.' },
    presets: {
      hundreds: { name: '50 to 950', reason: 'Placeholder: CLR-72 decides the naming presets.' },
      oneToTwelve: { name: '1 to 12', reason: 'Placeholder: CLR-72 decides the naming presets.' },
    },
  },
  guidance: {
    reason:
      'After three months away from a stage, its full explanation comes back, in case you have forgotten the details.',
  },
} as const;
