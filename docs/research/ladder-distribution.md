# Ladder distribution: how shades are used, and how context changes their spacing

> Researched 29 October 2026 for CLR-13 (ladder presets), at Benji's request, in five passes. The first looked at nesting and step counting. The second surveyed how ten design systems shape their scales. The third added academic work and dark-mode scales. The fourth, after Benji reframed the question, measured how 27 design systems use their shades, in light, dark and high-contrast modes, and matched each use and context to the research. The fifth looked through academic work and practitioner articles for ideas no design system has taken up yet. Scripts and data: [`ladder-distribution/`](ladder-distribution/). Follow-up research with people: CLR-95. Articles: CLR-92.

## Question

**How are shades used to meet a product's needs, and how do the contexts a product is used in change how far apart those shades need to be?**

It breaks into three parts:

1. **Uses:** what jobs shades do in an interface, and how much separation each needs, and from what.
2. **Contexts:** which contexts change those separations, and by how much.
3. **Where the steps go:** given a product's uses and contexts, where the ladder's steps should sit.

### How the question got here

- **Nesting.** CLR-13 first asked whether the 11 and 15-step ladders should be subsets of the 13. Benji chose to design them independently (option B, below).
- **Step counting.** Working out the options showed that counting steps predicts contrast poorly on an uneven ladder.
- **Shapes.** Benji wasn't sure he agreed with the approach, and asked how established systems spread their steps, then for academic work to back it up, so we could take a view or offer several configurations. That led to four "shapes" of ladder.
- **Needs.** Benji asked what needs each shape meets. The first answer mixed up needs, perception mechanisms and design-system practice. Benji pointed out that practice and methods aren't needs.
- **Uses and contexts.** Benji suggested framing it around how shades are used to meet a product's needs, and how context affects their spacing. That's the question above. The fourth pass redid the research around it.
- **More systems, and better ideas.** Benji asked whether to add the most-used systems beyond the first 20, and to look through academic work and articles for ideas nobody has implemented yet, since practice doesn't prove there's nothing better. That's the fifth pass: seven more systems (MUI, shadcn/ui, Mantine, daisyUI, Salesforce Lightning, Uber Base Web, Zendesk Garden) and Part 8.

## Summary

- **The current 13-step ladder already puts a step near where 27 design systems put each use,** in light and dark mode: surfaces, hover, pressed, borders, fills, muted text and text. Most uses are within about 2 contrast grades of a step; the furthest is light-mode muted text, at about 6.
- **It has too few steps in two places:**
  - **Near each background.** Products need five or six distinct uses close to the page (surface, sunken surface, hover, pressed, selected, subtle border), and the ladder has three steps within 10 grades of white and three within 18 of black, so uses have to share.
  - **Around solid fills.** A fill's hover moves about 8 grades from the fill in practice, but the ladder's middle steps are 12 to 13 grades apart. Many systems use translucent overlays for states instead of scale steps.
- **Context changes the separations a lot:**
  - In dark mode, systems use about twice the grade separation for surfaces and states.
  - High-contrast modes use about twice again.
  - Bright surroundings make light steps about 60% harder to see.
  - Older eyes need more contrast, especially in dim light.
- **The perception research explains these patterns:**
  - We see small differences best near the background (crispening).
  - In bright tones we can tell apart steps of about 1% in luminance, but dark tones need larger steps.
  - Dark text on light is read more accurately, so dark mode isn't light mode flipped.
- **Research points to better ideas than current practice** (Part 8):
  - Borders and other thin elements need more separation than large surfaces, because small things are harder to tell apart.
  - APCA already sets contrast targets by use.
  - Colour appearance models can account for the viewing surround.
  - A "more contrast" version of every theme can be derived from the same targets.
  - Thresholds should be set for the less sensitive third of people, not the average.
- **What follows for colouri.st:** a product's uses and contexts set target separations from its background, and the ladder should put steps at those targets. That's derivable and explainable, and it's what recipes (CLR-94) would bundle. No decision has been made yet beyond nesting.

## Part 1: nesting

**Nesting** means the 11-step ladder is the 13 with two steps removed, and the 15 is the 13 with two added, so a shared step is exactly the same colour in every ladder.

| Option | 11 steps | 13 steps | 15 steps |
|---|---|---|---|
| A. Nested on today's 13 | Drop L\* 96 and 10: smooth | Unchanged, as tested in ADR 0001 | Add two steps mid-ladder: uneven, with grade gaps of about 6 beside 12 |
| B. Independent, same shape | Smooth | Unchanged | Smooth |
| C. Nested from a new 15 | A big jump at the dark end | Changes from what ADR 0001 tested | Smooth |

