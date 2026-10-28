# ADR 0001 · Colour model for the engine

**Date:** 28 Oct 2026 · **Status:** Accepted · **Decided by:** Benji Greig · **Plane:** CLR-4 · **Decision log:** D-012

## Decision

Each step's lightness comes from **CIE L\* with a D65 white**. Each colour's **hue and vividness (chroma) are held in OKLCH**. Where a step would fall outside sRGB, vividness is reduced and lightness and hue are kept.

The engine keeps the lightness model and the hue/chroma model behind separate interfaces, so either can be replaced later (for example with HCT) without a rebuild.

## Context

colouri.st makes two promises that depend on the colour model:

1. **You can count steps to get contrast.** The distance between two steps predicts their contrast, in any colour and any pairing. For example, 7 steps apart meets 4.5:1 for text.
2. **Each colour stays itself.** A brand's blue stays blue in every shade, rather than drifting towards purple or cyan.

## Method

- **Brands:** three invented brand sets: pastel (5 colours), saturated (5) and close hues (4).
- **Ladder:** the same 13-step ladder for every model, in CIE L\* (D65): 98, 96, 92, 86, 78, 68, 57, 46, 35, 25, 17, 10, 5.
- **Hue and vividness:** each colour's own hue and vividness are held. Vividness is reduced only to stay in sRGB. No vividness curve is applied, so differences come from the model alone.
- **Measurements:**
  - worst-case WCAG 2 contrast by step distance, across every pairing of colours in a brand
  - hue drift across steps 200 to 900, judged in both OKLCH and CAM16
  - gamut clipping
  - ΔE2000 from each brand colour to its nearest step

The scripts and results are in [`../research/colour-model/`](../research/colour-model/).

## Results

| Model | Steps for 4.5:1 | Steps for 7:1 | Contrast at 7 steps apart | Worst hue drift (OKLCH) | Worst hue drift (CAM16) |
|---|---|---|---|---|---|
| CIE LCh (D50, common default) | 7 | 9 | 4.65 to 10.12 | 26.9° | 14.0° |
| CIE LCh (D65) | 7 | 8 | 4.90 to 10.05 | 28.8° | 16.1° |
| OKLCH alone | 7 | 9 | 4.57 to 11.36 | 3.7° | 13.7° |
| **Hybrid: L\* (D65) + OKLCH hue** | **7** | **8** | **4.78 to 10.04** | **3.7°** | 13.4° |
| HCT | 7 | 8 | 4.91 to 10.05 | 14.3° | 4.8° |

**What the numbers show:**

- **CIE L\*'s white point matters.** WCAG measures contrast against a D65 white. Using D50 made contrast vary with hue and broke the rule for one brand.
- **CIE L\* turns vivid blues lavender** between steps 200 and 500, even with the right white point.
- **OKLCH alone breaks the counting promise.** Equal OKLCH lightness doesn't give equal luminance across hues, so contrast at a given step distance spreads widely.
- **The two hue models disagree about vivid blues.** OKLCH and CAM16 each score best by their own measure, so the side-by-side visual comparison carries as much weight as the numbers.
- **Pastels barely differ.** The largest difference between any two models at any step was ΔE 1.9. The choice matters most for vivid colours, where it reached ΔE 11.4 for the saturated blue.

## Alternatives

- **CIE LCh (D65):** exact contrast, but vivid blues drift towards purple.
- **OKLCH alone:** best hue stability, but contrast by step distance isn't reliable, which undermines what we teach.
- **HCT:** exact contrast and the closest match to source colours. But CAM16 maths is heavy to implement and to explain, and its blues lean towards periwinkle in the light-to-mid steps.

## Consequences

- The engine solves for an OKLCH colour whose CIE L\* (D65) matches each ladder step.
- Export can use CSS `oklch()` values directly, with sRGB hex fallbacks.
- Gamut reduction in the beta engine must find the maximum in-gamut vividness at each step. The analysis script used a coarse reduction that dulled a few steps (for example the saturated green at 500), and the real engine must not.
- A reference page with the best case and worst case is available for discussion (private Claude artifact, linked from CLR-4).
