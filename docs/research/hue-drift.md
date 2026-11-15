# Hue drift: what threshold to hold the engine to

> Researched 15 November 2026 for CLR-14 and US-03. The stand-in in the rules, `hue.maxDrift`, is 10°. Benji asked whether that's too loose. Script and output: [`hue-drift/`](hue-drift/). Related: [ADR 0001](../adr/0001-colour-model.md), D-012, D-047.

## Summary

- **A threshold in degrees measures the wrong thing.** How visible a hue change is depends on chroma. The same angle is obvious in a vivid colour and invisible in a near-grey. At chroma 0.25, 10° is more than two just noticeable differences (JND). At chroma 0.02, 10° is about a sixth of one.
- **The engine holds OKLCH hue exactly** (D-012, D-047), so the only drift in what it controls comes from rounding to hex. On the three example brands, that drift is at most 0.0012 as a hue difference: about a sixteenth of a JND. In degrees it reaches 7.3°, but only in the lightest step, where the chroma is close to nothing.
- **Recommendation:** measure drift as a hue difference weighted by chroma (ΔH in OKLab units), not as an angle. Hold it to **0.01, half a JND**. That's tight enough that no drift the threshold allows is visible, and loose enough to absorb hex rounding with a wide margin. In degrees, it allows about 2.3° at chroma 0.25, 5.7° at 0.10 and 11.5° at 0.05.
- **Perceived drift is a separate question.** An independent appearance model, CAM16, sees 0.7° to 3.8° of drift across the middle steps of each colour, and more in the palest tints. That's where the colour models disagree with each other, not something the engine can correct. Report it in the method comparison (US-03), but don't use it as a threshold.

## Why degrees mislead

A hue difference is an arc, not an angle. Its size depends on how far from grey the colour is:

> ΔH = 2 · √(C₁ · C₂) · sin(Δh / 2)

CIEDE2000 weights hue differences by chroma for the same reason. CSS Color 4 sets one JND in OKLCH at a difference of 0.02 ([CSS Color 4, §14.2.1](https://www.w3.org/TR/css-color-4/#gamut-mapping)), and uses that figure to decide when gamut mapping is close enough.

Degrees allowed by a hue difference of 0.01 (half a JND) and 0.02 (one JND):

| Chroma (OKLCH) | Example | 0.01 | 0.02 |
|---|---|---|---|
| 0.02 | Near-grey | 29° | 60° |
| 0.05 | Petal frost | 11.5° | 23.1° |
| 0.10 | Verdigris, Pink mist | 5.7° | 11.5° |
| 0.15 | Sage green | 3.8° | 7.6° |
| 0.20 | Brick red | 2.9° | 5.7° |
| 0.25 | Neon pink | 2.3° | 4.6° |

A flat 10° allows two JNDs of drift in Neon pink, and would flag Kerfwell's Mono dark (19° of rounding drift at chroma 0.002), which no one could see.

## What we measured

Each example colour was built the way the method builds it: CIE L* from the default recipe's AA ladder, OKLCH hue and chroma from the source, and chroma reduced only to fit sRGB. Each step was then rounded to hex, as people will use it. Drift was measured against the source's hue across every step except the white page.

| Colour | Source chroma | Most drift in OKLCH (degrees) | Most drift in OKLCH (ΔH) | Perceived drift, middle steps (CAM16, degrees) |
|---|---|---|---|---|
| Verdigris | 0.104 | 1.3° | 0.0012 | 1.5° |
| Neon pink | 0.245 | 3.6° | 0.0011 | 0.7° |
| Dusty grape | 0.104 | 1.8° | 0.0010 | 3.8° |
| Tangerine dream | 0.133 | 5.4° | 0.0011 | 1.9° |
| Brick red | 0.199 | 7.3° | 0.0012 | 0.9° |
| Air Force blue | 0.075 | 1.5° | 0.0010 | 3.6° |
| Mono dark | 0.002 | 19.1° | 0.0009 | n/a (near-grey) |
| Mono light | 0.007 | 8.8° | 0.0010 | n/a (near-grey) |
| Pink mist | 0.101 | 2.1° | 0.0009 | 1.8° |
| Sage green | 0.151 | 0.6° | 0.0005 | 2.1° |
| Muted olive | 0.103 | 0.3° | 0.0005 | 3.3° |
| Pink orchid | 0.076 | 1.9° | 0.0011 | 2.9° |
| Petal frost | 0.047 | 1.7° | 0.0009 | 2.9° |

- **The largest OKLCH drifts in degrees all sit in the lightest step** (L* 97.7), where gamut mapping leaves about 0.01 chroma. For example, Brick red's 7.3° is `#fff6f6`. As a hue difference, it's the same size as everywhere else.
- **The middle steps are L* 75 to 23,** close to ADR 0001's steps 200 to 900. The CAM16 figures there are lower than ADR 0001's 13.4° worst case, which came from a saturated blue in a different brand set.
- **Near-greys have no meaningful hue drift.** Their hue is kept as supplied (D-064), and any drift is too small to see.

## For the rules and CLR-14

- `hue.maxDrift` becomes a hue difference in OKLab units, `0.01`, with its reason, in place of `degrees: 10`.
- The engine reports each family's worst ΔH, and also its worst angle, so the interface can say "about 3° in your darkest step" in terms people know.
- US-03's "unless the sRGB limit forces it" stays: gamut mapping keeps hue exactly (D-047), so in practice only hex rounding moves it, and that stays far below the threshold.

## Correction

- **15 November 2026:** the first version of `drift.py` had a typo in one sRGB matrix value (`1053342` where CSS Color 4 has `1053270`), found by Claude Code while planning CLR-14. Fixing it moved some figures in the second decimal place; the tables above use the corrected run. No finding changed.

## Limits

- One ladder (the default recipe at AA) and 13 colours. The AAA ladder and other recipes share most steps, so the results should hold, but CLR-14's property tests check every recipe.
- The JND of 0.02 is CSS Color 4's working figure, not a measured threshold for hue alone. Hue discrimination varies with hue and with the person (Mahy, Van Eycken and Oosterlinck, 1994; the Farnsworth-Munsell 100 hue test). Half a JND leaves room for that.
- CAM16 was run with average surround and a 20% background, as a check, not as ground truth.

## Sources

- W3C. [*CSS Color Module Level 4*, §14.2 Gamut mapping](https://www.w3.org/TR/css-color-4/#gamut-mapping): one JND in OKLCH is a difference of 0.02.
- Lilley, C. [*Better than Lab? Gamut reduction CIE Lab & OKLab*](https://www.w3.org/Graphics/Color/Workshop/slides/talk/lilley), W3C workshop: CIE Lab's blues drift towards purple as chroma falls; OKLab's don't.
- Uchida, N. (2026). [*Oklch+: A three-parameter extension of Oklab*](https://arxiv.org/pdf/2606.05255), arXiv preprint: OKLab's hue is uniform in appearance, but that doesn't make it uniform for discrimination.
- Sharma, G., Wu, W. & Dalal, E. (2005). The CIEDE2000 colour-difference formula. *Color Research & Application*, 30(1): the chroma-weighted hue term.