**Benji chose B on 29 October 2026.** Nesting mattered when steps were named by position. Tokens now name a contrast grade (D-041) and the engine uses the nearest step, so changing ladder size keeps every token at about the same contrast without nesting. What B gives up: a team running an 11-step product beside a 13-step one won't get exactly the same hex values for shared steps, though their grades still line up.

The 11 and 15-step ladders in option B resample the 13-step shape (L\* as a smooth curve of position, from 98 to 5):

| Ladder | L\* | Grades |
|---|---|---|
| 11 | 98, 95.4, 89.9, 81.4, 70.1, 57.0, 43.8, 30.8, 20.0, 11.2, 5.0 | 2, 4, 8, 16, 27, 41, 57, 72, 85, 92, 97 |
| 13 | 98, 96, 92, 86, 78, 68, 57, 46, 35, 25, 17, 10, 5 | 2, 3, 7, 12, 19, 29, 41, 54, 67, 79, 88, 93, 97 |
| 15 | 98, 96.4, 93.3, 88.8, 82.8, 75.3, 66.5, 57.0, 47.6, 38.1, 29.1, 21.4, 14.9, 9.2, 5.0 | 2, 3, 6, 9, 15, 22, 31, 41, 52, 64, 74, 83, 89, 94, 97 |

These follow today's shape. Parts 4 to 7 suggest the shape itself should follow uses and contexts.

## Part 2: step counting on an uneven ladder

On a ladder with fine steps at the ends and coarse ones in the middle, a step count that's safe anywhere has to allow for the narrow ends, so it overstates what the middle needs.

| Ladder | 3:1, safe anywhere (at best) | 4.5:1 | 7:1 |
|---|---|---|---|
| 11 steps | 5 (3) | 6 (4) | 7 (5) |
| 13 steps | 6 (3) | 7 (4) | 8 (6) |
| 15 steps | 7 (4) | 8 (5) | 10 (7) |

Evenly spaced steps wouldn't fix it. They'd give up fine steps near the background, and need about 5 steps for 3:1 everywhere. Contrast grades (D-041) avoid the problem: 37 apart is 3:1, 50 is 4.5:1 and 64 is 7:1, on any ladder. Whether colouri.st should state its rule in grades or in steps is still open, and CLR-95 tests which people use more accurately.

## Part 3: how design systems shape their scales

The blue and grey scales of ten systems, taken from their npm packages and measured in CIE L\* and contrast grade. "CV" is how uneven the gaps are, in L\* (0 is perfectly even). "Light, middle, dark" counts the steps in each third of the grade range.

| Scale | Steps | L\* range | CV | Light, middle, dark | 3:1 safe anywhere (at best) |
|---|---|---|---|---|---|
| colouri.st 13 | 13 | 98–5 | 0.37 | 6, 2, 5 | 6 (3) |
| Tailwind 4 blue / slate | 11 / 11 | 97–16 / 98–2 | 0.32 / 0.54 | 5, 3, 3 / 5, 2, 4 | 5 (4) / 5 (2) |
| Radix blue / slate | 12 / 12 | 99–21 / 99–12 | 0.97 / 1.07 | 8, 3, 1 / 8, 3, 1 | 8 (2) / 8 (2) |
| IBM Carbon blue / grey | 10 / 10 | 96–7 / 96–7 | 0.16 / 0.17 | 4, 2, 4 / 4, 2, 4 | 4 (3) / 4 (3) |
| Ant Design blue | 10 | 96–15 | 0.11 | 4, 3, 3 | 5 (3) |
| Open Props blue / grey | 13 / 13 | 96–22 / 98–1 | 0.22 / 0.79 | 5, 5, 3 / 6, 1, 6 | 6 (6) / 6 (2) |
| USWDS blue / grey | 10 / 15 | 97–8 / 99–0 | 0.17 / 0.59 | 4, 3, 3 / 8, 3, 4 | 5 (3) / 8 (3) |
| Adobe Spectrum blue / grey | 16 / 13 | 98–3 / 100–0 | 0.18 / 0.73 | 6, 4, 6 / 7, 2, 4 | 6 (5) / 7 (3) |
| GitHub Primer blue / grey | 10 / 14 | 95–14 / 100–14 | 0.21 / 1.04 | 4, 3, 3 / 8, 2, 4 | 5 (3) / 8 (2) |
| Shopify Polaris blue / grey | 16 / 16 | 99–12 / 100–9 | 0.74 / 0.90 | 10, 3, 3 / 11, 2, 3 | 10 (3) / 11 (2) |
| Atlassian blue / grey | 12 / 11 | 95–17 / 98–12 | 0.27 / 0.44 | 5, 4, 3 / 4, 3, 4 | 5 (4) / 4 (4) |

