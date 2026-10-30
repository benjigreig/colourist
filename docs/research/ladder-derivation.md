# Ladder derivation: how the ladder follows uses and contexts

> Researched 30 October 2026 for CLR-13, question 2: how the ladder is derived from uses and contexts, within the relationship model (D-052). Decided the same day (D-053). Scripts and outputs: [`ladder-derivation/`](ladder-derivation/). Related: [`ladder-distribution.md`](ladder-distribution.md), [`colour-relationships.md`](colour-relationships.md), [`token-layers.md`](token-layers.md), the [colour theory index](../colour-theory-index.md).

## Question

Each semantic token's relationships give it a range it needs to sit in, in each theme. Where should a family's steps go, how many does it need, and how should people work with them?

## What we found

### 1. Light and dark barely share colours in practice

Of the 22 design systems that publish both modes, each uses 8 to 18 distinct neutral values across the two, and shares only 0 to 4 of them, with a median of 1. Nine share none, including Primer, Atlassian, Elastic, Spectrum and Radix.

- **Atlassian** has a separate dark ramp: "There is a light neutral ramp and an equivalent dark neutral ramp," and "Neutral100 in the light neutral ramp should equate to DarkNeutral100 in the dark neutral ramp." Its dark ramp has extra in-between steps, DarkNeutral250 and DarkNeutral350.
- **Radix** generates dark scales separately: "To generate dark theme colors, toggle the appearance to dark."
- **Material** keeps one tonal palette per colour, but gives surfaces their own tones in each mode. Its 2026 spec uses light surface tones of 98, 96, 94, 92 and 90, and dark ones of 4, 6, 9, 12 and 15.

So in practice each mode gets its own steps, packed near its own page. Where a system needs more, it adds in-between steps there and leaves the rest alone.

### 2. The most advanced tools work out values from relationships

- **Leonardo** (Adobe) has no fixed scale. It generates only the colours at the target contrast ratios against each theme's background, with a "multiplier to increase or decrease contrast for all theme colors". People explore on the full scale, shown as a gradient with a dot for each colour chosen (Baldwin, 2019).
- **Material's colour code** gives each role a background, a contrast target that changes with the contrast level, and "tone delta pairs": relationships between two roles, such as 5 tones apart in a set direction. Tones are worked out per scheme, anywhere from 0 to 100.

Both are close to D-052: semantic tokens are defined by relationships, and each theme resolves them.

### 3. Fitting a ladder to the targets gives a step count, not a fixed one

[`derive.mjs`](ladder-derivation/derive.mjs) turns the 27-system medians ([`ladder-distribution.md`](ladder-distribution.md), Part 4) and the contrast rule (D-049) into a range for each token in each theme:
- every token in a theme takes its own step, since a hover can't share its surface's step
- a light and a dark token may share a step when their ranges overlap, since they're never shown together

| One family serving a light and a dark theme | AA | AAA |
|---|---|---|
| Greys, eight core uses (page, surface, hover, pressed, subtle border, control border, muted text, text) | 12 steps | 14 |
| Greys, adding sunken and selected | 16 | 18 |
| An accent (tint, tint border, fill, fill hover, fill pressed, accent text) | 9 | 9 |

**At AA, the middle steps serve both modes.** Light control borders and dark muted text both land around 40 grades, and light muted text and dark control borders around 55. That's because 37 and 50 grades, counted from opposite ends of the range, land near each other. At AAA they no longer line up, so the ladder needs more steps. The target level changes the ladder.

**Today's 13 steps** miss some ranges by up to 2 grades: dark surfaces, hover and tints, and fill hovers in both modes. They also make uses near the page share steps ([`ladder-distribution.md`](ladder-distribution.md), Part 7).

**Assumptions:**
- Separations may be up to half as much again as their target, and thresholds up to 6 grades over.
- Fills carry white text in both modes, the commonest choice.
- Fill hover and pressed move darker by the practice medians, 8 and 15 grades.
- The pairing between light and dark is a quick, greedy estimate, not a proven minimum.

The counts move a little if these change. The pattern holds.

### 4. A step should mean the same in every colour

Fitting every family to its own needs would give each colour a differently shaped ladder. Benji's concern: people choosing and moving between families need a step to mean the same thing in each, and uneven, varying ladders make that hard. The writing backs this.

