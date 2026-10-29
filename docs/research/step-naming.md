# Naming the steps of a scale

> Researched 29 October 2026 for CLR-7 (rules schema) and CLR-13 (ladder presets), at Benji's request, in three passes. The first pass looked at how design systems and other taxonomies name scales. The second, after Benji asked for a smarter value and wider research, found a name that predicts contrast exactly, and looked at academic work on scales and naming. The third looked at which way the numbers should count.

## Question

colouri.st offers ladders of 11, 13 and 15 steps. How should the steps be named, so that names still mean something when the number of steps changes? And how should semantic tokens refer to steps, given that "step 700" doesn't mean the same thing on every ladder?

Benji's framing: offer two avenues. One that matches or emulates existing naming, such as "700", with the problems that come with it, and one that offers a better naming scheme.

## How design systems name their steps

| System | Names | What a name means | Same lightness across colours? |
|---|---|---|---|
| [Radix](https://www.radix-ui.com/colors/docs/palette-composition/understanding-the-scale) | 1 to 12 | Position, and each step has a stated purpose (1–2 backgrounds, 3–5 component backgrounds, 6–8 borders, 9–10 solids, 11–12 text) | Approximately |
| Ant Design, Primer, Polaris | 1 to 10, 0 to 9, 1 to 16 | Position | Not guaranteed |
| [Tailwind](https://tailwindcss.com/blog/tailwindcss-v3-3) | 50, 100 to 900, 950 | Position, spaced in hundreds. 950 was added at the dark end in v3.3 for dark interfaces. | Not guaranteed |
| [Spectrum](https://spectrum.adobe.com/page/color-system/) | 100 to 1600 | Position, from lightness stops. Light and dark themes use different indices for the same job. | Yes, by design |
| [Stripe](https://stripe.com/it-ca/blog/accessible-color-systems) | Numbered levels | Position. Every colour has the same contrast at each level: "at least five levels apart" for small text, four for icons and large text. | Yes, by design |
| [Material](https://github.com/material-foundation/material-color-utilities) | Tone 0 to 100 | **Measured value**: tone is CIE L\*, so tone 40 is L\* 40 in every colour | Yes, by definition |
| [USWDS](https://designsystem.digital.gov/design-tokens/color/overview/) | Grade 0 to 100 | **Measured value**: each grade is a range of luminance, 0 white and 100 black. The difference between two grades is the "magic number": 40+ meets AA large text, 50+ meets AA, 70+ meets AAA. | Yes, by definition |

Systems fall into two families:

- **Names by position** (Radix, Tailwind, Spectrum, Stripe). Familiar, and Tailwind's 50 to 950 is the most widely recognised. But a name only means "the nth step of this scale". Step 700 of an 11-step scale and step 700 of a 15-step scale aren't the same colour, and a new step can only be squeezed in where there's a gap, as Tailwind did with 50 and 950.
- **Names by measured value** (Material, USWDS). The name is the lightness, so it means the same thing in every colour and on every scale, and new steps can go anywhere. USWDS goes further: the difference between two names tells you whether they meet contrast.

## How other taxonomies solve it

The same problem, a scale whose number of steps can change, comes up outside colour:

| Taxonomy | How it's named | What it shows |
|---|---|---|
| **CSS font weights** | 100 to 900 in hundreds, with 400 as normal. Fonts with fewer weights map to the nearest value. Variable fonts accept any value from 1 to 1000 ([Designcise](https://designcise.com/web/tutorial/why-are-there-only-nine-numeric-values-for-the-css-font-weight-property)). | Spaced numbers leave room for scales of different sizes, and the nearest value is used when a step doesn't exist. Once a continuous range is possible, the numbers become a measurement. |
| **Munsell value** | 0 (black) to 10 (white), with decimals such as 6.95 for colours between the charts ([Munsell colour system](https://en.wikipedia.org/wiki/Munsell_color_system)) | A perceptual lightness scale named by value, where in-between steps are simply decimals |
| **Ansel Adams' Zone System** | Zones 0 to X, written in Roman numerals so they aren't confused with other numbers. Each zone is one stop of exposure, and Zone V is middle grey ([Zone System](https://en.wikipedia.org/wiki/Zone_System)). | A named scale anchored to a physical measure, with a known middle |
| **Library classification** (Dewey) | Decimal numbers, so a new subject can always be placed between two existing ones | Names that allow insertion anywhere without renumbering |
| **Clothing sizes** | XS, S, M, L, XL, then 2XL and 3XL | Easy to extend at the ends, impossible to insert between, and the names mean different things in different brands |

The pattern is consistent. Names by position are easy to read but break when the scale changes size. Names by a measured value survive any number of steps, carry meaning across families, and allow insertion. That's why font weights moved from fixed steps to a continuous range.

## What the first pass suggested

Our ladder is already defined by measured values: every step is a CIE L\* target (ADR 0001). So names by measured value fit colouri.st naturally, as they do for Material, whose tones are also CIE L\*.

**Avenue 1: names that match what people already use.** Offered as naming presets, such as Tailwind-style (50 to 950) or Radix-style (1 to 12), so exports drop into existing projects. The known problem is stated plainly in the interface: names are positions, so the same name means a different colour on a different ladder.

**Avenue 2: a better default, names from lightness.** Each step is named from its lightness, so a name means the same lightness in every colour and on every ladder. For example, a "grade" of 100 minus L\* (0 white, 100 black, as USWDS does). On the 13-step ladder that gives 2, 4, 8, 14, 22, 32, 43, 54, 65, 75, 83, 90 and 95. Multiplied by 10, it gives 20 to 950, which reads like familiar naming but is measured.

**For semantic tokens**, names by lightness also answer the open question in ADR 0005. A token can name a lightness, and the engine uses the nearest step on whichever ladder is chosen, as font weights do. Contrast then becomes a check that confirms the result, rather than the value that picks the step. That avoids the hair-splitting Benji raised, where tiny contrast differences decide between two steps.

## Limits of the first pass

- Lightness names can't express the step-counting rule. Contrast depends on luminance rather than lightness, so a difference between two lightness names doesn't give the same contrast everywhere on the scale.
- Whether names count up towards dark (like Tailwind and USWDS) or towards light (like Material tones) was left open.

Benji asked whether a smarter value could fix the first limit, and for wider research beyond colour. That's the second pass below.

## Second pass: a value that predicts contrast exactly

### The idea

WCAG 2 contrast is a ratio: (Y₁ + 0.05) ÷ (Y₂ + 0.05), where Y is relative luminance. Ratios become differences when you take their logarithm, which is exactly how decibels work: "the difference in sound level between the two is defined to be 10 log (P₂/P₁) dB" ([UNSW](https://animations.physics.unsw.edu.au/jw/dB.htm)). So if each step is named by the logarithm of its luminance, the **difference between two names is their contrast**.

Scaled so white is 0 and black is 100, the **contrast grade** of a colour is:

> grade = 100 × log(1.05 ÷ (Y + 0.05)) ÷ log(21)

and the WCAG 2 contrast between any two colours is then:

> contrast = 21 ^ (difference in grade ÷ 100)

This is exact, not an approximation. It was checked numerically: L\* 57 against L\* 10 gives 4.8845:1 from the WCAG formula and 4.8845:1 from the grades. The script is [`step-naming/contrast-grade.py`](step-naming/contrast-grade.py).

### What the rule becomes

| Grades apart | WCAG 2 contrast | Meets |
|---|---|---|
| 37 or more | 3:1 | Large text and interface elements (AA) |
| 50 or more | 4.5:1 (exactly 49.4) | Body text (AA), large text (AAA) |
| 64 or more | 7:1 (exactly 63.9) | Body text (AAA) |

It holds for any two colours, in any family, on any ladder, and even for a brand colour that isn't on the ladder. It also lands close to the USWDS "magic numbers" (40, 50 and 70), which suggests USWDS's grades rest on a similar idea.

### Our ladders as contrast grades

| Ladder | Contrast grades, light to dark |
|---|---|
| 11 steps (placeholder values) | 2, 5, 12, 21, 32, 45, 58, 70, 81, 90, 95 |
| 13 steps (ADR 0001) | 2, 3, 7, 12, 19, 29, 41, 54, 67, 79, 88, 93, 97 |
| 15 steps (placeholder values) | 2, 3, 6, 10, 16, 23, 32, 42, 53, 64, 73, 83, 89, 94, 97 |

On the 13-step ladder, steps 7 apart are always at least 52 grades apart (4.9:1), which confirms the step-counting rule in ADR 0001 from a different direction. Multiplied by 10 and rounded, the 13-step names would read roughly 20, 30, 70, 120, 190, 290, 410, 540, 670, 790, 880, 930 and 970: familiar in form, but every difference now means something.

### Why this fits our method

Every colour at a given step has the same luminance, because the ladder fixes CIE L\* for every colour (ADR 0001). So a step's contrast grade is the same in every colour, and one name serves the whole row.

### Limits

- **APCA can't be captured in one name.** APCA subtracts powers of luminance with different exponents depending on polarity: 0.56 and 0.57 for dark text on a light background, 0.65 and 0.62 for light on dark, plus a soft clamp near black (`apca-w3` 0.1.9). A single number per step can only approximate it. WCAG 2 grades can be exact; APCA stays a check.
- **Rounding.** Names are rounded for people, so two names that look 50 apart could truly be 49.6 apart. The engine always checks the exact values, and the names stay labels.
- **The numbers are less round than Tailwind's.** That's the price of meaning, and Avenue 1 still offers familiar names.

## Wider research: academic work on scales and naming

### Scales of measurement (Stevens, 1946)

S. S. Stevens defined measurement as "the assignment of numerals to objects or events according to rules", and set out four kinds of scale ([*Science*, 1946](https://courses.ie.bilkent.edu.tr/wp-content/uploads/sites/13/2023/03/On_the_Theory_of_Scales_of_Measurement.pdf)):

| Scale | What it allows | Examples for us |
|---|---|---|
| Nominal | Same or different | Colour names (D-025) |
| Ordinal | Order only | Names by position: Radix 1–12, Tailwind 50–950 |
| Interval | Differences are meaningful; "the zero point… is a matter of convention" | CIE L\* names, and the contrast grade |
| Ratio | Ratios are meaningful, with a true zero | Relative luminance itself |

This explains the problem precisely. Names by position are ordinal, so only their order means anything: subtracting two of them is meaningless, and they can't support a rule like "50 apart". The contrast grade is an interval scale built on a ratio, so its differences carry meaning, which is exactly what a contrast rule needs.

### Logarithmic scales

Decibels, and the photographer's exposure stops used by the [Zone System](https://en.wikipedia.org/wiki/Zone_System) ("a one-zone change is equal to one stop"), name a quantity by its logarithm, so equal steps in the name are equal ratios in the quantity. The contrast grade is the same idea applied to contrast.

### Levels of fineness (ISCC–NBS)

The ISCC–NBS colour naming system names colours at three levels of precision: 13 basic names, 29 at level 2 and 267 at level 3, where "Level 3 categories are formed by subdividing a Level 2 category" ([ISCC–NBS](https://munsellcolourscienceforpainters.com/ISCCNBS/ISCCNBSSystem.html)). Coarse names contain the finer ones, so a coarse and a fine description always agree.

**For us:** if the smaller ladders were designed as subsets of the larger ones, every step of the 11-step ladder would also exist on the 13 and 15-step ladders, under the same name. Switching ladder would then add or remove steps without renaming any. That's a design choice for CLR-13.

### Faceted classification (Ranganathan, 1933)

S. R. Ranganathan's Colon Classification was "the first faceted (or analytico-synthetic) classification". Instead of listing every subject in advance, it builds a class from independent facets (personality, matter, energy, space and time) combined in a set order ([History of Information](https://www.historyofinformation.com/detail.php?id=4384)).

**For us:** a token name is also built from independent facets: the colour, the step or grade, the purpose, the state and the mode. Treating them as facets combined by a pattern, rather than one fixed list of names, is what naming templates (CLR-72) and the separation of names from roles (D-025) already do. It gives that approach a name and a history.

### Basic-level categories (Rosch, 1970s)

Eleanor Rosch showed that people naturally name things at a "basic level", which is "a decomposition of the world into maximally informative categories": chair rather than furniture or kitchen chair ([Prototype theory](https://en.wikipedia.org/wiki/Prototype_theory)).

**For us:** people think about steps as "background", "border" or "text", not as grade 54. So there are two layers of naming. Purposes, like Radix's, are the human layer, used in the guided flow and explainers. Contrast grades are the exact layer, used by the engine, the rules and the exports.

### Inserting between existing names (fractional indexing)

Ordered lists that have to accept new items anywhere, such as drag-and-drop lists in collaborative apps, use [fractional indexing](https://dev.to/sonim1/fractional-indexing-implementing-drag-and-drop-ordering-and-avoiding-index-collisions-g3): a new key is always chosen between its neighbours, so nothing is renumbered. Library decimal classification works the same way. A measured name, like the contrast grade, gets this for free: any new step simply has its own value.

## What this suggests now

1. **Name steps by contrast grade by default.** One name per step, the same in every colour and on every ladder, where the difference between two names is their WCAG 2 contrast: 37 apart for 3:1, 50 for 4.5:1, 64 for 7:1.
2. **Offer familiar naming as presets** (Avenue 1), such as Tailwind-style 50 to 950 or Radix-style 1 to 12, with the interface saying plainly that these are positions.
3. **Give each step a purpose label** as the human layer, such as background, border or text.
4. **Let semantic tokens name a grade,** with the engine using the nearest step on the chosen ladder. Contrast is then confirmed by the grades themselves, and APCA is checked alongside.
5. **Consider nesting the ladder presets** (CLR-13), so smaller ladders are subsets of larger ones.

## Third pass: which way the numbers count

Benji noticed a split: stored colour values count up towards light (0 is black, and 255 or FF is full brightness), while familiar design system names count up towards dark. Researched 29 October 2026.

### Two traditions

| Counts up towards light (more light, higher number) | Counts up towards dark (darker, higher number) |
|---|---|
| RGB channels (0 to 255) and hex (00 to FF) | Material Design's 2014 palette: "red 50" is "the lightest shade", "red 900" is "the darkest", and 500 is used as the main colour ([MUI](https://v4.mui.com/customization/color/)) |
| Relative luminance Y, CIE L\*, OKLCH lightness, HSL lightness | Tailwind (50 to 950), which follows the same pattern |
| Munsell value (0 black, 10 white) and the Zone System (0 black, X white) | USWDS grades (0 white, 100 black) |
| Material 3 tones (0 black, 100 white), which are CIE L\* | IBM Carbon (Gray 10 is `#f4f4f4`, Gray 100 is `#161616`) ([Carbon](https://carbondesignsystem.com/elements/color/overview/)) |
| | Radix (1 to 12), Spectrum (100 to 1600), Ant Design |
| | Print tints, commonly given as a percentage of solid ink, so the number rises with the ink |

The split follows what's being counted. Measurements and stored values count **light**, because screens emit light. Names that people use count **ink**, or darkness, which is how print has always worked. In our view, the web convention most likely comes from Material's 2014 palette, which Tailwind and others followed.

### Evidence on how people read lightness

Research on colour scales in data visualisation finds a "dark-is-more" bias: people tend to read darker colours as larger quantities (Soto, Schoenlein and Schloss, 2023, [*Cognitive Research: Principles and Implications*](https://link.springer.com/article/10.1186/s41235-023-00482-1)). The bias was weaker and more variable than other biases, and dark backgrounds don't simply reverse it. It supports names that rise as colours get darker, at least on light backgrounds.

### What it means for colouri.st

- **Both directions can be offered.** The contrast rule only depends on the difference between two names, so it's the same either way: 50 apart is still 4.5:1. Counting towards light is simply 100 minus the grade.
- **The direction is a naming setting** in the rules, with a default, not something built into the engine. The engine always works in stored values, which count towards light.
- **Default: towards dark**, so that 0 is white and 100 is black. It matches the names people already use for tokens, and every familiar naming preset (Tailwind, Radix, Spectrum, Carbon) counts the same way, so switching between contrast grades and a preset never flips the direction. It also matches the dark-is-more bias.
- **Option: towards light,** for teams who think in Material 3 tones or in stored values.

## Still to work out

- Benji to confirm the default direction (towards dark) and the option to count towards light.
- Whether names are shown as 0 to 100, or multiplied by 10 to look like familiar naming.
- How the step-counting rule and the grade rule are taught together, without confusing people.
- How Avenue 1 presets are tested, so exports match each framework's expectations.