What stands out:

- **Accent scales are mostly close to even.** Radix and Polaris are the exceptions, packing steps near white.
- **Greys are almost always less even than accents.** Greys carry the surfaces.
- **Accents stop short of white and black; greys don't.**
- **Dark scales mirror light ones.** Radix's dark scales, and the dark greys of Primer and Spectrum, pack their steps near black. Primer's dark blue stays close to even.
- **Surface steps are very fine:**

  | System | Light surfaces | Dark surfaces |
  |---|---|---|
  | Fluent 2 | 6, about 1.7 L\* apart | 2.7 to 5.4 apart |
  | Material 3 | 7, between L\* 87 and 100 | 7, between L\* 4 and 24 |
  | AGDS | 4, about 3.5 apart | — |

  AGDS also has brand-coloured sections with 4 surfaces about 6 L\* apart around L\* 37. GOV.UK builds each colour from its brand colour, with tints of 25% to 95% and shades of 10% to 50%.

Ant Design's grey array starts at L\* 68, so it's a different kind of scale and is left out of the comparisons.

## Part 4: how shades are used

The semantic colour tokens of 27 design systems, from their published npm packages, in light and dark mode, and for three of them high-contrast modes too. Apple's come from its Human Interface Guidelines, and shadcn/ui's from its GitHub repository.

- **Product and company systems:** GitHub Primer, Atlassian, GitLab Pajamas, Shopify Polaris, Twilio Paste, SAP Fiori Horizon, Red Hat PatternFly, Workday Canvas, IBM Carbon, Microsoft Fluent 2, Elastic EUI, Adobe Spectrum, Material 3, Salesforce Lightning (SLDS), Uber Base Web, Zendesk Garden, Apple (iOS)
- **Government systems:** GOV.UK, the Australian Government Design System (AGDS)
- **Widely used libraries:** Bootstrap, Ant Design, Radix, Chakra UI, MUI (Material UI), shadcn/ui, Mantine, daisyUI

Each use is measured from the page:
- surfaces and states, as a CIE L\* difference and a contrast grade difference
- borders, fills and text, as a WCAG 2 contrast ratio

Translucent colours are composited over the page. Polaris, Workday, GOV.UK, AGDS and SLDS publish light mode only. Carbon is measured with its White and Gray 100 themes. daisyUI makes its borders and muted text with opacity inside components, so only its surfaces, fill and text are measured.

### Light mode (27 systems)

| Use | Grades from the page, median (range) | Contrast ratio, median | L\* difference, median |
|---|---|---|---|
| Surface | 1.9 (0–4) | 1.06:1 | 2.3 |
| Sunken surface | 3.1 (0–7.6) | 1.10:1 | 3.8 |
| Hover | 3.4 (0–14.8) | 1.11:1 | 4.2 |
| Pressed | 7.9 (0.7–17.6) | 1.27:1 | 9.4 |
| Selected | 2.8 (0–9.1) | 1.09:1 | 3.5 |
| Subtle border | 8.9 (1.6–17.6) | 1.31:1 | 10.5 |
| Control border | 36.7 (3.4–97.7) | 3.06:1 | 39 |
| Solid fill | 52.9 (38–100) | 5.01:1 | 53.1 |
| Muted text | 59.4 (39–76) | 6.11:1 | 58.5 |
| Text | 91 (69–100) | 15.98:1 | 87 |

### Dark mode (22 systems)

| Use | Grades from the page, median (range) | Contrast ratio, median | L\* difference, median |
|---|---|---|---|
| Surface | 4.0 (0–7.6) | 1.13:1 | 5.0 |
| Sunken surface | 7.9 (0–14.8) | 1.27:1 | 9.6 |
| Hover | 9.6 (3.7–21.3) | 1.34:1 | 11.6 |
| Pressed | 10.8 (4–27.6) | 1.39:1 | 13.7 |
| Selected | 12 (4.6–22.8) | 1.44:1 | 15.1 |
| Subtle border | 14.2 (7.1–27.6) | 1.54:1 | 15.7 |
| Control border | 32.4 (7.1–70.5) | 2.68:1 | 32.8 |
| Solid fill | 57.6 (25.6–98) | 5.78:1 | 52.6 |
| Muted text | 70.7 (46–78) | 8.6:1 | 66.4 |
| Text | 88.9 (73.5–100) | 14.96:1 | 86.6 |

