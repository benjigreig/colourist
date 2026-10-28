# How design systems name their feedback colours

> Researched 28 October 2026 for US-05. Plane: CLR-3. Decisions: D-025, D-027.

## Question

Should colouri.st fix the names of its feedback colours (error, warning, success, info), offer presets, or let people use their own? People may already be building on a framework that has its own naming.

## What eleven systems call their feedback colours

| System | Error | Warning | Success | Info | Extra roles |
|---|---|---|---|---|---|
| [Atlassian](https://atlassian.design/foundations/color) | danger | warning | success | information | discovery |
| [GitHub Primer](https://primer.style/foundations/color) | danger, severe | attention | success | accent | done, sponsors, upsell, open, closed, draft |
| [Adobe Spectrum](https://opensource.adobe.com/spectrum-design-data/components/status-light) | negative | notice | positive | informative | neutral |
| [IBM Carbon](https://carbondesignsystem.com/elements/color/tokens/) | support-error | support-warning | support-success | support-info | caution-major, caution-minor, caution-undefined |
| [Shopify Polaris](https://polaris-react.shopify.com/previous-releases/version-11-tokens) | critical | warning, caution | success | info | — |
| [Bootstrap](https://getbootstrap.com/docs/5.3/customize/color/) | danger | warning | success | info | — |
| [daisyUI](https://daisyui.com/docs/colors/) | error | warning | success | info | — |
| [GOV.UK](https://design-system.service.gov.uk/styles/colour/) | error | — | success | — | focus, hover |
| [Material 3](https://m3.material.io/styles/color/roles) | error | — | — | — | success and warning left to you |
| [shadcn/ui](https://ui.shadcn.com/docs/theming) | destructive | — | — | — | others added by you |
| [idealo](https://medium.com/idealo-tech-blog/9-decisions-made-when-developing-a-unified-dark-mode-4a6fbfb96b28) | negative | — | positive | — | — |

## Token naming patterns

Systems also differ in the pattern that builds each token's full name:

| Pattern | Example | Used by |
|---|---|---|
| Property first | `color.background.danger.hovered` | Atlassian |
| Property first, short | `bgColor-danger-emphasis` | GitHub Primer |
| Role first | `feedback.error.background` | Many custom systems |
| Prefixed role | `support-error` | IBM Carbon |
| Flat role pairs | `destructive`, `destructive-foreground` | shadcn/ui |

On top of the pattern, systems choose a case style (`camelCase`, `kebab-case`) and a separator (`.`, `-`, `/`).

## Findings

- **The roles are stable, but the names aren't.** Almost every system has a role for something going wrong, a caution, a success and information. The error role alone is called error, danger, critical, negative, destructive and support-error.
- **The extra roles vary the most.** A fixed set would leave many teams with roles they don't use and without roles they need.
- **The token standard leaves naming open.** The [W3C design tokens format](https://www.designtokens.org/tr/drafts/format/) prescribes no names, so configurable names are fully compatible with it.
- **Popular starting points ship with very little.** shadcn/ui ships only "destructive" and Material 3 only "error", so people building on them have to add and name their own roles.

## What we decided

- A colour is a name, a group and a starting value. Names are configuration, with presets for common language. The default preset is error, warning, success and info (D-025).
- In the beta, colour names are fully configurable, and the token pattern is colouri.st's own with a choice of case and separator. Full naming templates, and importing a convention from an existing tokens file, are high-priority post-beta work (D-027, CLR-72).

## Still open

The contents of each framework preset, and whether pending and assist ship as optional colours, are settled in CLR-3.
