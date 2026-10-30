# Ladder zones: why steps bunch at the ends, and how the ladder is built

> Researched 30 October 2026 for CLR-13, question 3: which ladder to recommend, and when. It led to a change of approach. The ladder is built in three zones from the product's choices, and presets become recipes. Decided the same day (D-054), and the question set in D-055. Scripts and outputs: [`ladder-derivation/`](ladder-derivation/). Builds on [`ladder-derivation.md`](ladder-derivation.md) (D-053) and [`ladder-distribution.md`](ladder-distribution.md).

## How the question changed

Question 3 began as "which preset (11, 13 or 15 steps) should colouri.st recommend, and when?" The proposal was to recommend whichever left the fewest gaps for the product's uses, themes and target. Two problems came up:

1. **Capturing uses is hard.** People can say whether they want a dark theme, and which target they want. They can't easily say how layered their product is, especially before it exists. Choices also add up, rather than being one pick (Benji).
2. **No preset fits.** An additive model showed that even 15 evenly spread steps leave gaps, because the shortfall is near the page, not in the total number of steps.

So the ladder is built from the product's choices, and presets move up a level to become recipes of those choices.

## What the additive model shows

[`additive.mjs`](ladder-derivation/additive.mjs) adds product choices to a content-only base (page, surface, subtle border, muted text, text):
- **interactive controls:** hover, pressed, control border
- **a second surface layer:** panels, menus, dialogs
- **selectable items:** rows, lists, tabs
- **a dark theme**

It does this in every combination, at AA and AAA, and counts the tokens with no step of their own in range on each preset (within 1 grade). It uses the ranges in [`model.mjs`](ladder-derivation/model.mjs), which are documented in `derive.mjs`.

| Product (AA) | Steps needed | Gaps on 11 | on 13 | on 15 |
|---|---|---|---|---|
| Light only, content only | 5 | 1 | 0 | 0 |
| Light, with controls | 8 | 2 | 1 | 1 |
| Light, with controls, layers and selection | 10 | 4 | 3 | 3 |
| Light and dark, content only | 8 | 3 | 1 | 0 |
| Light and dark, with controls | 12 | 5 | 4 | 2 |
| Light and dark, with controls, layers and selection | 16 | 9 | 7 | 6 |

**Findings:**
- **The choices add up.** A dark theme adds the most, then controls, then layers and selection, at about one gap each. AAA mostly changes the 11-step ladder.
- **The shortfall is crowding near the page.** An interactive light theme needs five tokens within about 5 grades of white: page, surface, selected, sunken and hover. The 15-step preset has only two steps there.
- **Some questions don't change the answer.** Almost every product has controls. Only questions whose answers change the ladder are worth asking.

**Limits:**
- The ranges come from practice medians with tight allowances.
- The model covers only the grey family. Charts, status-heavy products and how vivid the brand is mainly affect the colour families, which aren't modelled yet.

## Why steps bunch at the ends: the three zones

The explanation for people, and the basis of the rules:

1. **The light background zone.** Fine steps near the light page, for surfaces, hovers, selected items and subtle borders. These sit next to the page and need small differences that are still visible. We tell small differences apart best when they're close to the background: the crispening effect (Whittle, 1992; Kane & Bertalmío, 2019).
2. **The contrast zone.** Wide steps through the middle, placed at the contrast thresholds from each page:
   - 37, 50 and 64 grades from the light page
   - the same distances from the dark page, which land at about 58, 45 and 31 grades

   Text and borders need big jumps in contrast, not fine ones. Placing steps on the thresholds makes the contrast rule (D-049) exact where it matters most.
3. **The dark background zone.** Fine steps near the dark page, about twice as far apart as in the light zone. Dark mode needs about twice the separation, because we tell dark tones apart less easily ([`ladder-distribution.md`](ladder-distribution.md), Parts 4 and 5).

**How choices change the zones:**
- Layers, selection and states add steps to the background zones.
- A dark theme adds the dark zone's steps.
- The target (AA or AAA) moves the contrast zone's steps.
- The middle barely changes from one product to the next.

**Practice bunches steps the same way:** Radix puts 8 of its 12 steps in the light third, Polaris 10 of 16, and Material adds surface tones near each end ([`ladder-distribution.md`](ladder-distribution.md), Part 3; [`ladder-derivation.md`](ladder-derivation.md)).

