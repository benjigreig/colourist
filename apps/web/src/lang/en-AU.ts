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
  questions: {
    activities: { label: 'What will people do with it?' },
    structure: { label: 'How is it put together?' },
    viewing: { label: 'Where and how will it be seen?' },
    choices: {
      read: {
        label: 'Read content',
        example: 'Placeholder: CLR-94 designs this modelled example.',
        reason: 'Every product has text on a page, so this is always on.',
      },
      controls: {
        label: 'Use buttons, inputs and other controls',
        example: 'Placeholder: CLR-94 designs this modelled example.',
        reason:
          'Controls need hover and pressed states and a visible border, which add steps near the page.',
      },
      selection: {
        label: 'Pick items from lists or tables',
        example: 'Placeholder: CLR-94 designs this modelled example.',
        reason:
          'A selected item needs its own shade near the page, so it can be told apart from hover.',
      },
      charts: {
        label: 'See data in charts',
        example: 'Placeholder: CLR-94 designs this modelled example.',
        reason:
          'Charts need a lighter partner for each colour, in the band between the light page and the contrast steps.',
      },
      plainPage: {
        label: 'Content on a plain page',
        example: 'Placeholder: CLR-94 designs this modelled example.',
        reason: 'Every product has a page, so this is always on.',
      },
      cards: {
        label: 'Cards or panels',
        example: 'Placeholder: CLR-94 designs this modelled example.',
        reason: 'A card on the page needs a surface that stands just apart from it.',
      },
      overlays: {
        label: 'Menus, dialogs or popovers on top',
        example: 'Placeholder: CLR-94 designs this modelled example.',
        reason: 'Things layered on top need a second surface, so each layer reads as separate.',
      },
      lightTheme: {
        label: 'A light theme',
        example: 'Placeholder: CLR-94 designs this modelled example.',
        reason: 'A light theme needs fine steps near the white page.',
      },
      darkTheme: {
        label: 'A dark theme',
        example: 'Placeholder: CLR-94 designs this modelled example.',
        reason:
          'A dark theme needs fine steps near the dark page, about twice as far apart, because dark tones are harder to tell apart.',
      },
      followDevice: {
        label: "Following the device's setting",
        example: 'Placeholder: CLR-94 designs this modelled example.',
        reason: 'Following the device means people see either theme, so both are built.',
      },
      highContrast: {
        label: 'A high-contrast version',
        example: 'Placeholder: CLR-94 designs this modelled example.',
        reason: 'A high-contrast version needs wider separations in both themes.',
      },
      brightLight: {
        label: 'Often used in bright light',
        example: 'Placeholder: CLR-94 designs this modelled example.',
        reason:
          'Bright surroundings wash out small differences, so the steps near the light page spread further apart.',
      },
      moreContrastPeople: {
        label: 'By people who need more contrast',
        example: 'Placeholder: CLR-94 designs this modelled example.',
        reason:
          'People with low vision need more contrast, so this suggests AAA and widens the separations near each page.',
      },
    },
  },
  recipes: {
    contentLight: {
      name: 'Content site, light',
      reason: 'For reading, with controls, in a light theme only.',
    },
    contentLightDark: {
      name: 'Content site, light and dark',
      reason: 'For reading, with controls, in light and dark themes.',
    },
    simpleAppLightDark: {
      name: 'Simple app, light and dark',
      reason: 'Adds cards or panels to a content site, in light and dark themes.',
    },
    layeredAppLightDark: {
      name: 'Layered app, light and dark',
      reason:
        'Reading, controls, cards and things layered on top, in light and dark themes. This is the most common shape among established design systems, so it is the default.',
    },
    appLight: {
      name: 'App with overlays and selection, light',
      reason: 'Adds selectable lists or tables to a layered app, in a light theme only.',
    },
    appLightDark: {
      name: 'App with overlays and selection, light and dark',
      reason: 'Adds selectable lists or tables to a layered app, in light and dark themes.',
    },
  },
  ladders: {
    zones: {
      lightBackground: {
        reason:
          'Near the light page, steps are close together, because small differences are easiest to see next to the background.',
      },
      contrast: {
        reason:
          'Through the middle, steps sit 37, 50 and 64 grades from each page, where text and borders reach 3:1, 4.5:1 and 7:1.',
      },
      darkBackground: {
        reason: 'Placeholder: CLR-98 decides how much further apart steps are near the dark page.',
      },
    },
    minimumGap: {
      reason:
        'No two steps are closer than 1 grade, about the smallest difference design systems use near the page.',
    },
    uses: {
      page: { name: 'Page' },
      surface: { name: 'Surface' },
      sunken: { name: 'Second surface' },
      hover: { name: 'Hover' },
      pressed: { name: 'Pressed' },
      selected: { name: 'Selected' },
      subtleBorder: { name: 'Subtle border' },
      controlBorder: { name: 'Control border' },
      mutedText: { name: 'Muted text' },
      text: { name: 'Text' },
      tint: { name: 'Tint' },
      tintBorder: { name: 'Tint border' },
      fill: { name: 'Fill' },
      fillHover: { name: 'Fill hover' },
      fillPressed: { name: 'Fill pressed' },
    },
    states: {
      reason:
        'Hover, pressed and selected are solid steps on the ladder, worked out from the colour they change, so each one can be checked on every surface it sits on.',
    },
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
    styles: {
      neutral: {
        name: 'Neutral',
        reason: 'Placeholder: CLR-15 decides what the neutral style changes.',
      },
      tinted: {
        name: 'Tinted',
        reason: 'Placeholder: CLR-15 decides what the tinted style changes.',
      },
      vivid: { name: 'Vivid', reason: 'Placeholder: CLR-15 decides what the vivid style changes.' },
    },
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
