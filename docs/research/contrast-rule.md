# The contrast rule colouri.st states

> Researched 29 October 2026 for CLR-13, question 4 of 4: which contrast rule colouri.st states to people. Decided the same day (D-049). Scripts and outputs: [`contrast-rule/`](contrast-rule/). Related: [`ladder-distribution.md`](ladder-distribution.md), [`step-naming.md`](step-naming.md).

## Question

What rule should colouri.st give people for choosing colour pairs that meet contrast? A difference between step names, a count of steps, a table, or something else? And how should the rule be worded, given that people see rounded names?

### Why this came first

Of CLR-13's four open questions, this one depends on almost nothing, and the others depend on it:

- A step-count rule only works on a ladder whose steps are evenly spaced in contrast, so choosing one would fix the ladder's shape before uses are considered.
- A grade rule holds on any ladder, which leaves the shape free to follow uses and contexts.

The order Benji agreed:
1. This question.
2. How states are made.
3. How the ladder is derived.
4. How many steps there are, and when each ladder is recommended.

## How design systems state their rule

| Approach | Who | How it works | Holds on an uneven ladder? |
|---|---|---|---|
| A difference between names | USWDS's "magic number": 40+ for AA large text, 50+ for AA, 70+ for AAA | Subtract two grades | Yes. USWDS gives each grade a band of luminance, with a margin |
| A difference in lightness, by size | Material: "smaller elements (less than ¼" or 40 dp) require a tone difference of 50 with their background, larger elements require a tone difference of 40" (O'Leary, 2022) | Subtract two tones (CIE L\*) | Nearly. See below |
| A count of steps | Stripe: "at least five levels apart" for small text, four for icons and large text | Count steps | Only because Stripe spaced its levels evenly |
| A lookup table | IBM Carbon: "the minimum number of steps required to achieve commonly used contrast ratios between any two colors" | Look up the pair | Yes, but it has to be looked up |
| Pre-paired tokens | Radix (text steps 11 and 12 are "guaranteed to Lc 60 and Lc 90 APCA contrast ratio on top of a step 2 background"), Spectrum (text tokens meet contrast on its background layers), Primer, Atlassian | Pick the right tokens; the system guarantees the pairs | Yes, and needs no rule |
| Contrast against one background | Leonardo | Each step is defined by its ratio against the page | Only for pairs that include the page |

### Material's tone rule, tested

Tone is CIE L\*. Equal steps in lightness aren't equal steps in contrast, so a lightness difference can only approximate a ratio:

- **A tone difference of 40 always gives at least 3:1.** The worst pair is tones 60 and 100, at 3.17:1.
- **A tone difference of 50 doesn't always give 4.5:1.** The worst pair is tones 50 and 100, at 4.48:1. It takes 50.2 to hold everywhere.

colouri.st's contrast grades are built so a difference gives the ratio exactly (D-041). That's why its rule can be exact where Material's is approximate.

## What the research says

- **People know the rules but don't apply them.**
  - About two-thirds of designers know the accessible-colour guidelines, but only about a third apply them (cited in Siu et al.).
  - Checking by hand with a colour-picker contrast checker, people sometimes checked the wrong colours or only parts of a design. They got 71% of elements passing, against 100% with checks built into the tool (Siu et al.).
  - Low-contrast text is the most common failure on the web, on 83.9% of the top million home pages (WebAIM, 2026).
  - This favours guarantees and built-in checks over rules applied by hand.
- **Tools shape what designers attend to.** Repeated warnings frustrated some participants (He and McNutt), so checks should stay quiet when things pass.
- **People misread logarithmic scales** (Romano et al., 2020). Contrast ratios are hard to reason with. Grades hide the logarithm, so people only ever subtract.
- **A simple rule works when it fits its environment** (Gigerenzer, Todd and the ABC Research Group). A grade difference is exact for any pair, so it fits any ladder. A step count fits only an evenly spaced one, which the uses research says colouri.st shouldn't have.
- **APCA can't be stated as a difference.** Its scores depend on which colour is the text and aren't additive, so APCA stays a check (ADR 0002).

## Decision: three layers (agreed by Benji)

1. **Everyday use needs no rule.** Semantic tokens come pre-paired and checked on exact values, in WCAG 2 and APCA, so accessibility comes with the system (job 8).
2. **The rule colouri.st states is in grades,** for understanding the system and working with steps beyond the tokens.
3. **Step counts appear only as a guide in the ladder view,** such as "around the middle, 3 steps apart give 3:1". The engine works them out for whichever ladder is chosen, and they're never the rule.

## Wording the grade rule, given rounding

