# Colour relationships: what colouri.st represents

> Researched 29 and 30 October 2026 for CLR-13 and CLR-27. Benji's reframing, the token-layer research ([`token-layers.md`](token-layers.md)), the academic work on colour relationships, readability and perception, and the first pass at interaction states. Direction agreed by Benji (D-052). Scripts and outputs: [`colour-relationships/`](colour-relationships/). Related: [`ladder-distribution.md`](ladder-distribution.md), [`contrast-rule.md`](contrast-rule.md).

## How we got here

CLR-13's question 1 asked how interaction states are made: as ladder steps or as overlays. The first research pass is in "Interaction states" below. Benji then widened the question in three steps:

1. **States depend on creative choices.** A light mode with dark buttons, a dark mode with light buttons, or light buttons on a light page all need different hover states. Buttons and form fields handle states very differently from links or checkboxes. So colouri.st suggests and the person chooses, and mock-ups help them see the options.
2. **colouri.st represents relationships between colours.** People need to make choices that fundamentally work, in any number of themes, built from combinations of primitives. colouri.st can show the combinations that work and meet the accessibility requirements, so people can decide how things look.
3. **Themes are any permutation,** not just light and dark: different brand colours, different products, and more. And the relationships can be described without naming components, because they come down to combinations of colours used for text, backgrounds and boundaries:
   - some with no text at all
   - small or large
   - several side by side

   A test pattern could show those combinations, in every state, without being overly specific.

Benji also asked for a precise definition of the kinds of tokens a design system has ([`token-layers.md`](token-layers.md), D-051), and for academic work on colour relationships, readability and visual understanding to back the model up.

## The model

- **Primitives** are the colours and their steps: every family on its ladder. colouri.st generates them.
- **Semantic tokens** are roles defined by their relationships to other roles, such as text on a background, a state from its resting state, or a boundary on a surface. A semantic token doesn't name a grade.
- **A theme is one resolution:** every semantic token mapped to a primitive, for one combination of the dimensions the person defines. Dimensions might be brand, product, mode, contrast, or anything else, in any number. This matches the DTCG resolver module's modifiers and contexts.
- **colouri.st's core job:** for each semantic token in each resolution, show which primitives satisfy all its relationships, given the choices already made. It suggests a default, lets the person choose, and updates the rest. Invalid combinations are never offered as valid.
- **People choose by looking,** using a component-agnostic test pattern, described below.
- **Exports** carry primitives, semantic tokens and a resolver describing the dimensions, so the result travels in the DTCG format.

## What the research says

### 1. Readability comes from luminance contrast, not hue

- **Normal and low vision differ.** For normal vision, colour contrast alone can support fast reading, but only when it's high. People with low vision all read faster with luminance contrast. Colour and luminance contrast didn't add together: reading followed whichever was better (Legge, Parish, Luebker & Wurm, 1990).
- **Reading tolerates contrast loss until it doesn't.** For mid-sized text, a tenfold drop in contrast cost less than half the reading speed, but rates fell steeply below about 10% contrast (Legge, Rubin & Luebker, 1987). Maximum reading rates needed at least six times threshold contrast (Legge et al., 1990).
- **Contrast affects readability; hue affects liking.** "Colours with greater contrast ratio generally lead to greater readability," while hue mainly affected aesthetic ratings (Hall & Hanna, 2004).
- **Small text needs more.** Contrast mattered more at the extremes of character size (Legge et al., 1987).

**For colouri.st:** legibility is defined in luminance, which is what contrast grades are (D-041). Hue stays a creative choice, and small sizes need more.

### 2. A colour's appearance depends on its neighbours

- **Surrounds shift a colour's look.** A surround changes how a patch appears, most strongly along the luminance axis (Krauskopf, Zaidi & Mandler, 1986).
- **Lightness is judged relative to the scene.** It's anchored to the highest luminance in view. A large dark area tends to look lighter (Gilchrist et al., 1999, as developed by Bressan, 2006).

**For colouri.st:** relationships have to be judged in context, not as isolated swatches. That's the case for the test pattern, and part of why dark mode needs its own steps.

### 3. Regions group what's inside them

- **Uniform regions read as one.** Closed regions of uniform properties tend to be seen as single units: "uniform connectedness" (Palmer & Rock, 1994).
- **Elements inside a common region group together** (Palmer, 1992).

**For colouri.st:** a surface can group its contents with only a small separation, and either a fill or a boundary can make the region. So "a region from its surround" is a relationship, and the test pattern shows both a fill and a boundary version.

### 4. Standing out depends on the neighbours