**Findings:**

- **Dark mode roughly doubles the separation for surfaces and states,** and increases it for subtle borders. Text contrast stays about the same.
- **Dark-mode surfaces are lighter than the page in 19 of 21 systems** that separate them. Raised means lighter.
- **Dark-mode pages are rarely pure black.** The median is L\* 6.8 (range 0 to 16.6).
- **Muted text is usually well above 4.5:1:** a median of 6.1:1 in light mode and 8.6:1 in dark. Three fall short: Mantine in light (3.3:1) and dark (4.0:1), and SLDS's weak text on its grey page (4.2:1).
- **Control borders often fall below 3:1:** 12 of 26 systems in light mode, and 11 of 21 in dark. The most-used libraries are among them, including MUI, shadcn/ui, Mantine, Bootstrap, Ant Design and Chakra. WCAG 1.4.11 requires 3:1 only when nothing else, such as a fill or a label, identifies the control (Part 6). Base Web fills its inputs instead.
- **Some libraries use black, or near-black, as their primary fill:** shadcn/ui, Chakra and Base Web. That's why the fill's range reaches 100.

### High-contrast modes (Primer, Atlassian, Apple)

| Use | Light, high contrast (median grades) | Dark, high contrast |
|---|---|---|
| Surface | 5.7 | 5.7 |
| Hover | 9.4 | 14.8 |
| Subtle border | 20.9 | 36.6 |
| Control border | 67.5 (7.8:1) | 73.9 (9.5:1) |
| Muted text | 87.5 (14.3:1) | 78.4 (10.9:1) |

Separations roughly double again, and borders and muted text move to text-level contrast. Three systems is a small sample.

### States of solid fills

How far a primary fill's hover and pressed states move from the fill, in grades, across 16 light and dark sets (Primer, Atlassian, GitLab, Polaris, SAP, Fluent 2, Ant Design, Carbon, Radix):

- **Hover:** a median of 8 grades (range 2.9 to 14.1)
- **Pressed:** usually 10 to 27 grades. SAP inverts its pressed state, so it's an outlier.

