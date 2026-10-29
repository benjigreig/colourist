# Decision log

Every significant product, architecture and process decision for colouri.st, newest batch first within each group. Each entry records the decision, the context, the alternatives considered, why it was made and what it means for the rest of the work, with a link to its Plane ticket (project `CLR`). Bigger decisions also have a full write-up in [`adr/`](adr/).

To add a decision: copy an entry, give it the next number, and link the ticket. Never rewrite an accepted entry. If a decision changes, add a new entry that supersedes it and set the old one's status to "Superseded by D-0xx".

| Group | Entries |
|---|---|
| [Product](#product) | D-001 to D-007 |
| [Architecture and platform](#architecture-and-platform) | D-008 to D-018 |
| [Reach and audience](#reach-and-audience) | D-019 to D-023 |
| [User stories and delivery](#user-stories-and-delivery) | D-024 to D-040 |

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

---

## User stories and delivery

### D-024 · Compare colour methods in the beta, lean version
**Date:** 28 Oct 2026 · **Decided by:** Benji Greig · **Status:** Accepted · **Plane:** CLR-70, CLR-71

**Decision:** In the beta, people can see what other colour methods would do with their own colours, while colouri.st stays on its recommendation. The beta shows CIE L\* (D65) and OKLCH alone beside the recommended method, view only. HCT, and switching to another method, are post-beta.

**Context:** Raised by Benji while reviewing US-03. ADR 0001 chose a hybrid method, and the reference page made for that decision showed how much the alternatives differ.

**Alternatives considered:** no comparison; view and switch between all four methods including HCT in the beta (about four to five days, and the contrast promise and explainers would have to hold for every method).

**Why:** Seeing what the alternatives would have given you is how someone learns to make the call themselves. It's the "strong opinions, loosely held" principle (D-011) shown in the product. The lean version reuses conversions the engine needs anyway, at about a day of work.

**Consequences:** Alternative generators use the swappable model interfaces from ADR 0001. US-03 gains the "Compare methods" scenario.

### D-025 · A colour is a name, a group and a starting value; names are configuration
**Date:** 28 Oct 2026 · **Decided by:** Benji Greig · **Status:** Accepted · **Plane:** CLR-16, CLR-26, CLR-3

**Decision:** The engine attaches no meaning to a colour's name or role. A colour is a name, a group and a starting value. Colour names are configuration: presets cover common language, and people can rename, add, remove or regroup anything. The default preset is error, warning, success and info.

**Context:** A survey of 11 design systems found the feedback roles are stable but their names vary widely. The error role alone is called error, danger, critical, negative, destructive and support-error. The W3C design tokens format prescribes no names. Claude first proposed fixed roles inside the engine with configurable names; Benji pointed out that was building meaning in where only structure is needed. The survey and its sources are recorded on CLR-3.

**Alternatives considered:** fixed names; fixed roles in the engine with configurable names.

**Why:** People may already be building on a framework with its own naming. Being rigid here would make colouri.st's output unusable for them. A colour's role only matters when it's mapped to semantic tokens, and that mapping is configuration too.

**Consequences:** Stage 5 becomes "the rest of your palette", with presets and free editing. Semantic tokens point at colours by name, so renaming or removing a colour can leave tokens unmapped (handled in US-06). D-007 still sets the default starting values for the default preset.

### D-026 · Distinctness is checked shade by shade across the whole palette, with suggestions
**Date:** 28 Oct 2026 · **Decided by:** Benji Greig · **Status:** Accepted · **Plane:** CLR-16, CLR-18, CLR-67

**Decision:** Every shade of every colour must stay distinguishable from the shades of every other colour, across and within groups, including under simulated colour vision deficiency. The check runs on the generated scales, not only the starting values. When a colour is too close, colouri.st can suggest a hue for clearer separation, which the person can accept, reject, or answer by removing the colour. Suggestions are never applied automatically.

**Context:** Two colours can look clearly different at their starting values and still converge in their lighter or darker shades. Benji's earlier generator found exactly that.

**Alternatives considered:** checking starting values only; checking feedback colours against the brand only; warning without suggesting a fix.

**Why:** Colours that can't be told apart in use aren't doing their job. A suggestion helps and teaches, but the decision stays with the person.

**Consequences:** The similar-hue check on input (CLR-18) becomes an early warning only. Thresholds come from the rules, with an allowance for the lightest and darkest steps, which can't carry much colour identity. The colour vision deficiency check covers the whole palette.

### D-027 · Lean naming in the beta; naming templates in the backlog
**Date:** 28 Oct 2026 · **Decided by:** Benji Greig · **Status:** Accepted · **Plane:** CLR-72

**Decision:** The beta makes colour names fully configurable, with colouri.st's own token pattern and a choice of case and separator. Full naming templates, which set the whole token pattern (for example Atlassian's `color.background.danger.hovered` or shadcn/ui's `destructive-foreground`), and importing a convention from an existing tokens file, are high-priority post-beta work.

**Context:** Design systems differ in their whole token pattern, not only their colour names.

**Alternatives considered:** naming templates in the beta (about three to four days, touching every export, risking the cycle 2 date).

**Why:** Colour names differ most and matter first, and the lean option covers them. Benji sees real value in templates, so they stay close behind.

**Consequences:** Templates will live in the rules schema, so new ones can be contributed as data.

### D-028 · Feature requests and voting in GitHub Discussions
**Date:** 28 Oct 2026 · **Decided by:** Benji Greig · **Status:** Accepted · **Plane:** CLR-73, CLR-63

**Decision:** Feature requests and voting live in a GitHub Discussions category called "Feature requests", with upvotes as votes and a public GitHub Project board as the roadmap. People without a GitHub account suggest features through the feedback form, and those suggestions are moved into Discussions by hand. Contributions such as presets and naming templates come in as pull requests.

**Context:** Benji wants people to be able to vote on and contribute to features.

**Alternatives considered:** a self-hosted voting tool such as Fider (needs a server, against D-009); a hosted service such as Canny or Featurebase (usually paid and usually tracks people, against D-020).

**Why:** Free, next to the code, and consistent with the no-server and no-tracking principles.

**Consequences:** The post-beta backlog is published as the starting list to vote on. The wording is "suggest a feature" and "feature requests", not "ideas".

### D-029 · The saved unit is a project, with several projects from day one
**Date:** 28 Oct 2026 · **Decided by:** Benji Greig · **Status:** Accepted · **Plane:** CLR-21

**Decision:** What colouri.st saves is a **project**: the palette plus every choice made in it. Storage supports several projects from the start: a small index of projects plus a separate record for each, every record versioned, and storage behind its own interface. Local storage, share links, project files and AI tools all use the same project format.

**Context:** Benji asked whether storage should support more than one project from the start.

**Alternatives considered:** one saved palette, with several added later.

**Why:** Adding multi-project support later would mean migrating everyone's saved work, which is where data gets lost. "Project" describes what's stored better than "palette", because it includes the choices as well as the colours.

**Consequences:** colouri.st warns before storage gets close to the browser's limit. Storage can move to IndexedDB later without changing anything else.

### D-030 · Choose AA or AAA as a project's target, in the beta
**Date:** 28 Oct 2026 · **Decided by:** Benji Greig · **Status:** Accepted · **Plane:** CLR-81, CLR-80

**Decision:** At the start of a project, people choose WCAG AA (the default) or AAA as their target. The ladder recommendation, semantic mapping, checks, known issues and exports all follow it. Where a colour can't reach AAA for a use, colouri.st says so plainly and never falls back to AA silently.

**Context:** Raised by Benji while reviewing the checklist. The thresholds are already rules, so this is mostly configuration, at about a day of work.

**Alternatives considered:** AA only in the beta, with AAA as a fast follow.

**Why:** It's a powerful feature to lead with, for a tool that puts accessibility first.

**Consequences:** An AAA contrast mode for colouri.st's own interface is agreed in principle, with no timing yet (CLR-80). It's described as a contrast mode rather than full AAA compliance, because W3C doesn't recommend requiring full AAA conformance for whole sites.

### D-031 · Truth in outputs: failures travel with the system
**Date:** 28 Oct 2026 · **Decided by:** Benji Greig · **Status:** Accepted · **Plane:** CLR-30, CLR-32, CLR-33, CLR-34

**Decision:** A failing check stays a failure, even when a suggested alternative isn't applied. Every failure that reaches an output is recorded beside the token it affects: as a comment in the CSS, and in `$description` plus a structured `$extensions` note in the design tokens JSON. The reference sheet has a "Known issues" section written for stakeholders, which can also be exported on its own. Outputs state only what's measured, who it affects and what was suggested. They never say colours were "kept by choice".

**Context:** Claude first drafted a scenario listing kept failures as "decisions I made". Benji questioned whether that was honest, and pointed out that people are sometimes asked to use colours that aren't their choice and need to justify back to stakeholders why those colours may not work.

**Alternatives considered:** reclassifying kept failures as decisions; recording failures in the tool only; recording that colours were kept by choice.

**Why:** Accessibility first means the tool always tells the truth about the palette. We can't know whose choice a colour was, and saying "by choice" could point at the wrong person.

**Consequences:** Continuing past the checks with failures open needs a confirmation that names each one. Unused colours are listed as information, not failures. AI tools can read the structured notes (US-12).

### D-032 · Export colour formats, with hex recommended
**Date:** 28 Oct 2026 · **Decided by:** Benji Greig · **Status:** Accepted · **Plane:** CLR-33, CLR-74

**Decision:** CSS exports are described as "CSS variables (custom properties)". Hex is the recommended default, because it works everywhere. People can choose rgb(), hsl() or oklch() instead, each with a note on when it's the right choice, and oklch() can include hex fallbacks.

**Context:** Benji asked for the most compatible format to be recommended, with sensible recommendations across the formats that are supported. oklch() has been widely available across browsers since May 2023, and color() with Display P3 since November 2025.

**Alternatives considered:** hex and oklch() only; also offering lab(), lch() and Display P3.

**Why:** lab() and lch() add nothing over OKLCH for interface work. colouri.st generates every colour inside sRGB, so a Display P3 value would be the same colour written differently.

**Consequences:** Wide-gamut colour generation for P3 screens is post-beta (CLR-74).

### D-033 · Phones get a read-only report in the beta
**Date:** 28 Oct 2026 · **Decided by:** Benji Greig · **Status:** Accepted · **Plane:** CLR-35, CLR-77

**Decision:** On a phone, a shared link opens as a read-only report: every colour and shade, the tokens in light and dark, the checks, and the reasoning behind each choice. Editing isn't available on phones in the beta. The page says honestly why: we're making the first version solid where it's used most, and phones come next. Visiting colouri.st directly on a phone shows the same message, plus a read-only example report built from an invented brand.

**Context:** People will often open a shared link on their phone. Full phone support is a stretch goal or post-beta (CLR-77).

**Alternatives considered:** leaving phones out of the beta entirely, so a shared link breaks on first contact; full phone editing in the beta.

**Why:** A broken shared link is a poor first impression, and a report covers most of what someone needs on a phone.

**Consequences:** The report reuses the reference sheet layout (CLR-34) and meets WCAG 2.1 AA, including reflow at 320 CSS pixels. Stage layouts are built mobile-friendly from the start.

### D-034 · Content in two passes
**Date:** 28 Oct 2026 · **Decided by:** Benji Greig · **Status:** Accepted · **Plane:** CLR-28, CLR-37

**Decision:** Explainers are written in two passes. First, Claude drafts a skeleton for each stage early: the key points, terms defined, the "why we recommend this" note, and what it depends on. Benji and Claude review these together. Second, once every dependency on a stage's list is settled, Claude drafts near-final copy and Benji edits and signs it off.

**Context:** Estimates showed Benji's assigned work at about four times his capacity, and content was the largest part of it. Benji agreed Claude should draft, but pointed out that some content depends on work that may still change, which could waste the drafting effort.

**Alternatives considered:** drafting everything to near-final now; Benji writing the content.

**Why:** Skeletons catch knock-on effects while they're cheap to fix, and keep Benji's time on review rather than rewriting.

**Consequences:** Benji's share of the content work falls from 10 points to about 3.5.

### D-035 · "color" in code; "colour" is a localisation
**Date:** 28 Oct 2026 · **Decided by:** Benji Greig · **Status:** Accepted · **Plane:** CLR-78

**Decision:** "color" is used everywhere in code: identifiers, the engine API, the rules schema, token names, CSS variables and exports. "Colour" is the Australian English localisation of what people read, from the language files. The product name colouri.st and the repo name are brand names and don't change.

**Context:** Australian English is the default language, but CSS, Figma and token tools all use "color".

**Alternatives considered:** "colour" in code as well; "colour" in token names only.

**Why:** Exports drop into projects without renaming, and it fits keeping all readable text in language files, ready for translation.

**Consequences:** The repo's documentation is written in Australian English, so it says "colour" when describing code that says "color". The convention goes into the coding guidelines when the repo is set up (CLR-1).

### D-036 · Estimates in half-day points
**Date:** 28 Oct 2026 · **Decided by:** Benji Greig · **Status:** Accepted · **Plane:** all beta tickets

**Decision:** Plane estimates use custom points, where 1 point is half a day of work: 1, 2, 4, 6 and 10. Anything larger than 10 is split. The estimate is the total effort, whoever does it, and Benji's share is tracked separately against his capacity of about 4 hours a week, which is about 1 point.

**Context:** About 15 items were added to the beta during the day, with no estimates to show whether 27 November still held. Plane offers points or categories, not days.

**Alternatives considered:** plain points not tied to time; T-shirt sizes.

**Why:** Tying points to time makes the cycle totals comparable with capacity, which is what answers "does the date hold?".

**Consequences:** The beta came to about 165 points. How to set estimates through the Plane API is recorded in the plane-estimates skill.

### D-037 · Wait for real numbers on capacity; the alpha keeps its full scope
**Date:** 28 Oct 2026 · **Decided by:** Benji Greig · **Status:** Accepted · **Plane:** CLR-82, CLR-38

**Decision:** No scope or date changes yet. The capacity gap is reviewed at the end of cycle 1, on 8 November, using the actual pace. The alpha sessions (CLR-38) keep their full scope of three to five sessions and stay with Benji, who manages that time. Benji and Claude write the moderation guide and set up the tests together, once the flow is stable enough to test.

**Context:** After the two-pass content decision, Benji's share was still about 10 points against about 4.5 points of capacity.

**Alternatives considered:** trimming the alpha to three sessions; more of Benji's hours in cycle 3; moving the date.

**Why:** Decisions made with real numbers are better than decisions made on estimates.

**Consequences:** If the gap remains at the review, Benji chooses how to close it.

### D-038 · colouri.st's interface uses its own engine
**Date:** 28 Oct 2026 · **Decided by:** Benji Greig · **Status:** Accepted · **Plane:** CLR-83 to CLR-87

**Decision:** The interface is predominantly black, white and grey, so it doesn't skew how people judge their own colours. Colour is used only for the person's palette and previews, and for error, warning and success states, which always pair colour with an icon and words. Every interface colour is generated by the colouri.st engine. This is done in four steps: generate the primitives; make a first-pass light and dark mapping together by hand; refine it with the engine once the light and dark mapping is built (CLR-27); and validate it through the CSS export once that's built (CLR-33).

**Context:** Benji suggested using the tool to make its own interface tokens. The engine's light and dark mapping and the CSS export arrive in cycles 2 and 3, so the work is split to start sooner.

**Alternatives considered:** a hand-made interface palette; waiting for the CSS export before starting.

**Why:** It tests the engine on a real system from day one, and it's a worked example for the launch and the case study.

**Consequences:** Problems found are fixed in the engine or rules, not patched in the interface. The interface project file is committed as a test fixture. The alpha sessions check that status colours aren't mistaken for part of the person's palette.

### D-039 · Svelte 5 for the view layer
**Date:** 29 Oct 2026 · **Decided by:** Benji Greig · **Status:** Accepted · **Plane:** CLR-5 · **ADR:** [adr/0003-front-end-framework.md](adr/0003-front-end-framework.md)

**Decision:** The view layer is built in Svelte 5, in runes mode, with Vite. State, logic and colour maths stay in plain TypeScript outside it.

**Context:** Six candidates were assessed on desk research, following D-014: Svelte 5, Vue 3, Preact with signals, Solid, Lit and framework-free TypeScript. Svelte and Preact were spiked by building stages 1 and 2 in each, on one shared core and stylesheet.

**Alternatives considered:** Preact with signals; Vue 3; Solid; Lit; framework-free TypeScript, which is kept as the fallback.

**Why:** Svelte is the healthiest project, with 62 active contributors and the best OpenSSF Scorecard of the candidates. Its compiler warns about accessibility problems while building. The core's store works with it directly, with no adapter. It has official llms.txt files and an MCP server for AI tools. Both spikes passed every automated accessibility and keyboard check, so the difference came down to health, coupling and tooling. Preact was smaller, but depends largely on one maintainer.

**Consequences:** svelte-check runs in CI, and the compiler's accessibility warnings are treated as errors. axe and manual testing still run. Health is reviewed yearly. Both spikes are kept in [research/framework/](research/framework/), along with the desk research and the assessment process ([adr/dependency-assessment.md](adr/dependency-assessment.md)).

### D-040 · Steps are named by contrast grade
**Date:** 29 Oct 2026 · **Decided by:** Benji Greig · **Status:** Accepted · **Plane:** CLR-7, CLR-13 · **Research:** [research/step-naming.md](research/step-naming.md)

**Decision:** By default, each ladder step is named by its contrast grade: 100 × log(1.05 ÷ (Y + 0.05)) ÷ log(21), from 0 for white to 100 for black. The difference between two grades gives their WCAG 2 contrast exactly: 37 apart for 3:1, 50 for 4.5:1 and 64 for 7:1. Purpose labels, such as background, border or text, belong to the next layer, the semantic tokens, rather than to the steps. Familiar naming, such as Tailwind-style 50 to 950 or Radix-style 1 to 12, is offered as naming presets.

**Context:** colouri.st offers 11, 13 and 15-step ladders, so names by position, like "700", mean different colours on different ladders. Benji asked for research into how design systems and other taxonomies name scales, and then for a smarter value than lightness, which can't predict contrast.

**Alternatives considered:** names by position (Tailwind, Radix, Spectrum), kept as presets; names by CIE L\* lightness (as Material does), which can't express a contrast rule; picking a token's step by contrast directly, which Benji noted would split hairs where contrast values are very close.

**Why:** A name that means the same thing in every colour and on every ladder, where differences carry meaning, is an interval scale in Stevens' terms. Position names are only ordinal. The contrast grade works like decibels: a logarithm turns the contrast ratio into a difference, so the rule colouri.st teaches can be read straight from the names. It holds for any colour, including a brand colour off the ladder.

**Consequences:** Semantic tokens name a grade, and the engine uses the nearest step on the chosen ladder, with WCAG 2 confirmed by the grades and APCA checked alongside, since APCA can't be captured in one number. Names are rounded for people, and the engine checks exact values. Still open: whether grades count up towards dark or light, how they're displayed, and whether the ladder presets nest (CLR-13).