## For people used to fixed, even ladders

Experienced designers are used to fixed ladders with even steps. The answer has to deal with evenness directly.

**"Why aren't the steps even?"**

1. **Familiar ladders are less even than they look.** Accent scales in Carbon, Ant and Tailwind are close to even in lightness. But even in lightness isn't even in contrast: Carbon's blue steps range from 5.8 to 14.6 grades apart. The greys, which carry the surfaces, are uneven in almost every system. Tailwind slate's gaps run from 1.5 to 19.6 grades, and Primer, Polaris and Radix are more uneven still (measured from each system's package, [`ladder-distribution/scales/`](ladder-distribution/scales/)).
2. **Systems with even ladders add steps outside them, near the ends.** Carbon's grey 10 (#f4f4f4) and grey 20 (#e0e0e0) are 6 grades apart, too far for a hover, so its hover colour sits between them at #e8e8e8. Ant and Atlassian use translucent overlays instead. The bunching is there in every case, but hidden outside the ladder, so it isn't named, counted or checked.
3. **One even spacing can't do both jobs.** Things near the page need small differences that are still visible, about 2 to 4 grades. Text and borders need big jumps, 37 to 64 grades. A 13-step ladder spaced evenly puts steps about 5 to 9 grades apart, whether it's even in lightness or in contrast. That's too coarse for a hover, and finer than text needs.
4. **Where evenness is the point, we keep it.** Charts and data need steps that look equal (Kovesi, 2015), so colouri.st spaces data palettes evenly.
5. **What you keep from fixed ladders:**
   - One ladder, fixed for the project and the same in every colour family.
   - Names that tell you contrast: a grade means the same in every project (D-041).
   - The step-counting habit, which still works through the middle, because steps sit on the contrast thresholds there.

**In one line:** colouri.st places steps where your system uses colour: close together where surfaces and states need small, visible differences, and far apart where text needs contrast. The extra steps your old ladder hid as hover colours and overlays become part of the ladder, named, counted and checked.

## How people tell colouri.st what they need

From Benji's direction and the desk research:

- **Ask questions, in a way that's easy to understand, judge and explain** (Benji).
- **Don't assume an existing product.** Show modelled examples of interfaces at different levels of complexity, rather than asking "which looks like yours?" (Benji).
- **Choices are things you tick, not one pick,** and they add up (Benji).
- **Only ask what changes the outcome.** The additive model can test each candidate question for that.
- **Keep it short, and make it look short.** Fewer people started a web survey as its announced length rose from 10 to 20 to 30 minutes: 75%, then 65%, then 62% (Galesic & Bosnjak, 2009, via Hanson et al., 2025). A shorter survey gave only a slightly better response, and no better data (Hanson et al., 2025).
- **Expect people to be unsure.** Choice overload is likelier with complex options, a hard task, uncertain preferences and a wish to minimise effort (Chernev, Böckenholt & Goodman, 2015). That points to concrete, visual choices with good defaults.
- **Let people answer as much as they like, and adapt what's asked next** (Yazdanian et al., 2019).
- **Ask about style separately.** Material asks for a scheme style (tonal spot, neutral, vibrant, expressive, fidelity, monochrome) and a contrast level. Radix asks for appearance, accent and grey colours, panel style, radius and scaling. Neither asks what the product contains. A neutral, tinted or vivid style question shapes the colour families more than the ladder.

**Still to do:** the modelled examples for the question set below, then testing with people (CLR-95). The stages as a whole will be revisited later (CLR-99).

## The question set (D-055)

Each candidate question was tested by adding up what its answer changes. The script, [`questions.mjs`](ladder-derivation/questions.mjs), averages over every combination of the other answers, using the grey family only.

| If the product has… | Extra steps on average (up to) | Of which near the light page |
|---|---|---|
| A dark theme | 4.5 (8) | 0 |
| Buttons, inputs and other controls | 4 (6) | 2 |
| Cards or panels on the page | 1.5 (2) | 1 |
| Menus, dialogs or popovers on top | 1.5 (2) | 1 |
| Lists or tables people select items in | 1.5 (2) | 1 |
| AAA instead of AA | 0.5 (2) | 0 |

The rest needed one ladder shared by every family and theme, so [`untested.mjs`](ladder-derivation/untested.mjs) places steps for greys, a brand colour and any feedback or chart colours together. An app with controls, cards, overlays and selection, in light and dark, needs **18 steps**: 7 near the light page and 7 near the dark page.

