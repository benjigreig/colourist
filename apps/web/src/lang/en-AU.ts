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
