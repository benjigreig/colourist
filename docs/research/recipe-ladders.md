# Recipe ladders: the beta recipes, worked out step by step

> Worked out 30 October 2026 for CLR-13, before CLR-100 builds recipes into the rules schema. Decided the same day (D-056). Scripts and outputs: [`ladder-derivation/`](ladder-derivation/) (`recipes.mjs`, `recipes.json`, `prevalence.mjs`). Builds on [`ladder-zones.md`](ladder-zones.md) (D-054, D-055).

## Why this came first

The first CLR-100 ticket told Claude Code to use today's 13-step ladder as a stand-in for the default recipe, and D-054 said the default recipe "builds something close to today's 13 steps". Claude Code's plan then anchored on the old model, as Benji spotted:
- **Its first check was the contrast rule on the 13 steps,** which says nothing about ladders built in zones.
- **It fitted zones to the 13 steps afterwards,** from grade 19 up and so on.
- **It had to invent one placeholder purpose per zone,** because the 13 steps were never placed for a purpose.

Under D-054, every step exists because a use put it there. So the recipe ladders had to be worked out by the model first, with each step's zone and purpose coming from it.

**Correction:** "close to today's 13 steps" was never checked, and the model doesn't support it. The default recipe needs 21 steps (below).

## How each ladder is worked out

[`recipes.mjs`](ladder-derivation/recipes.mjs) places one ladder shared by every colour family and theme (D-053), using the ranges in [`model.mjs`](ladder-derivation/model.mjs).

- **Families:** every recipe carries greys, one brand colour and four feedback colours (error, warning, success, info), since feedback colours are always in the beta (US-05). The warning has a light fill with dark text, where yellows are most vivid. The others have white text.
- **Preferred positions:**
  - separations sit at their target (the 27-system medians)
  - contrast uses sit on their threshold (37, 50 and 64 grades from each page)
  - text sits where practice puts it (91 grades from the light page, 89 from the dark)
  - white-text fills sit on 50, and fill states move darker by 8 and 15
- **Sharing:** a token reuses an existing step in its range when its own family and theme isn't already using that step. Otherwise a new step goes at its preferred grade, at least 1 grade from every other step.
- **Checks:**
  - every use has a step in its range
  - rounded names are unique
  - the contrast rule (D-049) holds on exact values: names 37, 50 or 64 apart give 3:1, 4.5:1 or 7:1
  - where rounding alone breaks the rule, one step is nudged by up to 1 grade within its ranges
- **Zones** come from the positions. The light background zone runs up to the furthest light-theme background use, the dark background zone from the nearest dark-theme one, and the contrast zone sits between.

## The six recipes

| Recipe | Answers | Themes | Steps | Light zone | Contrast | Dark zone |
|---|---|---|---|---|---|---|
| Content site, light | reading, controls | light | 12 | 4 | 8 | 0 |
| Content site, light and dark | reading, controls | light, dark | 18 | 4 | 9 | 5 |
| Simple app, light and dark | + cards | light, dark | 19 | 5 | 9 | 5 |
| **Layered app, light and dark (default)** | + cards, overlays | light, dark | **21** | 6 | 9 | 6 |
| App, light | + cards, overlays, selection | light | 15 | 7 | 8 | 0 |
| App, light and dark | + cards, overlays, selection | light, dark | 23 | 7 | 9 | 7 |

All six pass every check. One step needed nudging for rounding: a warning hover moved from 22.0 to 21.8 grades. The full steps of each are in [`recipes.txt`](ladder-derivation/recipes.txt) and [`recipes.json`](ladder-derivation/recipes.json).

### The default recipe

| Name | L\* | Zone | What placed it |
|---|---|---|---|
| 0 | 100 | Light background | Light: page |
| 2 | 97.7 | Light background | Light: surface |
| 3 | 96.2 | Light background | Light: sunken surface |
| 4 | 95.0 | Light background | Light: hover; every colour's tint |
| 8 | 90.6 | Light background | Light: pressed. Dark: text |
| 9 | 89.4 | Light background | Light: subtle border; every tint border |
| 14 | 83.7 | Contrast | Both: warning fill (dark text) |
| 22 | 75.5 | Contrast | Both: warning fill hover |
| 29 | 68.3 | Contrast | Both: warning fill pressed |
| 37 | 60.8 | Contrast | Light: control border (3:1) |
| 45 | 53.3 | Contrast | Dark: muted text, colour text (4.5:1) |
| 50 | 49.4 | Contrast | Light: muted text, colour text. Both: colour fills (4.5:1 with white text) |
| 58 | 42.4 | Contrast | Dark: control border (3:1) |
| 61 | 40.2 | Contrast | Both: colour fill hover |
| 68 | 34.4 | Contrast | Both: colour fill pressed |
| 81 | 23.2 | Dark background | Dark: subtle border; every tint border |
| 85 | 20.0 | Dark background | Dark: pressed |
| 86 | 18.8 | Dark background | Dark: hover; every colour's tint |
| 88 | 17.1 | Dark background | Dark: sunken surface |
| 91 | 13.1 | Dark background | Light: text. Dark: surface |
| 95 | 6.8 | Dark background | Dark: page |

