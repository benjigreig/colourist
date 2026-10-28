# CSS colour formats for exports

> Researched 28 October 2026 for US-08. Plane: CLR-33, CLR-74. Decision: D-032.

## Question

Which colour formats should the CSS export offer, and which should it recommend? Benji asked for the most compatible format to be recommended, with sensible recommendations across the formats that are supported.

## Formats compared

Browser support checked on 28 October 2026.

| Format | When it's the right choice | Support | In the beta? |
|---|---|---|---|
| **Hex** (`#1B548F`) | Works everywhere: every browser, design tool, email client and document | Universal | Yes, the recommended default |
| **`rgb()`** | Familiar to developers, and easy to add transparency to | Universal | Yes |
| **`hsl()`** | Some teams prefer it for small manual tweaks | Universal | Yes |
| **`oklch()`** | Modern projects. It matches how colouri.st builds colours, so values are easy to understand and adjust | Widely available across browsers since May 2023 ([MDN](https://developer.mozilla.org/docs/Web/CSS/color_value/oklch)) | Yes, with optional hex fallbacks |
| **`lab()` / `lch()`** | Rarely needed. OKLCH does the same job better for interface work | Supported | No, to keep the choice simple |
| **`color(display-p3 …)`** | Wide-gamut screens, for more vivid colours | Widely available since November 2025 ([web features explorer](https://web-platform-dx.github.io/web-features-explorer/features/color-function)) | Not yet |

## Why not Display P3 yet

colouri.st generates every colour inside sRGB, the standard range. A Display P3 value would be the same colour written a different way, with no visible benefit. Generating more vivid colours for wide-gamut screens is real engine work, so it's a post-beta item (CLR-74). It would use `color(display-p3 …)` with an sRGB fallback.

## What we decided

The export is described as "CSS variables (custom properties)". Hex is recommended by default with a one-line reason. People can choose `rgb()`, `hsl()` or `oklch()` instead, each with a note on when it's the right choice, and `oklch()` can include hex fallbacks (D-032).