| Added to that app | Steps | Near the light page | Near the dark page |
|---|---|---|---|
| Baseline | 18 | 7 | 7 |
| Status messages (four feedback colours) | 20 | 7 | 7 |
| Charts (eight hues, each with a strong and a lighter version) | 19 | 7 | 7 |
| A high-contrast version of each theme | 26 | 10 | 8 |
| Often seen in bright surroundings | 18 | 5 | 7 |
| People who need more contrast (AAA, wider separations) | 19 | 5 | 5 |

**What each question does:**
- **A high-contrast version** changes the ladder the most, in both background zones.
- **A dark theme** changes it next most, adding the dark zone.
- **Cards, overlays and selection** each add a step in the crowded zone near the page, and they add up.
- **Status messages** add steps, not because of the number of feedback colours, which reuse the same steps, but because a warning yellow needs a light fill with dark text, at about grade 8 to 20, plus its states. That's the band between the light zone and the contrast zone.
- **Charts** add a step for their lighter versions, in the same band.
- **Controls** add a lot, but nearly every product has them, so they're on by default rather than asked.
- **Bright surroundings** add no steps, but push the light zone's steps further from the page.
- **People who need more contrast** add a step, widen both zones and suggest AAA.

**The questions, as agreed** (Benji, 30 October). Answers are ticked, not picked, and each is shown as a modelled example:
1. **What will people do with it?** Read content (always on), use controls (on by default), pick items from lists or tables, see data in charts, get status messages.
2. **How is it put together?** Content on a plain page, cards or panels, menus, dialogs or popovers on top.
3. **Where and how will it be seen?** Light, dark or both, or following the device; a high-contrast version; often in bright light; by people who need more contrast.

### How colour should feel: a question for the vividness stage

Style (neutral, tinted or vivid) changes chroma, not lightness, so it can't move the ladder (D-012). What it changes is which step a vivid fill sits on, because each hue is most colourful at a different lightness. Measured in OKLCH, at the edge of sRGB:

| Hue (OKLCH) | Most colourful at L\* | Grade |
|---|---|---|
| 0 to 30 (pinks and reds) | 54 to 55 | 44 to 45 |
| 60 (orange) | 70 | 27 |
| 90 to 210 (yellows, greens and cyans) | 83 to 94 | 5 to 15 |
| 240 (sky blue) | 68 | 30 |
| 270 to 300 (blues and violets) | 34 to 43 | 57 to 69 |
| 330 (magenta) | 60 | 38 |

So the question belongs with vividness (stage 4, US-04), and the ladder stage keeps the other three groups.

### Charts

Chart colours aren't several full scales. They're a specifically ordered range of colours, often with a couple of shade variations of each, so a chart with a lot of data is readable without becoming a rainbow (Benji). [`charts.mjs`](ladder-derivation/charts.mjs) measured seven published palettes:

| Palette | Colours | Grades | Reach 3:1 on the page | Pairs, grades apart |
|---|---|---|---|---|
| Elastic EUI (paired) | 10 | 9 to 34 | 0 of 10 | 12 to 21 |
| Atlassian, light | 8 | 29 to 62 | 5 of 8 | — |
| Atlassian, dark | 8 | 22 to 62 | 7 of 8 | — |
| Tableau 10 | 10 | 16 to 50 | 5 of 10 | — |
| ColorBrewer Paired | 12 | 2 to 67 | 5 of 12 | 14 to 50 |
| ColorBrewer Set2 | 8 | 11 to 32 | 0 of 8 | — |
| Okabe and Ito | 8 | 9 to 100 | 5 of 8 | — |

**What this shows:**
- **They mostly sit between grades 10 and 60,** and alternate lighter and darker so neighbouring series stand apart.
- **Many don't reach 3:1 on a white page.** WCAG 1.4.11 asks 3:1 for graphics needed to understand content, so colouri.st should say where a palette relies on labels or patterns instead.
- **For the ladder,** chart colours use shared steps: a strong one reaching 3:1 and a lighter one. Only the lighter band adds a step.

The source is either a secondary palette that exists with the brand, or one colouri.st offers from the brand colours (Benji). Both come after the beta (CLR-55).