- **Two rules of salience.** "Salience of a target increases with difference from the distractors" and with the distractors' homogeneity (Wolfe & Horowitz, 2017).
- **Lightness is a strong cue.** Colour and size are among the attributes that undoubtedly guide attention, and luminance polarity probably does.

**For colouri.st:** emphasis isn't a property of one colour. A primary action among several filled ones loses its pull. That's why the test pattern shows elements alone and side by side.

### 5. Interactive things need visible signals

Moran (2017) eye-tracked 71 people on nine page pairs. On pages with weak signals, such as flat ghost buttons and links styled like body text, tasks took 22% longer with 25% more fixations. Only 50% moved from a heading to the target link on a weak page, against 86% on a strong one.

**For colouri.st:** "interactive, distinct from static" is a relationship of its own, carried by a fill, a boundary or contrast.

### 6. Overlays look different over different backgrounds

Perceived transmittance depends on the contrast in the region an overlay covers, not only on the overlay. Darkening overlays look more transparent than lightening ones of the same physical transmittance (Singh & Anderson, 2002).

**For colouri.st:** the same overlay won't behave the same in light and dark mode, or over different surfaces, so states are measured in context. See also "Interaction states" below.

### 7. Taste follows patterns, but stays personal

- **Similar hues please; lightness contrast harmonises.** Pair preference and harmony both rise with hue similarity. Harmony rewards lightness contrast. A figure is preferred against a background of contrasting hue and lightness (Schloss & Palmer, 2011).
- **People vary.** Individual correlations between preference and harmony ranged from 0.75 to −0.03, so some people barely care about harmony.
- **Combinations aren't just their parts.** Preference for colour combinations was hard to predict from each colour alone. How the colours relate matters (Ou, Luo, Woodcock & Wright, 2004).

**For colouri.st:** sensible defaults exist. Surfaces and text come from one family, with lightness contrast, and accents get hue contrast. The choice stays with the person, and harmony is only ever a soft guide.

### 8. Meaning depends on the whole set

Semantic discriminability is "the degree to which observers can infer a unique mapping between visual features and concepts." It's a property of the whole set of colours and concepts, not of each one (Schloss and colleagues, 2021).

**For colouri.st:** distinctness between feedback colours (CLR-16, CLR-18) is checked as a set.

### 9. Size, viewing conditions and people vary

From [`ladder-distribution.md`](ladder-distribution.md), Part 8:
- Small marks need larger differences (Szafir, 2018, replicated by Hye, McNutt & Isaacs, 2026).
- Darker surrounds need more contrast (Liu & Fairchild, 2007).
- About 37% of people need noticeably larger differences than the rest.

## The relationships

None of these names a component. Every semantic token is defined by one or more of them.

| Relationship | Between | What makes it work | Target | Basis |
|---|---|---|---|---|
| **Legibility** | Text or an icon, and the area it's on | Luminance contrast, more for small sizes | WCAG ratio by AA or AAA (D-044, D-049), checked with APCA | §1, §9; WCAG 1.4.3, 1.4.11 |
| **Separation** | A region and its surround, by fill or boundary | Just visible; more in dark mode, for thin lines, and for less sensitive people | Separation in grades, by context (D-048 stand-ins) | §3, §9; ladder research |
| **Signifier** | Interactive and static | A visible fill, boundary or contrast | 3:1 where it's the only cue (1.4.11), otherwise a separation | §5; WCAG 1.4.11 |
| **Emphasis** | An element and its neighbours | Difference from neighbours, which depends on the set | Relative: ranked against siblings | §4 |
| **State** | A state and its resting state | A noticeable change, in a direction the person chooses | Separation; 3:1 change for focus at AAA (2.4.13) | §6; WCAG 2.4.13; 27 systems |
| **Distinctness** | Members of a set, such as feedback colours | Distinct in lightness and hue, as a set | Distinctness thresholds (CLR-16, CLR-18) | §8 |
| **Harmony** | Any pair, as a guide only | Hue similarity, lightness contrast | None. It shapes suggestions, never validity | §7 |

## The test pattern

A component-agnostic test pattern, like a television test card, shows every relationship in context. It varies:

| Dimension | Values |
|---|---|
| What's shown | Text, an icon, a boundary, a fill, a fill with text |
| Size | Small and large |
| How many | Alone, beside the same, beside a different one |
| Surround | Each surface, in each theme |
| State | Rest, hover, pressed, selected, focus, disabled |

**Prior art:** the contrast grid, which started at EightShapes, shows every foreground against every background, marked pass or fail. It covers pairs only, not size, boundaries, fills without text, adjacency, states or themes. We found nothing that covers that gap.

