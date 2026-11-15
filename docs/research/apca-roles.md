# APCA beside WCAG 2: what each model is for

> Researched 15 November 2026 for CLR-17, with Benji. Decision: D-073. Scripts and output: [`apca/`](apca/). Related: D-006, D-013, [ADR 0002](../adr/0002-apca.md).

## Summary

- **On the default ladder, the light theme passes APCA's guidance comfortably. The dark theme doesn't.** Dark-theme muted text and control borders pass WCAG 2 AA but score far below APCA's guidance.
- **APCA isn't a stricter WCAG.** It's stricter for light-on-dark text, and more lenient for white labels on saturated mid-tones. So it can't sit above AAA as a third target.
- **Decided (D-073):** WCAG 2 is the requirement; APCA guides choices among options that already meet the WCAG target, and is shown beside every result.

## What we measured

The default recipe's AA ladder, grey family, with `apca-w3` 0.1.9 (the latest version, July 2022). Lc is shown as an absolute value; APCA reports light-on-dark pairs as negative.

| Theme | Pairing | Steps | WCAG 2 | APCA Lc | APCA guidance |
|---|---|---|---|---|---|
| Light | Body text on the page | 91 on 0 | 15.91:1 | 102.9 | 75 ✓ |
| Light | Muted text on the page | 50 on 0 | 4.61:1 | 72.0 | 60 ✓ |
| Light | Control border on the page | 37 on 0 | 3.07:1 | 57.6 | 45 ✓ |
| Light | Muted text on a card | 50 on 2 | 4.34:1 | 67.8 | 60 ✓ |
| Dark | Body text on the page | 8 on 95 | 14.36:1 | 89.6 | 75 ✓ |
| Dark | **Muted text on the page** | 45 on 95 | 4.56:1 | **33.5** | 60 ✗ |
| Dark | **Control border on the page** | 58 on 95 | 3.09:1 | **21.4** | 45 ✗ |
| Dark | **Muted text on a surface** | 45 on 91 | 3.97:1 | **31.9** | 60 ✗ |
| Both | White label on a fill | 0 on 50 | 4.61:1 | 77.5 | 60 ✓ |

At the grade rule's distances (D-049) on the light page, 37, 50 and 64 grades give Lc 57.6, 72.0 and 87.6. On the dark page they give Lc 21.4, 33.5 and 53.8. So even an AAA pairing (7.6:1) on the dark page falls short of APCA's 75 for body text.

To meet APCA's guidance, dark-theme muted text would need about grade 24 (L* 73) instead of 45, and dark body text about grade 15. Light body text on white needs about grade 53, just past AA's 50.

## APCA's guidance

From APCA's published levels ([APCA in a Nutshell](https://git.apcacontrast.com/documentation/APCA_in_a_Nutshell.html); [ARC Bronze Simple Mode](https://a11yreadtech.github.io/ARC/tests/bronze-simple-mode), marked beta):

- **Lc 90:** preferred for body text.
- **Lc 75:** minimum for body text.
- **Lc 60:** minimum for other content text.
- **Lc 45:** minimum for larger, heavier text, and for fine-detail or outline icons.
- **Lc 30:** absolute minimum for any other text, such as placeholder and disabled text, and for solid non-text shapes.
- **Lc 15:** absolute minimum for anything that must be discernible, such as dividers.

## The guidance values colouri.st uses

Agreed with Benji, 15 November 2026 (D-073). APCA has no AA or AAA, so an AA project aims for APCA's minimum and an AAA project for its preferred level. These drive suggestions only; WCAG 2 decides pass and fail.

| Use | AA project | AAA project |
|---|---|---|
| Body text | Lc 75 | Lc 90 |
| Large text | Lc 60 | Lc 75 |
| Interface elements (borders, icons) | Lc 45 | Lc 45 |

## Options considered

1. **Report only.** WCAG 2 drives everything, and APCA is shown alongside.
2. **Both must pass.** The mapping meets both models, so dark muted text and borders move much lighter, and the recipes need APCA ladders.
3. **Both for text, WCAG 2 for interface elements.**
4. **A scale of targets: AA, then AAA, then APCA (Benji).** Rejected as a scale, because APCA isn't uniformly stricter. A top tier would have to be "APCA plus AA", and would need its own ladders.
5. **APCA guides choices; WCAG 2 is the requirement (Benji). Chosen.** It uses APCA where it's strongest, in choosing combinations such as a label's colour on a saturated fill, without changing what passes.

## Limits

- Greys only, on one recipe. Brand colours on fills are where APCA and WCAG 2 disagree most about label colour; CLR-17's tests cover every example brand.
- APCA's guidance is still in development, and its levels are for text and objects of particular sizes and weights.
- `apca-w3` hasn't been updated since July 2022. ADR 0002 says the add-on tracks the latest version.