## What the ladders show

- **The middle steps land on the thresholds,** as D-054 expected: 37 and 50 from the light page, and 45 and 58 from the dark one. Step counting works there.
- **Light and dark share steps where the model allows.** Dark-theme text is the light pressed step, light-theme text is the dark surface, and every coloured fill serves both themes.
- **Coloured tints share the grey hover step,** and tint borders the subtle border step, so feedback colours add no steps of their own. The warning's light fill and its states add three, in the band between the light zone and the contrast zone.
- **The pages are steps:** white at 0, and a dark page at L\* 6.8, the median dark page across 22 systems. The old ladder's lightest step was L\* 98.
- **The warning's light fill is only about 1.4:1 from the white page.** It relies on its text, or a border, to stand out. That's common for yellow badges, and colouri.st should say so.

## The minimum gap between steps

Near the light page, steps are about 1 grade apart, roughly 1.1 to 1.2 L\*. In the default recipe, page, surface, sunken surface and hover all sit within 4 grades of white. Those are the median separations design systems use, but they're near the limit of what people can see, and the less sensitive third may not see them ([`ladder-distribution.md`](ladder-distribution.md), Part 8).

**Benji's decision:** start with 1 grade, and test both 1 and 2 grades with people in CLR-95. At 2 grades, those uses would spread out to about grades 0, 2, 4 and 6: clearer, and further from the page than practice puts them.

## Choosing the default recipe

Benji wanted light and dark by default, and the default to reflect the most common answers. What we know:

**Design systems** ([`prevalence.mjs`](ladder-derivation/prevalence.mjs), 27 systems):
- **22 of 27 (81%) publish a dark mode.** Polaris, Workday, GOV.UK, AGDS and Salesforce Lightning don't.
- **In light mode, each use's own value, distinct from the page:**

  | Use | Systems |
  |---|---|
  | Fill | 27 |
  | Subtle border, control border | 26 each |
  | Muted text | 25 |
  | A second surface layer, standing in for overlays | 23 |
  | Cards or panels | 22 |
  | Hover | 20 |
  | Pressed | 14 |
  | Selection | 10 |

- **Only 3 of 27** have a high-contrast mode.

**The web and apps as a whole are mostly light only:**
- Only 5.11% of over 100,000 websites use `prefers-color-scheme` (Project Wallace, 2026).
- At least 19% of 809 tracked apps show a dark mode or theme toggle (Lazyweb, 2026). That's a lower bound, from a vendor's own app library rather than an independent study, and it doesn't count apps that just follow the device.

**Choice:** colouri.st's users are building colour systems (D-022), so the design-system figures are the better guide. The most common shape there is light and dark, with cards and a second surface layer, but without a selected state. None of the first five recipes matched, so a sixth was added, **layered app, light and dark**, and made the default.

**Caveats:**
- The 27 systems are mostly large product teams, so they lean towards complex apps.
- The systems publish tokens, not uses, so counts are proxies.
- Neither web figure measures design-system teams.
- CLR-95 can ask colouri.st's own users directly.

## Limits

- Steps are placed by a greedy method, which gives a good answer but not a proven minimum.
- Separations come from practice medians. The 1-grade gap is a stand-in until CLR-95.
- Every recipe assumes white text on coloured fills, and one light-fill warning. Brands whose colours need dark text get different fills, which the vividness stage handles (US-04).

## Files

| File | What it does |
|---|---|
| [`ladder-derivation/recipes.mjs`](ladder-derivation/recipes.mjs) | Works out each beta recipe's ladder and checks it. Output in `recipes.txt` and `recipes.json` |
| [`ladder-derivation/prevalence.mjs`](ladder-derivation/prevalence.mjs) | Counts how many of the 27 systems publish each use and a dark mode. Output in `prevalence.txt` |
| [`ladder-derivation/model.mjs`](ladder-derivation/model.mjs) | Gains the shared-ladder model (theme, family tokens and separation tables), moved out of `untested.mjs`, whose output is unchanged |

## Sources

- Project Wallace. [The CSS Selection, 2026 edition](https://deploy-preview-119--projectwallace.netlify.app/the-css-selection/2026). Over 100,000 websites.
- Lazyweb Research (Abouelatta, A.). (2026, 7 July). [What percent of mobile apps have a dark-mode or theme toggle?](https://www.lazyweb.com/research/what-percent-of-apps-have-a-dark-mode-toggle.md) Vendor research, 809 apps.
- The 27 design systems: see [`ladder-distribution.md`](ladder-distribution.md), Part 4.