## Interaction states: the first pass

This came before the reframing. It still holds as evidence.

### How 27 design systems make neutral states

Measured from the [27-system data](ladder-distribution.md), in light mode:

| State | Solid colour | Translucent overlay | Not published |
|---|---|---|---|
| Hover | 14 | 7 (Atlassian, GitLab, Workday, Ant, Elastic, Material, MUI) | 6 |
| Pressed | 8 | 6 | 13 |
| Selected | 10 | 1 (MUI) | 16 |
| Subtle border | 22 | 4 | 1 |
| Fill hover and pressed | 16 of 16 sets | 0 | — |

**Hybrid approaches:**
- **Material** moved surfaces from overlays tied to elevation to five dedicated surface tones, "no longer tied to elevation" (Moser). It kept state layers for states: 8% hover, 10% focus and pressed, 16% dragged and 38% disabled, the same in light and dark (`@material/web`, `md-sys-state`).
- **Atlassian** uses solid surfaces with matching hover and pressed tokens, plus a transparent neutral for when "the background [needs] to adapt to different elevations".
- **Radix** ships alpha scales beside its solid ones.
- **Ferreira (2021)** recommends solid colours for containers and transparency for states. He counts 2 variables with transparency against 8 with solid colours, for one menu item.

### How overlays behave

Measured with [`colour-relationships/overlays.mjs`](colour-relationships/overlays.mjs):

1. **On any surface, consistently.** An 8% overlay of black gives 5.8 to 5.9 grades on white, a light card and a sunken surface alike. This is the real case for overlays: one token works on every surface.
2. **Not scaled for dark mode.** The same 8% of white gives 4.4 to 8.2 grades on dark backgrounds. Practice in dark mode is about 2.8 times light. Material's dark hover, at about 6.7 grades, is below the 27-system median of 9.6.
3. **Unevenly on coloured fills.** The same 8% black overlay changes the fill by 3.4 grades on blue but 5.5 on amber, and dulls it by 6 to 7%. A 12% white overlay changes it by 2.4 to 9.7 grades, cuts chroma by 10 to 12%, and shifts hue by up to 1.5°.
4. **Tools only half support them.** The DTCG colour format supports alpha, but has no way to express a colour composited over another, or derived from one. CSS can now derive states in the browser with `color-mix()` and relative colour syntax (Herron, 2025; Rupert, 2026).

### Where this leaves states

States are semantic tokens with a **state** relationship to their resting token. The engine works out each one from its target, in context: from the colour underneath, moved by the target number of grades, in the chosen direction, keeping hue and chroma. Benji's view is that steps and overlays aren't the basis of the model. Whether they're only an export format is still open.

## What changes

- **ADR 0005** said a semantic token names a grade. It now names its relationships, and each resolution records the primitive and grade chosen. ADR 0005 carries an amendment pointing to D-052.
- **The rules schema** (D-048) already has open lists of uses and contexts, and separation targets. Its semantic section holds four stand-in tokens, each with a grade per context and marked as a CLR-27 placeholder. CLR-27 redesigns that section around relationship types and theme dimensions.
- **US-06 (semantic mapping) and CLR-27 (light and dark mapping)** become the heart of the product, and will need rewriting around relationships, themes and the test pattern. That's for discussion with Benji, not done here.
- **The beta's guided flow** may still walk through a light and a dark theme first. The architecture supports any number of dimensions.
- **CLR-13's remaining questions** (how the ladder is derived, how many steps) now sit inside this model. The ladder serves the relationships.

## Open questions