The exact thresholds are 36.08 grades for 3:1, 49.40 for 4.5:1 and 63.92 for 7:1. People see whole-number names, so two names 50 apart can be as little as 49.0 apart exactly, which is 4.44:1.

- **On colouri.st's own ladders,** 37, 50 and 64 never mislead. Every pair of steps on the 11, 13 and 15-step ladders was checked, and none fails.
- **For any colour,** such as a brand colour placed on the ladder, the safe differences on rounded names are 37, 51 and 65. Every pair of the 256 8-bit greys was checked.

### Options

| Option | What colouri.st states | Holds for | Cost |
|---|---|---|---|
| **A. Exact thresholds, rounded up** | 37, 51 and 65 | Any colour, with rounded names | Not round numbers. 51 sits oddly beside "4.5:1" |
| **B. Simple numbers on colouri.st's steps** (chosen) | 37, 50 and 64 on colouri.st's own steps; checks handle anything else | Every step of every preset, kept true by a test | Conditional. A colour off the ladder could miss by up to 0.6 grades, which the checks catch |
| C. One decimal place | 36.1, 49.4 and 63.9, with names shown to one decimal | Any colour | Exact, but noisy names that are harder to remember |
| D. Rounder numbers with a margin | 40, 55 and 70, close to USWDS's 40, 50 and 70 | Any colour | Easy to remember, but stricter than needed: 55 is 5.3:1, so people lose pairs that pass |

**Benji chose B on 29 October 2026, for now,** with the other options documented here. Where the rule is taught, colouri.st says that for colours that aren't steps, it checks the pair for you.

## Consequences

- A test checks every ladder preset so that no pair of steps meets 37, 50 or 64 on rounded names while failing on exact values.
- The ladder view shows step-count guides, worked out per ladder, never as the rule.
- Teaching content (US-11) states the rule with its condition, and never implies that step counts or rounded names are exact for other colours.
- CLR-95 tests whether people use the grade rule or a step count more accurately. If grades prove hard to use, option D or a different presentation can be revisited.

## Files

| File | What it does |
|---|---|
| [`contrast-rule/rounding.py`](contrast-rule/rounding.py) | Exact thresholds; checks every pair on the 11, 13 and 15-step ladders and every pair of 8-bit greys for rounding failures. Output in `rounding.txt` |
| [`contrast-rule/material-tone-rule.py`](contrast-rule/material-tone-rule.py) | Tests Material's tone-difference rule against WCAG 2. Output in `material-tone-rule.txt` |

## Sources

- O'Leary, J. (2022, 17 February). [The science of color & design](https://m3.material.io/blog/science-of-color-design). Material Design. Read from a copy Benji supplied, as the page needs JavaScript.
- Moser, C. [Introducing tone-based surfaces in Material 3](https://m3.material.io/blog/tone-based-surface-color-m3). Material Design. Date to complete. Read from a copy Benji supplied; relevant to question 2.
- [USWDS: Color tokens and the magic number](https://designsystem.digital.gov/design-tokens/color/overview/).
- [IBM Carbon: Color overview](https://carbondesignsystem.com/elements/color/overview/).
- Koopersmith, D., & Miner, W. (2019, 15 October). [Designing accessible color systems](https://stripe.com/blog/accessible-color-systems). Stripe.
- [Radix: Understanding the scale](https://www.radix-ui.com/colors/docs/palette-composition/understanding-the-scale).
- [Adobe Spectrum: Color system](https://spectrum.adobe.com/page/color-system).
- Siu, A., Echevarria, J., Treitman, R., Jain, R., Jawili, M. A., Tigwell, G. W., Kannan, A., Prasad, Y. S., & Lazar, J. ColorA11Y: Enhancing creative design workflows with just-in-time color accessibility recommendations. arXiv. https://arxiv.org/pdf/2608.23852. Year and venue to complete.
- He, S., & McNutt, A. Trade-offs in data color palette design tools: An exploratory study. arXiv. https://arxiv.org/pdf/2608.19148. Year to complete.
- Romano, A., Sotis, C., Dominioni, G., & Guidi, S. (2020). [The public do not understand logarithmic graphs used to portray COVID-19](https://researchonline.lse.ac.uk/id/eprint/104582). LSE.
- Gigerenzer, G., Todd, P. M., & the ABC Research Group. (1999). *Simple heuristics that make us smart*. Oxford University Press. Read through [a review](https://www.jasoncollins.blog/posts/simple-heuristics-that-make-us-smart); full reading in CLR-96.
- [WebAIM Million 2026](https://webaim.org/projects/million/).
