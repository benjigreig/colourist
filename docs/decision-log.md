# Decision log

Every significant product, architecture and process decision for colouri.st, newest batch first within each group. Each entry records the decision, the context, the alternatives considered, why it was made and what it means for the rest of the work, with a link to its Plane ticket (project `CLR`). Bigger decisions also have a full write-up in [`adr/`](adr/).

To add a decision: copy an entry, give it the next number, and link the ticket. Never rewrite an accepted entry. If a decision changes, add a new entry that supersedes it and set the old one's status to "Superseded by D-0xx".

| Group | Entries |
|---|---|
| [Product](#product) | D-001 to D-007 |
| [Architecture and platform](#architecture-and-platform) | D-008 to D-018 |
| [Reach and audience](#reach-and-audience) | D-019 to D-023 |

---

## Product

### D-001 · Positioning
**Date:** 28 Oct 2026 · **Decided by:** Benji Greig · **Status:** Accepted · **Plane:** CLR-2

**Decision:** colouri.st is a free, open-source guided tool. It takes anyone working with a brand's colours from those colours to a robust, accessible colour system, explains the colour theory at each step, and hands over tokens that are easy to use.

**Context:** Plenty of tools already generate shades. Most work from one colour with one fixed method. The ones that handle a full brand palette well are commercial or built for experts, and almost none explain their choices. See [problem-statement.md](problem-statement.md).

**Alternatives considered:** a general-purpose palette generator competing on features; a commercial tool.

**Why:** The gap is a tool that is open, starts from a whole brand, and teaches the reasoning. Explaining the method matters as much as producing the result, because a designer who understands why a palette works can judge it, adjust it and defend it.

**Consequences:** The teaching content is part of the product, not documentation added afterwards, so it's planned and reviewed like any feature. The interface has to stay simple enough to follow without colour science knowledge.

### D-002 · Accept several brand colours from day one
**Date:** 28 Oct 2026 · **Decided by:** Benji Greig · **Status:** Accepted · **Plane:** CLR-14

**Decision:** The beta accepts a full set of brand colours, not just one.

**Context:** Claude proposed a single-colour beta to reduce scope for an end-of-November launch.

**Alternatives considered:** a single-colour beta, with several colours added later.

**Why:** Single-colour generators already exist, so a single-colour beta would launch without its differentiator. The value is making shades from a whole brand palette that work together: consistent lightness across colours, colours that stay distinguishable, and a shared contrast rule.

**Consequences:** The engine has to handle grouping and checks between colours from the start. The method Benji proved in earlier work was built for this, which reduces the risk.

### D-003 · The beta is the whole workflow, trimmed in depth
**Date:** 28 Oct 2026 · **Decided by:** Benji Greig · **Status:** Accepted · **Plane:** CLR-42

**Decision:** The beta covers all eight stages, from brand colours to export. Scope is reduced by moving deeper controls to later, not by leaving stages out.

**Alternatives considered:** shipping some stages first; a full-depth build with a later launch.

**Why:** A partial flow would leave people without a usable outcome. The plan should be right before it's fast.

**Consequences:** Anything that adds depth to a stage moves to the post-beta backlog, such as custom ladders, hand-tuning, extra token layers and colour-vision simulation. Nothing is dropped; it's recorded with a ticket.

### D-004 · Lean exports first
**Date:** 28 Oct 2026 · **Decided by:** Benji Greig · **Status:** Accepted · **Plane:** CLR-32

**Decision:** The beta exports W3C design tokens JSON, CSS custom properties, and an HTML reference sheet that prints to PDF. Figma uses the tokens through a tokens plugin. Tailwind follows soon after the beta, then native Figma variables.

**Context:** The full set of outputs people need is Figma variables, CSS, Tailwind, other token formats, and a document of the colours and their names.

**Alternatives considered:** all formats at launch, which would take roughly two to three times the export and testing effort.

**Why:** Every format becomes a small converter from one canonical token file, so adding formats later is cheap. Individual designers need design tokens and a reference sheet most, first.

**Consequences:** The design tokens JSON is the single source for every export. Each new format is a converter from it, never a separate generator. Follow-ups: CLR-43 (Tailwind), CLR-44 (Figma variables).

### D-005 · Several ladder sizes, with a recommendation
**Date:** 28 Oct 2026 · **Decided by:** Benji Greig · **Status:** Accepted · **Plane:** CLR-13

**Decision:** The tool offers several step counts, at least 11, 13 and 15, and recommends one with its reasoning.

**Context:** Earlier work used 13 steps. Read too literally, that would become a fixed rule.

**Alternatives considered:** a fixed 13-step ladder.

**Why:** Different products need different ranges, for example light mode only versus light and dark. A recommendation with its reasoning teaches the trade-off; a fixed number hides it.

**Consequences:** Ladder presets and the rules for recommending one live in the rules schema (D-010). The step-distance contrast rule is reported for whichever preset is chosen.

### D-006 · APCA and WCAG 2 both in the beta
**Date:** 28 Oct 2026 · **Decided by:** Benji Greig · **Status:** Accepted · **Plane:** CLR-17

**Decision:** Every contrast check reports both WCAG 2 and APCA, and points out where they disagree.

**Alternatives considered:** WCAG 2 only in the beta, with APCA later.

**Why:** APCA is central to the method. Earlier work showed that WCAG 2 can pick the wrong label colour on saturated mid-tones, for example a black label on a vivid magenta, where APCA matched what the eye said. WCAG 2 is kept because it's the standard most people are held to.

**Consequences:** APCA's licence shapes how it's included (D-013). The interface has to explain the two models simply.

### D-007 · The default feedback colours are set by research
**Date:** 28 Oct 2026 · **Decided by:** Benji Greig · **Status:** Accepted · **Plane:** CLR-3

**Decision:** The default set of feedback colours (such as error, warning, success and info) is chosen from a survey of common patterns in established design systems, not inherited from earlier work. Pending and assist stay in the beta scope and are judged on their merits.

**Alternatives considered:** reusing an earlier set of six; dropping pending and assist to save time.

**Why:** colouri.st is for any brand, so its defaults should reflect common practice. Removing pending and assist wouldn't have saved meaningful time.

**Consequences:** The research spike (CLR-3) has to finish before the feedback colour engine work (CLR-16) and the semantic mapping (CLR-27) start.

---

## Architecture and platform

### D-008 · Reference other projects, don't reuse their code
**Date:** 28 Oct 2026 · **Decided by:** Benji Greig · **Status:** Accepted, with one exception (D-013) · **Plane:** CLR-8

**Decision:** We study how established projects solved colour problems (Material Color Utilities, Leonardo, Huetone, Atmos, Radix, Color.js, Style Dictionary) and write our own code, crediting the ideas here.

**Alternatives considered:** depending on existing colour libraries for the engine's maths.

**Why:** Owning the code keeps the engine small, explainable and under one clear licence, and it means we understand every number the tool produces. Their published thinking is still valuable and saves us rediscovering it.

**Consequences:** More code to write and test in the engine. Ideas taken from another project are credited in the relevant entry or ADR. APCA is the exception, because its licence forbids modified implementations (D-013).

### D-009 · A static app that runs entirely in the browser
**Date:** 28 Oct 2026 · **Decided by:** Benji Greig · **Status:** Accepted · **Plane:** CLR-21, CLR-35

**Decision:** colouri.st is a static site with no server and no accounts. Work is saved in the browser's local storage and shared as a link that holds the palette.

**Alternatives considered:** a hosted app with accounts and saved projects.

**Why:** It keeps the product simple, free to host and private: a person's brand colours never leave their browser. It also removes a whole class of operational and security work.

**Consequences:** No cross-device sync or team workspaces in the beta. Saved state and link formats must be versioned so the rules can change without breaking anyone's work.

### D-010 · Engine as its own package; rules as a versioned schema
**Date:** 28 Oct 2026 · **Decided by:** Benji Greig · **Status:** Accepted · **Plane:** CLR-7, CLR-20

**Decision:** The code is split into separate layers:
- **`packages/engine`:** pure TypeScript colour maths, with no interface code
- **`packages/rules`:** the method's rules as versioned, declarative data the engine reads, including ladder presets, curves, feedback families, contrast thresholds, token naming and the light/dark mapping
- **`apps/web`:** the guided app. Its state and logic are plain TypeScript, and the front-end framework appears only in the view layer.

**Alternatives considered:** building the method directly into the app's code.

**Why:** Everything becomes configurable: our recommendations are simply the default configuration. Each rule can carry its rationale, so the teaching content and the logic share one source. The engine can be reused by other tools, including the natural language interface (D-019), and the framework can be replaced without touching the core.

**Consequences:** More upfront design of the schema and the engine's API. Tests sit at the boundaries between layers.

### D-011 · Guiding principle: strong opinions, loosely held
**Date:** 28 Oct 2026 · **Decided by:** Benji Greig · **Status:** Accepted · **Plane:** CLR-2

**Decision:** The architecture makes clear recommendations, but every layer can be changed, swapped or iterated without rebuilding the others.

**Why:** We want to iterate fast, learn and test without having to rebuild everything when we change our minds.

**Consequences:** Loose coupling wherever it makes sense; tests at the seams so changes are safe. This principle is the tie-breaker for future architecture decisions.

### D-012 · Colour model: L* lightness with OKLCH hue and vividness
**Date:** 28 Oct 2026 · **Decided by:** Benji Greig · **Status:** Accepted · **Plane:** CLR-4 · **ADR:** [adr/0001-colour-model.md](adr/0001-colour-model.md)

**Decision:** Each step's lightness comes from CIE L* with a D65 white. Each colour's hue and vividness (chroma) are held in OKLCH.

**Context:** colouri.st promises that the distance between two steps predicts their contrast. We tested three invented brands (14 colours) on the same ladder in five model variants.

**Alternatives considered:** CIE LCh with the common D50 white; CIE LCh with D65; OKLCH alone; HCT (Google's Material model).

**Why:** It's the only option that keeps both promises: contrast by step distance holds for every brand (6, 7 and 8 steps give 3:1, 4.5:1 and 7:1), and hue stays steady, so saturated blues don't drift towards purple. It's also CSS-native and easy to explain. OKLCH alone made contrast unpredictable: at 7 steps apart it ranged from 4.57:1 to 11.36:1, and one brand needed 9 steps to reach 7:1. CIE L* turned vivid blues lavender. HCT was close, but heavier to build and teach, and its blues leaned periwinkle.

**Consequences:** The lightness model and the hue/chroma model are kept swappable in the engine, so HCT could be added later without a rebuild. CLR-12 (conversions) was unblocked by this decision.

### D-013 · APCA through the unmodified official package, as a separate add-on
**Date:** 28 Oct 2026 · **Decided by:** Benji Greig · **Status:** Accepted · **Plane:** CLR-6, CLR-58 · **ADR:** [adr/0002-apca.md](adr/0002-apca.md)

**Decision:** The engine supports interchangeable contrast models and ships WCAG 2 itself. APCA comes through a small add-on that depends on the unmodified `apca-w3` package, kept under its own licence with a clear notice. We'll ask Myndex Research to confirm in writing. The APCA logo isn't used, and the name "APCA" labels only the correct, current implementation.

**Context:** APCA's licence isn't open source. It covers web content only, can't be relicensed under Apache 2.0, and treats modified implementations as a breach.

**Alternatives considered:** writing our own APCA (forbidden by the licence); dropping APCA from the beta (rejected by D-006).

**Why:** It keeps APCA in the beta while respecting its licence, and keeps the Apache 2.0 engine clean. If Myndex objects, the add-on can be removed without touching the engine.

**Consequences:** An exception to D-008. The add-on must track the latest `apca-w3` version.

### D-014 · Treat any substantial dependency as an investment
**Date:** 28 Oct 2026 · **Decided by:** Benji Greig · **Status:** Accepted · **Plane:** CLR-5

**Decision:** Any framework or library beyond simple single-purpose npm packages is assessed before adoption and recorded in an ADR. The assessment weighs:
- long-term health, using OpenSSF Scorecard and CHAOSS measures (time to first response, issue close rate, release cadence, active contributors, bus factor)
- the contributor pool
- how replaceable it is
- accessibility support
- fit with static output
- bundle size
- developer and AI-tooling experience
- licence

**Alternatives considered:** choosing by familiarity or popularity.

**Why:** We'll be investing coding time in these choices for years, so they deserve the weight of an investment decision.

**Consequences:** The front-end framework is chosen this way in cycle 0 (CLR-5). Svelte is a candidate if it saves effort, provided it stays loosely coupled.

### D-015 · Hosting on GitHub Pages
**Date:** 28 Oct 2026 · **Decided by:** Benji Greig · **Status:** Accepted · **Plane:** CLR-41

**Decision:** The site is hosted on GitHub Pages at colouri.st, with DNS at Dynadot.

**Alternatives considered:** Cloudflare Pages, Netlify.

**Why:** It's free for public repositories, keeps code, issues, releases and site in one place, and fits an open-source-first project. GitHub Pages' limits on commercial use don't apply.

**Consequences:** Because the app is static, moving hosts later would take hours, not a rebuild.

### D-016 · Apache 2.0 licence
**Date:** 28 Oct 2026 · **Decided by:** Benji Greig · **Status:** Accepted · **Plane:** CLR-1

**Decision:** colouri.st is licensed under Apache 2.0.

**Alternatives considered:** MIT.

**Why:** Just as permissive as MIT, but with an explicit patent grant and a requirement to note changes, which suits an engine that others may build products on.

**Consequences:** `LICENSE` and `NOTICE` at the repo root (commit b773a8a). APCA stays under its own licence (D-013).

### D-017 · Personal repo now, organisation later
**Date:** 28 Oct 2026 · **Decided by:** Benji Greig · **Status:** Accepted · **Plane:** CLR-11, CLR-56, CLR-57

**Decision:** The repo is [`benjigreig/colourist`](https://github.com/benjigreig/colourist). It moves to a GitHub organisation later.

**Alternatives considered:** an organisation from day one; naming the repo `colouri.st`.

**Why:** Quick to set up for the beta, and GitHub redirects old URLs when a repo is transferred. `colourist` avoids the dot, which is awkward in repo URLs and tooling.

**Consequences:** The engine's npm name must be settled before its first publish (CLR-57). As of 28 Oct 2026, `colourist`, `colourist-engine` and `@colourist/engine` were unused on npm, and `colorist` (US spelling) was taken.

### D-018 · Docs live in the repo
**Date:** 28 Oct 2026 · **Decided by:** Benji Greig · **Status:** Accepted · **Plane:** CLR-2

**Decision:** All project documents live in the repo's `docs/` folder. Plane holds tickets that link to them.

**Alternatives considered:** mirroring docs as Plane pages; Claude Docs.

**Why:** One master copy, versioned with the code, readable by people and AI tools alike. Plane's API couldn't reliably write pages.

**Consequences:** Every ticket that produces a document links to its file in the repo, and every decision entry links back to its ticket.

---

## Reach and audience

### D-019 · A natural language interface alongside the visual one
**Date:** 28 Oct 2026 · **Decided by:** Benji Greig · **Status:** Accepted · **Plane:** CLR-60, CLR-61

**Decision:** The beta ships LLM-readable docs for the method (`llms.txt` and an agent skill file). An MCP server wrapping the engine follows soon after the beta.

**Context:** Capable people already store their colours as tokens for AI tools. What's missing is a reproducible, theory-grounded method those tools can apply.

**Alternatives considered:** the visual tool only; the MCP server in the beta.

**Why:** The method is the product, and offering it to AI tools is a distinctive extension. Because the engine is a separate package (D-010), the MCP server is a thin layer over it.

**Consequences:** The engine's public API is designed from cycle 1 to be usable by AI tools: clearly named, typed and self-describing functions whose results carry their reasoning.

### D-020 · No analytics or telemetry
**Date:** 28 Oct 2026 · **Decided by:** Benji Greig · **Status:** Accepted · **Plane:** CLR-63

**Decision:** colouri.st has no analytics or tracking. Success is measured through usability sessions, early-access sign-ups, feedback, and the GitHub activity the repo owner already sees.

**Alternatives considered:** privacy-first, cookie-free analytics counting palettes and exports.

**Why:** It's a more organic and privacy-respecting approach that suits an open-source tool. Telemetry in open-source tools draws strong pushback, and "your brand colours never leave your browser" is something we can say plainly.

**Consequences:** Usage numbers will be approximate. Revisit with privacy-first analytics only if numbers are ever needed.

### D-021 · Coming-soon page once there's something real to show
**Date:** 28 Oct 2026 · **Decided by:** Benji Greig · **Status:** Accepted · **Plane:** CLR-62, CLR-41

**Decision:** The coming-soon page with early-access sign-ups goes live around 15 November, when a real ladder or palette can be shown. Alpha recruiting starts now through Benji's network.

**Alternatives considered:** a coming-soon page straight away.

**Why:** A page with nothing to show is weak, but a sign-up list needs time to grow. Two weeks of sign-ups before the closed beta balances the two.

**Consequences:** DNS setup moved to cycle 2. Early testing runs: alpha sessions (cycle 3), closed beta with 20 to 30 people (23 to 26 November), open beta (27 November).

### D-022 · Audience: anyone working with brand colours, designers first
**Date:** 28 Oct 2026 · **Decided by:** Benji Greig · **Status:** Accepted · **Plane:** CLR-2, CLR-65

**Decision:** colouri.st is for anyone working with a brand's colours, designer or not. Individual designers and small teams remain the primary audience.

**Alternatives considered:** designers only.

**Why:** Developers, founders and others end up making these choices with even less to go on. The natural language interface widens the audience anyway.

**Consequences:** Rewriting the explainers so they work with no design vocabulary is a fast follow after the beta (CLR-65), not a beta requirement.

### D-023 · Beta scope additions from the jobs-to-be-done research
**Date:** 28 Oct 2026 · **Decided by:** Benji Greig · **Status:** Accepted · **Plane:** CLR-66, CLR-67, CLR-68, CLR-55, CLR-69

**Decision:** Three jobs the research found are added to the beta:
- **Interactive state tokens** (default, hover, pressed, focus, disabled) as part of the core semantic set (CLR-66)
- **A colour vision deficiency check** that flags feedback colours that become hard to tell apart (CLR-67)
- **A brand fidelity report** in the HTML reference sheet, showing how close each scale stays to its brand colour (CLR-68)

Data visualisation colours (CLR-55) and several brands or themes from one method (CLR-69) are recorded as known jobs and stay post-beta.

**Context:** Benji asked for the jobs to be done to be checked against published accounts from design teams before they were approved. See [jobs-to-be-done.md](jobs-to-be-done.md).

**Alternatives considered:** keeping the beta scope unchanged and adding these after launch.

**Why:** Buttons need at least five states, and brand palettes almost never supply them, so leaving states out would send people back to inventing colours screen by screen. Colour vision deficiency affects about 1 in 12 men, and a distinctness check is cheap because the engine already compares colours. The brand fidelity data is already calculated; surfacing it helps designers bring brand teams with them.

**Consequences:** About two to three extra days across cycles 2 and 3. Full colour-blindness simulation stays post-beta (CLR-51).