Material and Atlassian make many states from translucent overlays (Material's are 8% and 10% of the text colour) rather than separate scale steps.

## Part 5: how contexts change the separations

| Context | What changes | Evidence |
|---|---|---|
| **Dark mode** (polarity) | Surfaces, states and subtle borders need about twice the grade separation; raised surfaces get lighter | Measured in 16 systems (Part 4). We tell luminance apart at about 1% steps in bright tones, but need larger steps in dark tones (Wyszecki and Stiles, via Part 6). Apple: in dark mode, "the base colors are dimmer… and the elevated colors are brighter" |
| **Reading in dark mode** | Dark text on light is read and proofread more accurately, at any age; the advantage grows as text gets smaller | Piepenbrock, Mayr and Buchner (2013, 2014), Buchner, Mayr and Brandt (2009). NN/g recommends offering both modes, as dark mode can help some people with low vision, such as those with cataracts |
| **Bright surroundings** (phones outdoors) | Light colours get harder to tell apart: about 60% at L\* 95, from the dimmest to the brightest surround; dark colours hold up | Nikitenko et al. (2026), a lab study, so likely a lower bound. Apple: "In bright surroundings, colors look darker and more muted" |
| **Increased-contrast settings** | Separations roughly double again; borders and muted text reach text-level contrast | Measured in Primer, Atlassian and Apple. CSS exposes the setting as `prefers-contrast: more` |
| **Age** | More contrast is needed, especially for fine detail and in dim light: older adults need about three times the contrast in dim (scotopic) conditions | Owsley (2010). WCAG's 4.5:1 allows for the contrast sensitivity loss that comes with age |
| **Low vision** | Text needs more contrast: 4.5:1 allows for about 20/40 vision, and 7:1 for about 20/80 | WCAG 2.2 Understanding 1.4.3 |
| **Colour vision deficiency** | Lightness carries the meaning, so contrast that doesn't depend on hue serves everyone | WCAG 2.2 Understanding 1.4.3 |
| **Charts and data** | Steps must look equal across the whole range; uneven steps distort reading by more than 7% | Kovesi (2015), Crameri, Shephard and Heron (2020), Harrower and Brewer (2003) |
| **The AA or AAA target** | Raises text from 4.5:1 to 7:1 (D-044) | WCAG 2.2 |

## Part 6: what the research says about each use

| Use | Separation needed | Evidence |
|---|---|---|
| **Surfaces** | Just above the threshold of seeing a difference, near the background | We tell two greys apart best when they're close to the background's lightness: the crispening effect (Whittle, 1992; Kane and Bertalmío, 2019). The luminance step we can just see is about 1% in bright, adapted viewing, larger in dark tones (Wyszecki and Stiles, 1982). A just noticeable difference of about 2.3 in CIELAB ΔE\*ab is often quoted (Sharma, 2003). Systems use about 2.6 L\* in light mode, above both |
| **Hover** | Noticeable; no contrast requirement | WCAG 1.4.11: hover effects are supplemental and "do not themselves need to contrast 3:1" |
| **Focus** | A 3:1 change between focused and unfocused states, at AAA | WCAG 2.4.13 Focus Appearance: "Many people can't see small changes in visual appearance, including older people" |
| **Selected and other states** | 3:1 for anything needed to show the state | WCAG 1.4.11 |
| **Borders** | 3:1 only when no other visual cue identifies the control | WCAG 1.4.11: a boundary is "only required when there is no other visual way to identify the presence of the control" |
| **Solid fills** | 3:1 from the page when the fill identifies the control; the text on it needs 4.5:1 or 7:1 | WCAG 1.4.11 and 1.4.3 |
| **Text** | 4.5:1 or 7:1; fluent reading needs contrast "several times threshold" | WCAG 1.4.3, building on ISO 9241-3's 3:1. Whittaker and Lovie-Kitchin (1993): contrast reserve |
| **Data** | Even lightness steps | Kovesi (2015): "ensure that the magnitude of the incremental change in perceptual lightness of the colours is uniform". Crameri, Shephard and Heron (2020) |

## Part 7: colouri.st's ladder against practice

Median practice from Part 4 (27 systems), against the nearest step of the current 13-step ladder. In light mode, steps are counted from the lightest (L\* 98); in dark mode, from the darkest (L\* 5).

| Use | Light: practice | Light: nearest step | Dark: practice | Dark: nearest step |
|---|---|---|---|---|
| Surface | 1.9 | step 1, at 1 | 4.0 | step 1, at 4 |
| Hover | 3.4 | step 2, at 5 | 9.6 | step 2, at 9 |
| Pressed | 7.9 | step 3, at 10 | 10.8 | step 2, at 9 |
| Subtle border | 8.9 | step 3, at 10 | 14.2 | step 3, at 18 |
| Control border | 36.7 | step 6, at 39 | 32.4 | step 4, at 30 |
| Solid fill | 52.9 | step 7, at 52 | 57.6 | step 6, at 56 |
| Muted text | 59.4 | step 8, at 65 | 70.7 | step 7, at 68 |
| Text | 91.0 | step 11, at 91 | 88.9 | step 10, at 90 |

Most uses land within about 2 grades of a step, and all within about 6 (light-mode muted text, which sits between steps 7 and 8). There are two shortfalls:

1. **Uses share steps near the backgrounds.** In light mode, pressed and subtle border both land on step 3. In dark mode, hover and pressed both land on step 2. Sunken and selected surfaces would also need steps of their own.
2. **The middle is too coarse for fill states.** A fill's hover moves about 8 grades, but the middle steps are 12 to 13 apart.

This is the "thin middle" Benji was uneasy about, explained by a use rather than by taste.

## Part 8: ideas from research that design systems haven't taken up

Practice shows what works well enough, not what's best. These ideas come from academic work and practitioner writing, and few or none of the 27 systems use them:

1. **Separation should depend on size.**
   - Small things are harder to tell apart. Szafir (2018) modelled colour difference by mark size, and a 2026 replication confirmed it (Hye, McNutt and Isaacs): the just noticeable L\* difference was 8.5 for marks 0.25° across, against 4.6 at 2°. A\* and b\* differences were much harder to see than lightness at every size.
   - This explains why subtle borders sit about four times further from the page than surfaces (8.9 grades against 1.9): a 1px line is a small mark.
   - **For colouri.st:** set separation targets by size as well as use. Thin borders and small icons get more than panels.
2. **Contrast targets already exist by use, in APCA.**
   - APCA's levels are set by use:
     - Lc 90 preferred for body text
     - Lc 75 minimum for body text
     - Lc 60 for other content text
     - Lc 45 for large text and detailed icons
     - Lc 30 for placeholder, disabled and spot text
     - Lc 15 for dividers, large buttons and thick focus outlines, below which "designers should treat anything… as invisible"
   - That's the uses framework this research arrived at, for text and some non-text.
   - **For colouri.st:** check each use's target in both WCAG 2 grades and APCA Lc, which ADR 0002 already plans as a check.
3. **Colour appearance models account for the viewing surround.**
   - CIECAM02 and CAM16 take an "average", "dim" or "dark" surround and an adapting luminance. A darker surround needs more contrast for the same appearance. Liu and Fairchild (2007) measured smaller surround effects than the classic Bartleson–Breneman values (ratios of 1.0 : 1.10 : 1.14 against 1.0 : 1.25 : 1.50), but in the same direction.
   - Material's HCT is built on CAM16, but with fixed viewing conditions.
   - **For colouri.st:** contexts such as dark mode in a dark room, or a phone outdoors, could be modelled rather than guessed, by generating each context's targets under its own viewing conditions. No system we measured does this.
4. **Adapt to the environment.**
   - Yu, Chen and Li (2016) found brightness adjustment alone doesn't keep phones readable and comfortable across lighting (over 200 volunteers). Colour-scheme adaptation driven by the ambient light sensor did better.
   - **For colouri.st:** an "outdoor" or "bright surroundings" theme could be generated from the same targets, like a high-contrast one.
5. **Every theme can have a "more contrast" version.**
   - Only Primer, Atlassian and Apple ship one among the 27, though CSS exposes the setting as `prefers-contrast: more`. Their separations roughly double.
   - **For colouri.st:** generate one automatically from the same uses with higher targets, so every project supports the setting.
6. **Design for the less sensitive third.**
   - People vary a lot. In the 2026 replication of Reinecke et al.'s crowdsourced study, about 37% of participants needed noticeably larger colour differences than the rest. Uncontrolled displays and adaptive brightness also made differences harder to see than in the lab.
   - **For colouri.st:** set minimum separations from the less sensitive end, not the average, especially for surfaces, where practice sits close to the threshold.
7. **Vivid colours look lighter than their luminance says.**
   - The Helmholtz–Kohlrausch effect: saturated colours, especially reds, pinks and blues, look brighter than a grey of the same luminance. Nayatani (1997) and Fairchild and Pirrotta (1991) model it.
   - **For colouri.st:** vivid fills may look closer to light text than their grade suggests. This is a possible refinement for CLR-15 (vividness) and CLR-17 (checks), not a replacement for WCAG.
8. **Designers' ramps aren't straight lines.**
   - Smart, Wu and Szafir (2019) learned from designer-made ramps. They found non-linear paths and smaller chroma changes at the ends, and people read values more accurately with ramps modelled on them than with linear ones.
   - **For colouri.st:** the 27-system dataset could be used the same way, as a reference for curve presets in CLR-15.
9. **Keep measuring lightness in CIE L\*, not OKLCH lightness.**
   - A widely shared 2026 article argues that OKLCH lightness mixes in hue and chroma, so steps of equal OKLCH lightness don't contrast equally, and recommends CIE L\* for measuring where colours sit.
   - This matches ADR 0001: L\* for lightness, OKLCH for hue and chroma.

## What it means for colouri.st

These are implications to discuss, not decisions:

- **Derive the ladder from uses and contexts.** A product's uses set target separations from its background or backgrounds, and its contexts scale them:
  - dark mode about two times
  - increased contrast about two times again
  - bright surroundings wider at the light end
  - AAA higher for text

  The ladder puts steps at those targets: fine and plentiful near each background, coarser between the background and text, and closer around fills if states are steps. Each placement can be explained in the guided flow (job 10).
- **Decide how states are made:** as ladder steps, which needs more steps around each fill, or as overlays over whatever is underneath, as Material and Atlassian do. This affects the rules schema (ADR 0005) and the light and dark mapping (CLR-27).
- **Recipes** (CLR-94) would bundle a product's uses and contexts into named starting points, with any setting changeable and shapes allowed to differ between groups such as greys and accents.
- **The beta** still needs a default. The current shape matches common practice for a product with light and dark mode, so it's a reasonable starting point while CLR-95 runs.

## Limits

- **Practice isn't proof of need.** Medians across 27 systems describe what's common, not what people need. CLR-95 tests the gaps with people.
- **Token choices are ours.** We chose which token stands for each use. Some are approximate:
  - **Apple:** it publishes grey values but not which grey each role uses.
  - **Spectrum:** its hover and borders are palette steps, as it has no single neutral alias for them.
  - **Material 3:** measured as greys of the same tone, which gives the same luminance.
  - **Material and Radix:** their roles come from their documented step purposes.
- **Some samples are small.** Only three high-contrast modes, and 9 to 21 values for some states.
- **shadcn/ui is measured from its own site's theme,** which uses a black primary, rather than one of its generated themes.
- **Some papers were read at second hand.** Whittle (1992), Kane and Bertalmío (2019), Whittaker and Lovie-Kitchin (1993) and Wyszecki and Stiles (1982) were read through abstracts or citing sources, not in full. They're marked to check in CLR-92 and CLR-93.
- **The bright-surroundings finding is one 2026 lab study.**
- **The data is a snapshot,** read from npm packages and websites on 29 October 2026.

## What's next

- **CLR-95:** survey and unmoderated tests covering:
  - how many surface layers and states products really use
  - how often people are in each context
  - whether people can see these separations on their own phones, indoors and outdoors
  - whether designers expect states to be steps or overlays
  - which contrast rule people use more accurately
- **CLR-13:** the decisions above, starting with how states are made.
- **CLR-92:** the article on these findings.
- **CLR-93:** the glossary, which gets these terms and sources.

## Files

All in [`ladder-distribution/`](ladder-distribution/). Each folder has its own `package.json` with exact versions, and each script has a docstring.

| Folder | What's in it | Run |
|---|---|---|
| `ladder/` | The grade and step-counting maths (`ladders.py`), the nesting search (`nest_search.py`) and the four distributions (`distributions.py`), with their outputs | `python3 ladders.py` (needs numpy and scipy) |
| `scales/` | Part 3: extraction of ten systems' scales, dark scales and surfaces, and the analysis | `npm install`, then `node extract.mjs`, `python3 analyse.py`, `node extract-dark.mjs`, `python3 analyse-dark.py` |
| `uses/` | Parts 4 and 7: semantic tokens of 27 systems (`extract.mjs`, with shadcn/ui's theme saved in `sources/`), separations (`measure.mjs`), fill states (`fill-hover.mjs`) and the comparison with the ladder (`compare-ladder.mjs`), with their outputs | `npm install --legacy-peer-deps --ignore-scripts`, then each script in that order |

## Sources

### Academic and standards

- Buchner, A., Mayr, S., & Brandt, M. (2009). The advantage of positive text-background polarity is due to high display luminance. *Ergonomics*. Reference to complete.
- Crameri, F., Shephard, G. E., & Heron, P. J. (2020). The misuse of colour in science communication. *Nature Communications*, 11, 5444. https://doi.org/10.1038/s41467-020-19160-7
- Harrower, M., & Brewer, C. A. (2003). ColorBrewer.org: An online tool for selecting colour schemes for maps. *The Cartographic Journal*, 40(1), 27–37. https://doi.org/10.1179/000870403235002042
- Kane, D., & Bertalmío, M. (2019). A reevaluation of Whittle (1986, 1992) reveals the link between detection thresholds, discrimination thresholds, and brightness perception. *Journal of Vision*, 19(1), 16. https://doi.org/10.1167/19.1.16
- Kovesi, P. (2015). Good colour maps: How to design them. arXiv:1509.03700. https://arxiv.org/abs/1509.03700
- Nikitenko, D., Flatla, D. R., Patel, D., Hahn, A., Kaparykha, U., Lukaszek, K., Ranaweera, N., & Quinlan, G. (2026). Seeing your screen outside: Surround effects on brightness discrimination. *Graphics Interface 2026*. https://cs.uwaterloo.ca/~dvogel/gi2026/papers/1075b.pdf
- Owsley, C. (2010). Aging and vision. *Vision Research*, 51(13), 1610–1622. https://pmc.ncbi.nlm.nih.gov/articles/PMC3049199
- Piepenbrock, C., Mayr, S., and others (2013). Positive display polarity is advantageous for both younger and older adults. *Ergonomics*. Authors and reference to complete.
- Piepenbrock, C., Mayr, S., & Buchner, A. (2014). Positive display polarity is particularly advantageous for small character sizes. *Human Factors*. Reference to complete.
- Sharma, G. (Ed.). (2003). *Digital color imaging handbook*. CRC Press. Cited for the ΔE\*ab just noticeable difference of 2.3, via [Wikipedia: Color difference](https://en.wikipedia.org/wiki/Color_difference).
- Whittaker, S. G., & Lovie-Kitchin, J. (1993). Visual requirements for reading. *Optometry and Vision Science*. Reference to complete. https://scispace.com/papers/visual-requirements-for-reading-wiycfczpxo
- Whittle, P. (1992). Brightness, discriminability and the "crispening effect". *Vision Research*, 32(8), 1493–1507. https://pubmed.ncbi.nlm.nih.gov/1455722
- Wyszecki, G., & Stiles, W. S. (1982). *Color science: Concepts and methods, quantitative data and formulae* (2nd ed.). Wiley. Cited for the 1% Weber fraction, via [Strolls with my Dog: Smooth gradients and the Weber–Fechner fraction](https://www.strollswithmydog.com/smooth-gradients-weber-fechner-ratio/).
- Is it possible to improve the weighting function for lightness in the CIEDE2000 color-difference formula? *Color Culture and Science Journal (CCSJ)*. https://jcolore.gruppodelcolore.it/ojs/index.php/CCSJ/article/view/ccsj.i102018.07. Authors and reference to complete.
- Fairchild, M. D., & Pirrotta, E. (1991). Predicting the lightness of chromatic object colors using CIELAB. *Color Research & Application*, 16(6). Reference to complete; cited via [Wikipedia: Helmholtz–Kohlrausch effect](https://en.wikipedia.org/wiki/Helmholtz-Kohlrausch).
- Hye, S. D., McNutt, A. M., & Isaacs, K. E. (2026). Ten years later: Replicating two color discrimination studies. arXiv. https://arxiv.org/pdf/2608.24789. First author's name to confirm.
- Liu, C., & Fairchild, M. D. (2007). Re-measuring and modeling perceived image contrast under different levels of surround illumination. *Color and Imaging Conference*, 15, 66–70. https://library.imaging.org/cic/articles/15/1/art00013
- Nayatani, Y. (1997). Simple estimation methods for the Helmholtz–Kohlrausch effect. *Color Research & Application*, 22(6). Reference to complete.
- Smart, S., Wu, K., & Szafir, D. A. (2019). Color crafting: Automating the construction of designer quality color ramps. arXiv:1908.00629. https://arxiv.org/abs/1908.00629
- Stone, M., Szafir, D. A., & Setlur, V. (2014). An engineering model for color difference as a function of size. *22nd Color and Imaging Conference*. https://www.tableau.com/research/publications/engineering-model-color-difference-function-size
- Szafir, D. A. (2018). Modeling color difference for visualization design. *IEEE Transactions on Visualization and Computer Graphics*. https://cmci.colorado.edu/visualab/VisColors/
- Yu, J., Chen, Y., & Li, J. (2016). Color scheme adaptation to enhance user experience on smartphone displays leveraging ambient light. *IEEE Transactions on Mobile Computing*, 16(3), 688–701. https://doi.org/10.1109/TMC.2016.2575824
- W3C. (2023). *Understanding WCAG 2.2*: [1.4.3 Contrast (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html), [1.4.11 Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html), [2.4.13 Focus Appearance](https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html).
- MDN Web Docs. [prefers-contrast](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-contrast).
- Somers, A. [APCA introduction](https://github.com/Myndex/apca-introduction).
- Somers, A. [APCA in a nutshell](https://git.apcacontrast.com/documentation/APCA_in_a_Nutshell): the use-based Lc levels.
- [Stop using OKLCH lightness for your color scale](https://uxdesign.cc/stop-using-oklch-lightness-for-your-color-scale-02025deca49d). UX Collective (2026). Author to confirm.
- Arnott, K. (2020, 26 October). [Introducing the new ColorBox](https://kvyn.medium.com/introducing-the-new-colorbox-e0109c021729). Lyft's tool, which shapes steps with Bézier easing curves.

### Practice

- Apple. Human Interface Guidelines: [Color](https://developer.apple.com/design/human-interface-guidelines/color) and [Dark Mode](https://developer.apple.com/design/human-interface-guidelines/dark-mode).
- Koopersmith, D., & Miner, W. (2019, 15 October). [Designing accessible color systems](https://stripe.com/blog/accessible-color-systems). Stripe.
- Nielsen Norman Group. Dark mode vs. light mode: Which is better? Summarised via [gi-radar](https://gi-radar.de/tl/DC-0313). Original URL and date to complete.
- [Adobe Spectrum: Color system](https://spectrum.adobe.com/page/color-system); [Radix: Understanding the scale](https://www.radix-ui.com/colors/docs/palette-composition/understanding-the-scale); [IBM Carbon: Color overview](https://carbondesignsystem.com/elements/color/overview/); [USWDS: Color tokens](https://designsystem.digital.gov/design-tokens/color/overview/); [GOV.UK Design System: Colour](https://design-system.service.gov.uk/styles/colour).
- [WebAIM Million 2026](https://webaim.org/projects/million/): low-contrast text on 83.9% of home pages.
- Android Authority. [Dark mode reader poll](https://androidauthority.com/dark-mode-survey-results-3682352): a reader poll, not a representative survey.
- Token and scale data from npm packages, read on 29 October 2026, with exact versions in each folder's `package.json`.
