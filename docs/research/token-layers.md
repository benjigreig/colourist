# Design token layers: what each is, and what it isn't

> Researched 29 October 2026 for CLR-13 and CLR-27, at Benji's request, before designing how colouri.st represents relationships between colours. Decided the same day (D-051): colouri.st uses the common three tiers, and treats aliases and themes as what they are, not as tiers. Related: [`ladder-distribution.md`](ladder-distribution.md), [`contrast-rule.md`](contrast-rule.md), [ADR 0005](../adr/0005-rules-schema.md).

## Why this came up

Working on how interaction states are made (CLR-13, question 1), Benji reframed the problem. colouri.st represents **relationships between colours**. People need to make choices that fundamentally work, in any number of themes (by brand, product, mode or anything else), built from combinations of primitives. To talk about that clearly, we needed a precise shared definition of the kinds of tokens a design system has.

## Where the terms come from

- **2014:** Jina Anne named "design tokens" at Salesforce, for the Lightning Design System. They were platform-agnostic named values that tooling (Theo) transforms for each platform (Lewis, 2026).
- **2016–17:** Nathan Curtis framed tokens as **decisions, not options**: variables "answer 'What options do I have?' yet leave 'What choice do I make?' unclear." Danny Banks open-sourced Style Dictionary.
- **2018:** Brad Frost described three tiers for themeable systems: brand definitions, application (semantic) variables, and component variables.
- **2019:** Kaelig Deloumeau-Prigent founded the W3C Design Tokens Community Group (DTCG).
- **2023:** Figma shipped variables, with collections and modes.
- **October 2025:** The DTCG published its first stable format, with a separate resolver module for themes.

## The three tiers

### 1. Primitive tokens

**Also called:** global, core, reference (Material), base, foundation, brand definitions (Frost), options (Curtis).

**What they are:** the available values, such as `blue-800`, `gray-100` or a spacing step.
- Spectrum: "Primitive tokens define the available values in the design language… [they] communicate little or no information about how those values should be used."
- Material: reference tokens "hold concrete values, such as a hex color, pixel size, or font family name."

**What they aren't:**
- Decisions. A palette says what's possible, not what to use.
- Meant for direct use in interfaces. Intuit found that teams who used primitives directly lost dark-mode support.

**In colouri.st:** the ladders, one family per colour. This is what the engine generates.

### 2. Semantic tokens

**Also called:** alias tokens (Spectrum, though alias is really the mechanism), system tokens (Material), functional tokens (Primer), application variables (Frost), decisions (Curtis).

