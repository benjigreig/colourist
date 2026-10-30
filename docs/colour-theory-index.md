# Colour theory index

Questions already answered. Check here before raising a colour question, then build on the answer rather than reopening it, unless Benji reopens it.

- **Settled:** decided, with the decision or research linked.
- **Earlier work, to re-validate:** answered in Benji's earlier, private colour work. It's confirmed against public research or our own test before it's relied on, then marked settled and linked to where that's recorded. No detail from that work goes in this repo.
- **Open:** being worked on.

Terms are defined in the glossary (CLR-93). Each row stays one line and links to the detail.

| Question | Answer | Where | Status |
|---|---|---|---|
| What sets lightness, and what sets hue and chroma? | CIE L\* (D65) for lightness; OKLCH for hue and chroma | [D-012](decision-log.md), [ADR 0001](adr/0001-colour-model.md) | Settled |
| Does chroma affect contrast? | No. Contrast depends only on L\*, so chroma can be tuned freely | [D-012](decision-log.md); earlier work | Settled; re-validate the measurement |
| How are steps within a family told apart? | By their L\* gap | [D-012, D-026](decision-log.md) | Settled |
| How are families told apart? | By ΔE across every shade, allowing for the ends, and checked under colour vision deficiency | [D-026](decision-log.md) | Settled; thresholds still open (CLR-16, CLR-18) |
| Can the lightest and darkest steps carry a colour's identity? | No. They sit close to neutral or converge | [D-026](decision-log.md); earlier work | Settled |
| Should the ladder be symmetric, so dark mode is light mode inverted? | No. A symmetric ladder can have a usable light end or dark end, not both. Light and dark are paired by mapping, not by arithmetic | Earlier work | Earlier work, to re-validate and record |
| How is contrast named and stated? | Contrast grades: a difference in grades gives WCAG 2 contrast; 37, 50 and 64 on colouri.st's own steps | [D-041, D-043, D-049](decision-log.md) | Settled |
| Should step counts be the rule? | No, only a guide | [D-049](decision-log.md), [contrast-rule.md](research/contrast-rule.md) | Settled |
| Which ladder sizes? | No fixed sizes. Each project has one fixed ladder, built in three zones from its choices; recipes give starting points (D-005 and D-050 superseded) | [D-054](decision-log.md), [ladder-zones.md](research/ladder-zones.md) | Settled |
| Which recipe is the default? | Layered app, light and dark (reading, controls, cards, overlays): 21 steps, the most common shape among 27 design systems | [D-056](decision-log.md), [recipe-ladders.md](research/recipe-ladders.md) | Settled; check with users (CLR-95) |
| How far apart must steps be? | At least 1 grade (about 1.2 L\* near white), as practice uses near the page | [D-056](decision-log.md) | Settled for now; CLR-95 tests 1 and 2 grades |
| Where do a recipe's step values come from? | The model places every step by the uses that need it, with its zone and uses recorded; no stand-in ladders | [D-056](decision-log.md), [`recipes.json`](research/ladder-derivation/recipes.json) | Settled |
| How common is dark mode? | 22 of 27 design systems; about 5% of websites use `prefers-color-scheme` | [recipe-ladders.md](research/recipe-ladders.md) | Settled (measured) |
| Why do steps bunch at the ends? | Background zones need small, visible differences (crispening; dark tones need bigger steps); the contrast zone needs big jumps, placed on the thresholds | [D-054](decision-log.md), [ladder-zones.md](research/ladder-zones.md) | Settled |
| Why not even steps, like familiar ladders? | They're less even in contrast than they look, and even-ladder systems add hover colours or overlays outside the scale; colouri.st puts those steps in the ladder. Data palettes stay even | [ladder-zones.md](research/ladder-zones.md) | Settled |
| How does colouri.st find out what a product needs? | Three groups of tick-box questions at the ladder stage (what people do, how it's put together, where and how it's seen), shown as modelled examples; only ask what changes the outcome | [D-055](decision-log.md), [ladder-zones.md](research/ladder-zones.md) | Settled; modelled examples to design and test (CLR-95) |
| Does brand style (neutral, tinted, vivid) change the ladder? | No. It changes chroma, so it decides which step a vivid fill sits on; asked at the vividness stage | [D-012, D-055](decision-log.md) | Settled |
| Where is each hue most colourful? | Yellows, greens and cyans light (grades 5 to 15); reds about 44; blues and violets dark (57 to 69) | [ladder-zones.md](research/ladder-zones.md) | Settled (measured); confirms earlier work |
| What do charts need from colour? | An ordered sequence of distinct hues, often with a lighter partner each, at shared steps; not full scales. From an existing secondary palette or one offered from the brand | [D-055](decision-log.md), CLR-55 | Settled; after the beta |
| Does one contrast model decide everything? | No. WCAG 2 for compliance, with APCA checked alongside, since they can disagree on saturated mid-tones | [D-006](decision-log.md), [ADR 0002](adr/0002-apca.md); earlier work | Settled |
| Is chroma recovery a finding or a judgement? | A judgement, chosen by eye. The ceiling limits vivid colours more than recovery does | Earlier work | Earlier work, to re-validate (CLR-15) |
| Do hues peak in colourfulness at the same lightness? | No. Yellows peak light and reds and blues mid, so fills can't share one step | Earlier work | Earlier work, to re-validate (CLR-15) |
| Should feedback colours come from the brand? | No. They're chosen for separation from it, from a survey of established systems | [D-007, D-026](decision-log.md) | Settled |
| Decorative versus functional borders? | A decorative divider needn't reach 3:1; a border that identifies a control must | WCAG 1.4.11; earlier work; [ladder-distribution.md](research/ladder-distribution.md), Part 4 | Settled |
| Can one focus colour serve a light surface and a dark fill? | No. Use a pair or a two-tone ring | Earlier work | Earlier work, to re-validate; belongs in CLR-27 |
| How is the ladder derived from uses and contexts? | One shape for every family, from the recipe's ladder (D-054); mapping flags tokens with no step in range; after the beta, in-between steps are added only where a family's mapping needs them | [D-053](decision-log.md), [ladder-derivation.md](research/ladder-derivation.md) | Settled |
| Can existing steps move? | Yes, in new work, re-spaced to keep gaps distinct. They stay fixed for imported systems, and optionally once a project is in use | [D-053](decision-log.md) | Settled |
| Are exports trimmed to the steps in use? | No. Full ladders are exported as primitives | [D-053](decision-log.md) | Settled |
| How do semantic tokens relate to steps? | Through their relationships; each theme resolves them | [D-051, D-052](decision-log.md), [colour-relationships.md](research/colour-relationships.md) | Settled |
| Are states steps or overlays? | Still open | [D-052](decision-log.md) | Open |
