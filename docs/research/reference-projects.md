# Reference projects: what they've learnt

> Reviewed 29 October 2026 for CLR-8. Reference, not reuse (D-008): we write our own code, informed by how these projects solve things, and credit the ideas in the decision log. Nothing here is copied into colouri.st.

Each project was read from its public repository or website. Source code was read but not run.

## Summary

| Project | What it is | Licence | Last activity | Most useful to us |
|---|---|---|---|---|
| [Material Color Utilities](https://github.com/material-foundation/material-color-utilities) (Google) | The colour engine behind Material Design 3 | Apache 2.0 | 19 Oct 2026 | Roles defined by tone, background and a contrast curve; versioned colour specs |
| [Leonardo](https://github.com/adobe/leonardo) (Adobe) | Colours generated from target contrast ratios | Apache 2.0 | 8 Jul 2026 | Contrast as the input, not the check; a theme-wide contrast multiplier |
| [Huetone](https://github.com/ardov/huetone) | A web app for hue-by-tone palettes with predictable contrast | MIT | 19 Nov 2023 | The palette as a grid of hues and tones; sharing by link |
| [Radix custom palettes](https://github.com/radix-ui/website) | Radix Colors' generator for custom 12-step scales | MIT | 7 Oct 2026 | Every step has a stated purpose; separate light and dark scales |
| [Color.js](https://github.com/color-js/color.js) | A colour science library by editors of the CSS colour specs | MIT | 26 Oct 2026 | Gamut mapping and colour difference to test our own engine against |
| [Style Dictionary](https://github.com/style-dictionary/style-dictionary) | A build system that turns design tokens into platform formats | Apache 2.0 | 28 Oct 2026 | Exports as transforms and formats over one token source |
| [Atmos](https://atmos.style/) | A commercial palette tool | Proprietary, not open source | — | Shows people expect LCH and OKLCH, APCA and WCAG 2, curves and P3 |

## Material Color Utilities

**Approach.** Colours are built in HCT (hue, chroma, tone), where tone is CIE L\*. A source colour becomes a set of tonal palettes, each holding hue and chroma steady while tone varies. Semantic roles such as `primary` and `on_primary` are each defined by:
- the palette they come from
- the tone to use in light and in dark mode (for example, primary is tone 40 in light and 80 in dark)
- the role they sit on
- a `ContrastCurve` giving the contrast to reach at low, normal, medium and high contrast levels (for example 3, 4.5, 7 and 7)
- a `ToneDeltaPair`, which keeps two related roles a set number of tones apart (for example, a container and its role, 10 tones apart)

The role definitions are versioned as whole specs (`color_spec_2021`, `color_spec_2025`, `color_spec_2026`), so a scheme can be generated under an earlier spec.

**What works.**
- Tone as lightness is the same idea as our ladder, and it confirms CIE L\* is the right axis for predictable contrast (ADR 0001).
- Each role says what it sits on and what contrast it needs, so contrast is part of the definition rather than checked afterwards.
- Contrast levels give one control for a stricter or looser system, which is close to our AA or AAA target (D-030).
- Versioning the whole spec lets old schemes regenerate exactly.

**What to avoid.**
- The roles are written as code (functions of the scheme), not data. You can't read or change the method without reading the code, which is the opposite of our rules schema (D-010).
- The method is tied to Material's role names. Ours keeps names as configuration (D-025).

**For us:** CLR-7 should give each semantic token the same parts as an MCU role (source colour, step in light and dark, what it sits on, contrast target), but as data. The AA and AAA targets can work like contrast levels. Whole rules versions, kept loadable, are how old share links and saved projects regenerate exactly (D-029, CLR-75).

## Leonardo

**Approach.** You describe each colour with `colorKeys` (one or more key colours), a `colorspace` to interpolate in, and `ratios`: the contrast ratios you want against a background. Leonardo finds the colours that meet those ratios. A `Theme` holds the colours, a `backgroundColor`, a `lightness` for the background, a `contrast` multiplier for every ratio, and a `saturation` setting. Ratios can be an array (named `blue100`, `blue200` and so on) or an object with your own names.

**What works.**
- Starting from contrast means every colour meets its target by construction.
- One contrast multiplier strengthens or relaxes the whole theme.
- Named ratios let people use their own names.

**What to avoid.**
- Steps come from contrast against one background, so the same step can sit at different lightness in different colours, and step names don't carry a consistent meaning across colours. Our shared ladder keeps steps consistent across every colour, which is what makes swapping colours safe (job 2).
- Results land slightly above the requested ratio because sRGB is discrete. Our checks should measure the final hex values, as CLR-17 already requires.

**For us:** a theme-wide contrast control is worth considering beside the AA or AAA target, but after the beta. Named ratios support keeping names as configuration.

## Huetone

**Approach.** A palette is a grid: a list of `hues` (each with a name and its colours) by a list of `tones`. It works in either OKLCH or CIE LCh, checks contrast with APCA, and exports CSS and a simple token file. A palette is shared by compressing its JSON with LZ-string into a URL query parameter. Older saved palettes are converted by hand-written functions such as `parseOldLchPalette`.

**What works.**
- The hue-by-tone grid is easy to understand and matches our ladder view.
- Sharing the whole palette by link, with no server, works.

**What to avoid.**
- The link uses a query parameter, which servers can log. Ours uses the URL fragment (CLR-75).
- Formats are migrated one by one, without a version marker. Our records and links carry a version from the start (D-029).
- Development stopped in November 2023.

**For us:** confirms the grid view for stage 2, and the version marker in CLR-75's share links.

## Radix custom palettes

**Approach.** Radix Colors has 12 steps, and every step has a stated purpose: steps 1 and 2 for backgrounds, 3 to 5 for component backgrounds, 6 to 8 for borders, 9 and 10 for solid colours, and 11 and 12 for text. Light and dark are separate scales, not mirrors of each other. The custom generator takes an accent, a grey and a background, finds the nearest hand-tuned Radix scales, and blends them towards the source colour. It uses Color.js for colour maths.

**What works.**
- Giving each step a purpose makes the semantic mapping easy to teach and to apply.
- Separate light and dark scales recognise that dark mode isn't a simple inversion.

**What to avoid.**
- Custom scales are blended from hand-tuned ones, so there's no method a person can learn or apply elsewhere. Ours is a method that explains itself (D-001).

**For us:** each ladder step in the rules schema could carry a stated purpose, such as backgrounds, borders, solids or text. The guided flow can then explain the light and dark mapping in those terms (CLR-27). Our light and dark mapping already lives in a table rather than in arithmetic, which matches Radix's lesson.

## Color.js

**Approach.** A broad colour science library, maintained by editors of the CSS colour specifications. It covers colour spaces, conversions, colour difference (including ΔE 2000 and ΔE OK), contrast and gamut mapping. Its gamut mapping follows the CSS Color 4 approach: reduce chroma in OKLCH, keep lightness and hue, and stop when the result is within a just noticeable difference.

**What works.** It's the closest thing to a reference implementation of the CSS colour specs.

**For us:** CLR-12 can test our own conversions, ΔE and gamut mapping against Color.js's results in development only, alongside published reference values. Our research scripts already use it this way (`docs/research/colour-model/`). Using it at runtime would need an assessment (D-014).

## Style Dictionary

**Approach.** Tokens go in once and come out in many formats, through transforms (change a value, such as a colour format) and formats (write a file, such as CSS variables). Version 4 added first-class support for the W3C design tokens (DTCG) format. Version 5 is current, and full support for the stable DTCG 2025.10 format is still in progress.

**What works.** One source with many adapters is the shape we've already chosen: design tokens JSON as the canonical export, and everything else as an adapter (CLR-32, CLR-33).

**For us:** our adapters follow the same pattern. Adopting Style Dictionary itself would need an assessment (D-014). It's built for Node, and its support for the current DTCG format is incomplete.

## Atmos

**Approach.** A commercial palette tool with a free tier. From its public pages: shades in LCH or OKLCH, contrast checks with APCA and WCAG 2, easing curves to shape scales, sRGB or Display P3 gamut, and a Figma plugin. It isn't open source, so only its public features were reviewed.

**For us:** confirms the features people expect from a modern palette tool, most of which are already planned. P3 is CLR-74.

## Finding that affects our plan: the stable design tokens format

The W3C Design Tokens Community Group published its [first stable format, 2025.10](https://www.w3.org/community/design-tokens/2025/10/28/design-tokens-specification-reaches-first-stable-version/), on 28 October 2025. In the stable [Color Module](https://www.designtokens.org/tr/drafts/color/), a colour token's `$value` is an object, not a hex string:

```json
{
  "$type": "color",
  "$value": { "colorSpace": "oklch", "components": [0.45, 0.12, 255], "hex": "#1B548F" }
}
```

`colorSpace` can be `srgb`, `oklch` and others, and `hex` is an optional fallback. Tools are still catching up: Style Dictionary's support is incomplete, and Figma token plugins vary. CLR-32 (the design tokens export) needs to decide which version to write, and test it against the Figma plugin we name in its acceptance criteria.

## What this means for our work

| Ticket | What to take from this |
|---|---|
| CLR-7: rules schema | Each semantic token defined as data, with its source, step in light and dark, what it sits on and its contrast target (MCU). A stated purpose for each ladder step (Radix). Whole rules versions kept loadable (MCU). |
| CLR-12: conversions and gamut mapping | Gamut mapping by chroma reduction in OKLCH, keeping lightness and hue (CSS Color 4, Color.js). Tests checked against Color.js in development. |
| CLR-27: light and dark mapping | Separate light and dark choices in a table, not mirrored arithmetic (Radix), with step purposes to explain them. |
| CLR-32: design tokens export | Decide between the stable 2025.10 colour object and the older hex string, and test against the named Figma plugin. |
| CLR-75: share links | Links in the URL fragment, with a version marker (Huetone's link works, but uses a query parameter and has no version). |
| CLR-81: AA or AAA target | Works like MCU's contrast levels. A theme-wide contrast control (Leonardo) is a post-beta idea. |

## Credits

Ideas taken from these projects are credited in the decision log entries and ADRs that use them.