**What they are:** decisions named by purpose, whose values change with the theme while the name stays the same, such as `text`, `background.subtle` or `border.focus`.
- Atlassian: "Choose tokens based on meaning where applicable, not specific values." Choosing a token for its look "can break other themes".
- Material: every role has an "on" partner "for content color with accessible contrast". Tones "are chosen to ensure contrast between those pairs" (O'Leary, 2022).
- Spectrum: semantic tokens are "the main way consumers use Spectrum tokens".

**What they aren't:**
- Named by appearance. `blue-dark` is a primitive's name, not a purpose.
- Specific to one component.
- Raw values. They reference primitives.
- A home for every one-off. Curtis: a shared token "isn't the place to start"; promote a decision once it recurs, roughly three times.

**In colouri.st:** where the relationships live. A semantic token is defined by its relationships to other semantic tokens (text on background, a state from its resting state, a boundary on a surface, siblings that must stay distinct). Each theme resolves it to a primitive that satisfies them.

### 3. Component tokens

**Also called:** component-specific tokens (Spectrum), component tokens (Material).

**What they are:** decisions for one component, such as `tooltip-maximum-width` or `button-primary-background`. They point at semantic tokens.
- Spectrum: they "play a much smaller role than reusable semantic tokens".
- Frost: once set, their mappings rarely change.

**What they aren't:**
- Where theming happens. Themes change semantic values, and component tokens follow.
- The default home for new decisions. Curtis treats component-specific variables as "candidates to graduate", not tokens by default.

**In colouri.st:** mostly out of scope. Teams map their own components to colouri.st's semantic tokens. A component-agnostic test pattern shows how combinations behave without naming components.

## Often drawn as layers, but not tiers

### Aliases: a mechanism

An alias is "a token value that is a reference to another token" (DTCG glossary). It's how the tiers connect, and a chain can pass through several names: `blue-900` → `accent-color-900` → `accent-content-color-default` (Spectrum). Calling semantic tokens "aliases" names them by mechanism, not purpose.

### Themes, modes and other contexts: dimensions

A theme is "a collection of token values designed to achieve a certain look or style" (Atlassian).

**How each source models it:**
- **Curtis:** mode is a modifier that distinguishes "values across two or more surface/background settings", and brand colour can be a mode in expressive systems.
- **The DTCG resolver module:** **sets** of tokens, and **modifiers** (dimensions), each with **contexts** (such as `light` and `dark`). Every combination of contexts is a separate resolution: three modifiers with 4, 3 and 2 contexts make 24. The spec warns of "combinatorial explosion" and recommends modifiers that don't overlap.
- **Tokens Studio's rationale:** real systems vary by brand, theme, mode, visual variant and surface at once. Some have 40 or more sets and around 144 combinations, and some combinations are invalid (a theme available only in light mode).
- **Figma:** collections of variables with modes, where each mode stores one value per variable.

**Still unsettled:** how to model two independent dimensions such as brand × mode, which is an open DTCG question (issue #381, January 2026).

**In colouri.st:** themes are any number of dimensions the person defines (brand, product, mode, contrast or others), not just light and dark. Every semantic token's relationships must hold in every resolution.

## A critique worth keeping

Thomas Gossmann (Theemo) argues the tier pyramid hides things:
- "Tiers are relevant for token designers and irrelevant to token consumers."
- "Naming and tiers are independent," though literature often ties them together.
- The tiers leave no room for exceptions.

For colouri.st, this argues for explaining tiers where people build the system, and exposing purposeful names where they use it.

## What it means for colouri.st

The model these points lead to, with its academic basis, is in [`colour-relationships.md`](colour-relationships.md) (D-052).

- **Primitives are generated:** the ladders.
- **Semantic tokens are defined by relationships,** not by a fixed grade. Each theme resolves them to primitives.
- **A theme is one resolution:** one combination of the dimensions the person defines.
- **colouri.st's core job** is to show which primitives satisfy each semantic token's relationships in every resolution, suggest defaults, and let people choose. Invalid combinations are never offered as valid.
- **Exports carry three things:** primitives, semantic tokens and a resolver describing the dimensions, so the result travels in the DTCG format.
- **ADR 0005 needs amending.** It says a semantic token names a grade. In this model, the grade belongs to each resolution, not to the token.
- **States are semantic tokens with a relationship to their resting token.** Whether they're exported as solid values or overlays is still open.
- **A component-agnostic test pattern** would show combinations as text, fills, boundaries and fills without text, small and large, alone and side by side, in every state and every theme. The nearest prior art is the contrast grid (EightShapes), which shows only foreground and background pairs.

## Sources

- Lewis, D. (2026, 21 March). [The incomplete history of design tokens](https://blog-dqv.pages.dev/posts/the-incomplete-history-of-design-tokens/).
- Curtis, N. [Tokens in design systems](https://medium.com/eightshapes-llc/25dd82d58421). EightShapes. Date to complete (2016 or 2017).
- Curtis, N. [Naming tokens in design systems](https://nathanacurtis.substack.com/p/naming-tokens-in-design-systems-9e86c7444676). Date to complete.
- Curtis, N. [Reimagining a token taxonomy](https://medium.com/eightshapes-llc/reimagining-a-token-taxonomy-462d35b2b033). EightShapes. Date to complete.
- Frost, B. (2018, 2 April). [Creating themeable design systems](https://bradfrost.com/blog/post/creating-themeable-design-systems/).
- [Adobe Spectrum: Design tokens](https://spectrum.adobe.com/page/design-tokens).
- [Material Web: Theming](https://github.com/material-components/material-web/blob/main/docs/theming/README.md) and [Color](https://github.com/material-components/material-web/blob/main/docs/theming/color.md).
- O'Leary, J. (2022, 17 February). [The science of color & design](https://m3.material.io/blog/science-of-color-design). Material Design. From a copy Benji supplied.
- [Atlassian: Design tokens explained](https://atlassian.design/foundations/tokens/design-tokens/) and [Elevation](https://atlassian.design/foundations/elevation).
- Design Tokens Community Group. [Glossary](https://www.designtokens.org/glossary/); [Design Tokens Resolver Module 2025.10](https://www.designtokens.org/tr/drafts/resolver/); [issue #381](https://lists.w3.org/Archives/Public/public-design-tokens-log/2026Jan/0027.html).
- Tokens Studio. [Resolver spec rationale](https://resolver-spec.netlify.app/info/rationale).
- Figma. [Overview of variables, collections and modes](https://help.figma.com/hc/en-us/articles/14506821864087-Overview-of-variables-collections-and-modes).
- Intuit. [Creating a flexible design token taxonomy for Intuit's design system](https://cur.at/E7twDJW?m=web). Author and date to complete.
- Gossmann, T. [The three class token society](https://83fd6641.theemo.pages.dev/design-tokens/three-class-token-society). Theemo.
- Ding, X., & Huang, Z. (2026). Design and implementation of the Meituan design system tool based on design token. *Usability and User Experience*, AHFE Open Access. https://doi.org/10.54941/ahfe1008061
- [Contrast Grid](https://github.com/mherchel/contrast-grid), a maintained fork of EightShapes' tool.