1. Are steps and overlays only an export format, or do they shape the model anywhere?
2. How should emphasis be specified, given it's relative to siblings?
3. Which dimensions does the beta's guided flow walk through, and how are invalid combinations shown (D-004 limits depth in the beta)?
4. How are resolutions exported when dimensions interact, such as brand × mode? This is still open in the DTCG resolver (issue #381).
5. What's the smallest test pattern that shows every relationship? Test it with people (CLR-95).

## Files

| File | What it does |
|---|---|
| [`colour-relationships/states.mjs`](colour-relationships/states.mjs) | Classifies each system's neutral states as solid or overlay, from the 27-system data. Output in `states.txt` |
| [`colour-relationships/overlays.mjs`](colour-relationships/overlays.mjs) | Grade separation from fixed overlays on light and dark backgrounds, and their effect on coloured fills. Output in `overlays.txt` |

## Sources

### Academic

- Bressan, P. (2006). The place of white in a world of greys: A double-anchoring theory of lightness perception. *Psychological Review, 113*, 526–553. https://zenodo.org/record/894558/files/article.pdf
- Gilchrist, A., Kossyfidis, C., Bonato, F., Agostini, T., Cataliotti, J., Li, X., Spehar, B., Annan, V., & Economou, E. (1999). An anchoring theory of lightness perception. *Psychological Review, 106*(4), 795–834. Read through Bressan (2006); authors and pages to confirm in CLR-96.
- Hall, R. H., & Hanna, P. (2004). The impact of web page text-background colour combinations on readability, retention, aesthetics and behavioural intention. *Behaviour & Information Technology*. https://doi.org/10.1080/01449290410001669932. Abstract only; full reading in CLR-96.
- Krauskopf, J., Zaidi, Q., & Mandler, M. B. (1986). Mechanisms of simultaneous color induction. *Journal of the Optical Society of America A, 3*(10), 1752–1757.
- Legge, G. E., Parish, D. H., Luebker, A., & Wurm, L. H. (1990). Psychophysics of reading. XI. Comparing color contrast and luminance contrast. *Journal of the Optical Society of America A, 7*(10), 2002–2010.
- Legge, G. E., Rubin, G. S., & Luebker, A. (1987). Psychophysics of reading: V. The role of contrast in normal vision. *Vision Research, 27*(7), 1165–1177.
- Ou, L.-C., Luo, M. R., Woodcock, A., & Wright, A. (2004). A study of colour emotion and colour preference. Part III: Colour preference modeling. *Color Research & Application, 29*(5), 381–389. https://doi.org/10.1002/col.20047
- Palmer, S. E. (1992). Common region: A new principle of perceptual grouping. *Cognitive Psychology, 24*(3), 436–447. https://doi.org/10.1016/0010-0285(92)90014-S. Record only; full reading in CLR-96.
- Palmer, S., & Rock, I. (1994). Rethinking perceptual organization: The role of uniform connectedness. *Psychonomic Bulletin & Review, 1*(1), 29–55.
- Schloss, K. B., & Palmer, S. E. (2011). Aesthetic response to color combinations: Preference, harmony, and similarity. *Attention, Perception, & Psychophysics, 73*, 551–571. https://doi.org/10.3758/s13414-010-0027-0
- Schloss, K. B., and colleagues (2021). Context matters: A theory of semantic discriminability for perceptual encoding systems. arXiv:2108.03685. https://arxiv.org/abs/2108.03685. Full author list to complete.
- Singh, M., & Anderson, B. L. (2002). Toward a perceptual theory of transparency. *Psychological Review, 109*(3), 492–519.
- Wolfe, J. M., & Horowitz, T. S. (2017). Five factors that guide attention in visual search. *Nature Human Behaviour, 1*, 0058. https://doi.org/10.1038/s41562-017-0058
- Further sources on size, surround and individual differences are listed in [`ladder-distribution.md`](ladder-distribution.md).

### Practice

- Moran, K. (2017, 3 September). [Flat UI elements attract less attention and cause uncertainty](https://www.nngroup.com/articles/flat-ui-less-attention-cause-uncertainty/). Nielsen Norman Group.
- Moser, C. [Introducing tone-based surfaces in Material 3](https://m3.material.io/blog/tone-based-surface-color-m3). Material Design. From a copy Benji supplied; date to complete.
- Material state-layer opacities: `@material/web`, `tokens/v0_192/_md-sys-state.scss`.
- [Atlassian: Elevation](https://atlassian.design/foundations/elevation).
- [Radix: Scales](https://radix-ui.com/colors/docs/palette-composition/scales).
- Ferreira, E. (2021, 1 May). [Designing color systems: Transparent vs. solid shades](https://dev.to/eduferfer/designing-color-systems-transparent-vs-solid-shades-267g). DEV Community.
- Design Tokens Community Group. [Color module](https://www.designtokens.org/tr/drafts/color/) and [Resolver module 2025.10](https://www.designtokens.org/tr/drafts/resolver/).
- Herron, D. A. (2025, 11 December). [Color themes with Baseline CSS features](https://web.dev/articles/baseline-in-action-color-theme). web.dev.
- Rupert, D. (2026, 8 January). Algorithmic hover states with contrast-color(). daverupert.com, via [fooqux](https://fooqux.com/article/1972). Author attribution to confirm.
- [Contrast Grid](https://github.com/mherchel/contrast-grid), a maintained fork of EightShapes' tool.
- W3C. *Understanding WCAG 2.2*: [1.4.3](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html), [1.4.11](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html), [2.4.13](https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html).