**Limits:**
- Steps are placed by a quick estimate, not a proven minimum.
- The 1.6 times for bright surroundings and 1.5 times for people who need more contrast are assumptions built on single studies, to test in CLR-95.
- The high-contrast figures come from three systems.

## Decision (D-054, agreed by Benji)

- **Each project has one fixed ladder, shared by every colour family,** built in three zones from the product's choices and then held fixed.
- **Presets become recipes (CLR-94):** named sets of answers, each building a ladder. Without answers, the default recipe builds something close to today's 13 steps. This supersedes D-005 and D-050.
- **In the beta:** a few fixed recipes, their ladders worked out in the rules file. A gap found at mapping suggests changing an answer, such as adding layers, which rebuilds the ladder. Fully open answers and tuning (CLR-98) come after the beta.
- **D-053 still applies,** except that its presets are now recipes.

## Files

| File | What it does |
|---|---|
| [`ladder-derivation/model.mjs`](ladder-derivation/model.mjs) | The shared model: tokens, ranges, sharing between themes and the distinct-step check. Split out of `derive.mjs`, whose output is unchanged |
| [`ladder-derivation/additive.mjs`](ladder-derivation/additive.mjs) | Adds product choices in every combination, and counts steps needed and gaps on each preset. Output in `additive.txt` |
| [`ladder-derivation/questions.mjs`](ladder-derivation/questions.mjs) | Tests each candidate question: what ticking it adds to the grey family, averaged over the other answers. Output in `questions.txt` |
| [`ladder-derivation/untested.mjs`](ladder-derivation/untested.mjs) | Places one shared ladder for greys, a brand colour, and feedback or chart colours, for status, charts, high contrast, bright surroundings and audience; and finds where each hue is most colourful. Output in `untested.txt` |
| [`ladder-derivation/charts.mjs`](ladder-derivation/charts.mjs) | Measures seven published chart palettes. Output in `charts.txt` |

## Sources

- Chernev, A., Böckenholt, U., & Goodman, J. (2015). [When product assortment leads to choice overload: A conceptual review and meta-analysis](https://www.kellogg.northwestern.edu/faculty/research/detail/2015/when-product-assortment-leads-to-choice-overload-a-conceptual). *Journal of Consumer Psychology, 25*(2), 333–358.
- Galesic, M., & Bosnjak, M. (2009). Effects of questionnaire length on participation and indicators of response quality in a web survey. *Public Opinion Quarterly, 73*(2), 349–360. Read through Hanson et al. (2025).
- Hanson, T., Aizpurua, E., Fitzgerald, R., & Vukovic, M. (2025). [Surely shorter is better? A questionnaire length experiment in a self-completion survey](https://ojs.ub.uni-konstanz.de/srm/article/download/8348/7668?inline=1). *Survey Research Methods, 19*(2).
- Yazdanian, R., Zia, L., Morgan, J., Mansurov, B., & West, R. (2019). [Eliciting new Wikipedia users' interests via automatically mined questionnaires](https://arxiv.org/pdf/1904.03889). arXiv:1904.03889.
- Kovesi, P. (2015). Good colour maps: How to design them. arXiv:1509.03700. See [`ladder-distribution.md`](ladder-distribution.md).
- Whittle (1992), and Kane & Bertalmío (2019), on crispening. See [`ladder-distribution.md`](ladder-distribution.md).
- Material. [DynamicSchemeVariant](https://api.flutter.dev/flutter/material/DynamicSchemeVariant.html).
- Radix Themes. [Theme props](https://cdn.jsdelivr.net/npm/@radix-ui/themes@3.2.1/dist/cjs/components/theme.props.d.ts).
- Chart palettes: Elastic EUI (`@elastic/eui-theme-borealis`) and Atlassian (`@atlaskit/tokens`), from their npm packages; Tableau 10, ColorBrewer Paired and Set2 from `d3-scale-chromatic` 3.1.0.
- Okabe, M., & Ito, K. (2008). Color universal design (CUD): How to make figures and presentations that are friendly to colorblind people. J\*Fly. Palette values as widely published.
- Nikitenko et al. (2026), on bright surroundings. See [`ladder-distribution.md`](ladder-distribution.md), Part 5.
- IBM Carbon, Tailwind, Primer, Polaris and Radix scales: measured from their packages, in [`ladder-distribution/scales/`](ladder-distribution/scales/).