- **Stripe:** "each color… has the same contrast value at a given level," and "at each level, no single color appears to take priority over another" (Koopersmith & Miner, 2019).
- **Goldman Sachs:** "'gray 70' text color will always pass accessibility with any color '20' in background," so teams "can discuss and reference color more efficiently."
- **Material:** HCT gives "consistent lightness/colorfulness across hues." Tonal palettes "reduce cognitive load," because "a tonal palette can be substituted" (O'Leary, 2022).
- **Curtis (2016):** offer "a handful of options," and number steps by lightness so they stay predictable.
- **Grudin (1989):** consistency mainly helps people learn and transfer what they know. But "the organizing element is the context of use," and the task should win where it clearly calls for something else.

**The two phases this points to:** while people explore and choose, a common shape matters most. Once the mapping is known, the work can shape the ladder.

## Options considered

| Option | How it works | Outcome |
|---|---|---|
| **A. Preset ladders** | One shape for every family, from 11, 13 or 15 steps (D-050) | Kept, as the base |
| B. A ladder per family, fitted to its needs | Steps wherever each family's relationships need them | Rejected: uneven, varying ladders make switching between families hard |
| C. A ladder per theme | Radix, Atlassian and Primer | Rejected: about twice the primitives, multiplying with brand × mode |
| D. No ladder | Values solved per theme, as Leonardo and Material do | Rejected: loses the primitive tier (D-051) |
| **E. Tune the preset at mapping** | Add an in-between step only in the family whose mapping needs it | Kept, after the beta |
| Trim exports to the steps in use | Export only what themes use | Rejected: full ladders cost little in code and are useful as primitives |
| Never move existing steps | Keep steps fixed in all cases | Rejected: that only matters once a system is in use |

## Decision (D-053, agreed by Benji)

1. **Every family shares one ladder shape, from a preset.** Full ladders are always exported as primitives.
2. **Mapping shows where a ladder falls short.** colouri.st flags any token with no step in its range, and any related tokens forced onto the same step.
3. **In the beta, colouri.st flags gaps** and suggests a larger preset where that helps.
4. **After the beta, the ladder can be tuned:**
   - An in-between step is added only in the family that needs it, named by its grade.
   - In new work, its neighbours are re-spaced so each gap in the family stays above the minimum L\* gap (D-012, D-026).
   - A "keep existing steps fixed" option is on by default for imported systems (CLR-97), and can be switched on once a project is in use. With it on, tuning only adds steps.

**How people say what they need:** they don't have to predict how many steps they want. They describe what they're building, and steps follow:
- **Starting fresh:** the person adds tokens from a recipe (CLR-94) and their product, in plain terms, such as a panel inside a card. A new token with no free step in its range is flagged then.
- **Meeting a particular need:** they add a theme or setting, such as AAA, high contrast or a grey dark page. Every token in it is re-checked.
- **Bringing an existing system:** after the beta (CLR-97). Their tokens state the need.

## Open

- The minimum L\* gap between adjacent steps, by where they sit on the ladder.
- Question 3: which preset is recommended when. A preset could be recommended by how few gaps it leaves for the chosen uses, themes and target.
- How people describe their needs to a tool. We found no research on it, so it goes to CLR-95.

## Files

| File | What it does |
|---|---|
| [`ladder-derivation/targets.mjs`](ladder-derivation/targets.mjs) | For 22 systems with both modes: each neutral use's absolute grade, and how many values light and dark share. Output in `targets.txt` |
| [`ladder-derivation/model.mjs`](ladder-derivation/model.mjs) | The shared model (tokens, ranges, sharing between themes, the distinct-step check), split out of `derive.mjs` on 30 October for [`ladder-zones.md`](ladder-zones.md). `derive.mjs`'s output is unchanged |
| [`ladder-derivation/derive.mjs`](ladder-derivation/derive.mjs) | Turns relationship targets into ranges, counts the steps one family needs for light and dark at AA and AAA, and checks today's 13 steps against the ranges. Output in `derive.txt` |

Both read [`ladder-distribution/uses/`](ladder-distribution/uses/). Run them with `node`, after that folder's `npm install`.

## Sources

- Atlassian. [Color palette](https://atlassian.design/foundations/color/color-palette).
- Radix. [Custom palettes](https://www.radix-ui.com/colors/docs/overview/custom-palettes).
- Material Color Utilities. [`color_spec_2026.ts`](https://chromium.googlesource.com/external/github.com/material-foundation/material-color-utilities/+/91da30d89e70c3dc9575ec71a1ebe8874d881f29/typescript/dynamiccolor/color_spec_2026.ts).
- Adobe. [`@adobe/leonardo-contrast-colors` README](https://cdn.jsdelivr.net/npm/@adobe/leonardo-contrast-colors@1.1.0/README.md).
- Baldwin, N. (2019, 9 December). [Leonardo: an open source contrast-based color generator](https://medium.com/@NateBaldwin/leonardo-an-open-source-contrast-based-color-generator-92d61b6521d2).
- Koopersmith, D., & Miner, W. (2019, 15 October). [Designing accessible color systems](https://stripe.com/blog/accessible-color-systems). Stripe.
- Goldman Sachs. [Creating the color system](https://design.gs.com/foundation/color-system/creating-the-system).
- O'Leary, J. (2022, 17 February). [The science of color & design](https://m3.material.io/blog/science-of-color-design). Material Design. From a copy Benji supplied.
- Curtis, N. (2016, 13 April). [Color in design systems](https://medium.com/eightshapes-llc/a1c80f65fa3). EightShapes.
- Grudin, J. (1989). [The case against user interface consistency](https://www.microsoft.com/en-us/research/wp-content/uploads/2017/01/the-case-against-user-interface-consistency.pdf). *Communications of the ACM, 32*(10), 1164–1173.
