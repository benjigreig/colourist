# The Vividness Tuner: choosing vividness and the maximum gap by eye

> Built and used on 15 November 2026 for CLR-15 (recovery and ceiling) and CLR-103 (the maximum gap). The tool: [`vividness-tuner/index.html`](vividness-tuner/index.html), which opens in a browser with no build. Decisions it informed: D-069, D-070 and D-071. Related: [`hue-drift.md`](hue-drift.md), [`../example-brands.md`](../example-brands.md).

## Why it was built

The earlier work found recovery and ceiling values were chosen by eye, not derived (colour theory index). So the way to choose them was to look: every example colour's family, side by side, changing as the settings move.

## What it does

- **Shows all 13 example colours** (Doggly, Kerfwell and Sorrel) as one strip each, lightest to darkest, on any of the six recipes at AA or AAA.
- **Recovery and ceiling sliders,** applied to every family at once, with the result redrawn as you drag (about 12 ms).
- **A comparison strip** under each family at the default vividness ("hold": each colour's own chroma, reduced only to fit the screen).
- **What limits each step:** R (recovery), C (ceiling), G (the screen's gamut) or · (no colour, at white).
- **A maximum gap:** where two neighbouring steps are further apart than the limit, steps are added evenly between them and marked.
- **Copy** gives the settings as text, to paste into a conversation.

## How it works

The colours are computed in the page with the engine's method, reimplemented in plain JavaScript:
- CIE L* (D65) from the ladder, OKLCH hue and chroma from the source (D-012), CSS Color 4 matrices (D-047).
- Each step's maximum is found by bisection: the most chroma that fits sRGB at that L* and hue (D-069).
- Each step's chroma is min(ceiling × maximum, source + recovery × (maximum − source)).
- Added steps take their L* from their grade: Y = 1.05 / 21^(grade / 100) − 0.05.

Checked against the engine and the research: at "hold", Brick red's palest step is `#fff6f6` and Mono light keeps its 354.8° hue, as in [`hue-drift/drift.txt`](hue-drift/drift.txt). The ladders are copied from [`ladder-derivation/recipes.json`](ladder-derivation/recipes.json), and the brands match `@colourist/examples`.

## What it showed

- **A visible jump between grades 68 and 81** in every family on the default recipe at AA: 13 grades, where no use places a step. Benji spotted it.
- **Bigger holes elsewhere:** 21.4 grades in the AAA ladders (37 to 58, because AAA text skips the steps AA uses), and 23 to 27 grades in the light-only recipes (68 to 91, because nothing uses the dark end).
- **A maximum gap of 11 grades looked right on every colour** (D-070). At 11, the default recipe at AA gains one step, at grade 75; the AAA and light-only ladders gain two or three.
- **Recovery changes some colours far more than others.** At 0.5, Dusty grape turned a bright violet-blue, while the pastels changed gently. One setting doesn't suit every colour.
- **Recovery 0.5 with no ceiling looked right to Benji across the brands,** but he chose not to make it a default or a named preset (D-071): people adjust it themselves.

## How ladders are shown: decisions from using it

Benji's choices while using the tuner, for the Ladder view (D-061) and anywhere else a family's shades are shown:

- **One seamless strip per family.** No borders, gaps or rounded corners between swatches, so the blend from step to step can be judged. Bordered swatches made the blend hard to see. ("Seamless strips" switches this off.)
- **Markers sit outside the colour:** a short bar above a swatch marks an added step, and a bar below marks the step nearest the source colour. An outline around a swatch interrupted the blend.
- **The strip's label sits above its scale,** so the order reads label, grades, swatches, what limits each step.
- **Labels only when there's more than one strip.** With the comparison off, "Your settings" is hidden.
- **The comparison is called "default vividness",** not "as supplied", because that's what it is in the product.
- **The scale rows (grades above, limits below) sit in cells of grey one visible step from the page, with a 1px gap between cells,** so the eye can follow them across. The space between the scales and the swatches is about half what it was.
- **The interface itself is pure grey,** so it doesn't tint how the colours are judged.

## Limits

- One person's judgement, on 13 invented colours, on one screen. CLR-95 tests ladders with people.
- The tuner applies one setting to every family at once. The product sets it per group and per colour (D-066, D-071).
- It reimplements the engine's maths rather than importing it, so it could drift from the engine. CLR-15's tests compare the engine's output with the tuner's.
