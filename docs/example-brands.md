# Example brands

Invented brands for demos, tests and "Try an example" (US-01, CLR-9). Together they cover what the engine has to handle. Any resemblance to a real business is unintended. Names were checked with a quick web search on 3 November 2026, not a trademark search.

Each colour's role (primary, secondary, tertiary or mono) is part of the brand data, as Benji agreed on 3 November 2026.

## Doggly: the saturated brand

Bright, playful collars, leads and toys for dogs with big personalities. The colours are loud on purpose: a teal primary with hot pink, grape and tangerine accents.

| Role | Name | Hex | L* | Chroma | Hue | Against white |
|---|---|---|---|---|---|---|
| Primary | Verdigris | `#1b998b` | 57 | 36 | 183° | 3.51:1 |
| Secondary | Neon pink | `#ff297b` | 56 | 80 | 7° | 3.59:1 |
| Secondary | Dusty grape | `#53599a` | 40 | 40 | 293° | 6.44:1 |
| Secondary | Tangerine dream | `#ff9b71` | 74 | 50 | 49° | 2.06:1 |

**What it tests:** gamut mapping, with Neon pink near the edge of sRGB; brand colours in the middle of the ladder that miss 4.5:1 against white (Verdigris and Neon pink); and four hues spread around the wheel.

## Kerfwell: strong primary, own greys

An online store for carpenters and keen DIYers: timber, fixings and hand tools, delivered fast. A strong brick red and a steady blue, with its own near-black and a warm off-white.

| Role | Name | Hex | L* | Chroma | Hue | Against white |
|---|---|---|---|---|---|---|
| Primary | Brick red | `#bb0a21` | 39 | 74 | 32° | 6.61:1 |
| Secondary | Air Force blue | `#4b88a2` | 54 | 23 | 238° | 3.93:1 |
| Mono | Mono dark | `#252627` | 15 | 1 | — | 15.16:1 |
| Mono | Mono light | `#fff9fb` | 98 | 2 | 354° | 1.04:1 |

**What it tests:** a dark, saturated primary; greys supplied by the brand rather than generated, with a near-white that carries a faint pink tint; and a muted secondary.

## Sorrel: the pastel stress test, with close hues

Small-batch soap made with herbs and botanicals. Soft pinks and leafy greens, chosen to feel gentle, and close enough together to be hard to tell apart.

| Role | Name | Hex | L* | Chroma | Hue | Against white |
|---|---|---|---|---|---|---|
| Primary | Pink mist | `#d991ba` | 68 | 35 | 343° | 2.41:1 |
| Secondary | Sage green | `#60992d` | 58 | 61 | 127° | 3.45:1 |
| Secondary | Muted olive | `#8cae68` | 67 | 40 | 127° | 2.51:1 |
| Tertiary | Pink orchid | `#ebb9df` | 81 | 27 | 333° | 1.67:1 |
| Tertiary | Petal frost | `#f5d5ed` | 89 | 17 | 333° | 1.34:1 |

**What it tests:** light colours bunching at the top of the ladder; the similar-hue check (CLR-18), twice, since Sage green and Muted olive share a hue, as do Pink orchid and Petal frost; and Pink mist only 10° from the other pinks.

## How the figures were worked out

L*, chroma and hue are CIE LCh(ab) under D65; contrast is WCAG 2 against white. They describe the inputs only. What the engine does with each colour is CLR-14's to test.
