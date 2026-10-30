# Decision log

Every significant product, architecture and process decision for colouri.st, newest batch first within each group. Each entry records the decision, the context, the alternatives considered, why it was made and what it means for the rest of the work, with a link to its Plane ticket (project `CLR`). Bigger decisions also have a full write-up in [`adr/`](adr/).

To add a decision: copy an entry, give it the next number, and link the ticket. Never rewrite an accepted entry. If a decision changes, add a new entry that supersedes it and set the old one's status to "Superseded by D-0xx".

| Group | Entries |
|---|---|
| [Product](#product) | D-001 to D-007 |
| [Architecture and platform](#architecture-and-platform) | D-008 to D-018 |
| [Reach and audience](#reach-and-audience) | D-019 to D-023 |
| [User stories and delivery](#user-stories-and-delivery) | D-024 to D-054 |

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
**Date:** 28 Oct 2026 · **Decided by:** Benji Greig · **Status:** Superseded by D-054 · **Plane:** CLR-13

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

### D-040 · Development toolchain
**Date:** 29 Oct 2026 · **Decided by:** Benji Greig · **Status:** Accepted · **Plane:** CLR-1 · **ADR:** [adr/0004-toolchain.md](adr/0004-toolchain.md)

**Decision:** The repo uses Node 26 and npm workspaces, with exact versions and install scripts turned off. TypeScript 6.0 runs in strict mode, with svelte-check for the app. Tests run in Vitest, with Playwright and axe for the browser in Chromium, Firefox and WebKit. Lint is ESLint and formatting is Prettier. GitHub Actions checks every push, and `main` deploys to GitHub Pages. The Gherkin scenarios aren't run directly: tests are named after each scenario, and a script lists any scenario without a test.

**Context:** CLR-1 sets up the monorepo from D-010. The build brief asked for the toolchain to be recorded in one short ADR, with a reason and alternatives for each choice, because none of these tools ships to people using colouri.st. ADR 0003 left the Gherkin question to CLR-1.

**Alternatives considered:** pnpm, Yarn or Bun; Turborepo or Nx; TypeScript 7; Node's test runner or Jest; Biome or oxlint; Cypress or WebdriverIO; running the scenarios with playwright-bdd; Netlify or Cloudflare Pages for pull request previews.

**Why:** Every tool either came with Node or was proven in the framework spike, and ESLint is the only linter that can enforce the docstring and "color" rules. Most stories are tested at two or three levels, so running Gherkin in one of them would mean two Gherkin tools, and the stories would have to be copied into `.feature` files. TypeScript 7 isn't supported by typescript-eslint or svelte-check yet.

**Consequences:** `npm run check` runs exactly what CI runs. Lint enforces docstrings on every export and "color" in identifiers. The scenario report becomes a gate, failing the build for any untested scenario, before the closed beta starts on 23 November 2026. GitHub Pages has no per-branch previews, so each pull request's build is kept as a download on its CI run. The site is served at `/colourist/` until the domain is set up (CLR-41).

### D-041 · Steps are named by contrast grade
**Date:** 29 Oct 2026 · **Decided by:** Benji Greig · **Status:** Accepted · **Plane:** CLR-7, CLR-13 · **Research:** [research/step-naming.md](research/step-naming.md)

**Decision:** By default, each ladder step is named by its contrast grade: 100 × log(1.05 ÷ (Y + 0.05)) ÷ log(21), from 0 for white to 100 for black. The difference between two grades gives their WCAG 2 contrast exactly: 37 apart for 3:1, 50 for 4.5:1 and 64 for 7:1. Purpose labels, such as background, border or text, belong to the next layer, the semantic tokens, rather than to the steps. Familiar naming, such as Tailwind-style 50 to 950 or Radix-style 1 to 12, is offered as naming presets.

**Context:** colouri.st offers 11, 13 and 15-step ladders, so names by position, like "700", mean different colours on different ladders. Benji asked for research into how design systems and other taxonomies name scales, and then for a smarter value than lightness, which can't predict contrast.

**Alternatives considered:** names by position (Tailwind, Radix, Spectrum), kept as presets; names by CIE L\* lightness (as Material does), which can't express a contrast rule; picking a token's step by contrast directly, which Benji noted would split hairs where contrast values are very close.

**Why:** A name that means the same thing in every colour and on every ladder, where differences carry meaning, is an interval scale in Stevens' terms. Position names are only ordinal. The contrast grade works like decibels: a logarithm turns the contrast ratio into a difference, so the rule colouri.st teaches can be read straight from the names. It holds for any colour, including a brand colour off the ladder.

**Consequences:** Semantic tokens name a grade, and the engine uses the nearest step on the chosen ladder, with WCAG 2 confirmed by the grades and APCA checked alongside, since APCA can't be captured in one number. Names are rounded for people, and the engine checks exact values. Still open: whether grades count up towards dark or light, how they're displayed, and whether the ladder presets nest (CLR-13).

### D-042 · Contrast grades count up towards dark, with an option to count towards light
**Date:** 29 Oct 2026 · **Decided by:** Benji Greig · **Status:** Accepted · **Plane:** CLR-7 · **Research:** [research/step-naming.md](research/step-naming.md), third pass

**Decision:** By default, contrast grades count up towards dark: 0 is white and 100 is black. Counting towards light (100 minus the grade) is a naming setting in the rules, not built into the engine.

**Context:** Benji noticed that stored colour values count up towards light (RGB 0 to 255, hex 00 to FF, CIE L\*, Material 3 tones), while familiar design system names count up towards dark (Material's 2014 palette, Tailwind, USWDS, Carbon, Radix, Spectrum, and print tints by ink).

**Alternatives considered:** counting towards light by default, as stored values and Material 3 tones do; a fixed direction with no option.

**Why:** Measurements count light because screens emit it, while names have counted ink, as print does. The default matches the names people already use for tokens, and every familiar naming preset counts the same way, so switching between grades and a preset never flips direction. It also fits the "dark-is-more" bias found by Soto, Schoenlein and Schloss (2023), though that evidence comes from data visualisation. The contrast rule depends only on differences, so it's the same in either direction.

**Consequences:** The rules' `naming` section holds the direction, with "towards dark" as the default. The engine always works in stored values. Explainers say which way the numbers count.

### D-043 · Contrast grades are shown as 0 to 100
**Date:** 29 Oct 2026 · **Decided by:** Benji Greig · **Status:** Accepted · **Plane:** CLR-7 · **Research:** [research/step-naming.md](research/step-naming.md)

**Decision:** Contrast grades are shown as whole numbers from 0 to 100, for example 54. The rule people learn is "37 apart for 3:1, 50 apart for 4.5:1, 64 apart for 7:1".

**Alternatives considered:** multiplying by 10, for example 540, so names look like familiar 50 to 950 naming.

**Why:** Multiplied by 10, grades could be mistaken for Tailwind-style position names, which mean something different. Showing 0 to 100 is honest about being a different scale, and "50 apart" is easy to remember. Familiar naming stays available as presets (D-041).

**Consequences:** Names are rounded to whole numbers for people, and the engine checks exact values (D-041).

### D-044 · One AA or AAA setting per project, with per-token overrides
**Date:** 29 Oct 2026 · **Decided by:** Benji Greig · **Status:** Accepted · **Plane:** CLR-7, CLR-81 · **Extends:** D-030

**Decision:** A project's AA or AAA target is one setting. Choosing AAA raises every token's required contrast at once, for example from 50 to 64 grades apart for body text. A single token can override the project's target, for people who need a mix, such as AAA for body text and AA elsewhere.

**Alternatives considered:** a target set on every token, which allows any mix but is more to manage and harder to explain.

**Why:** The simple case stays simple, and it matches how D-030 described the feature. Benji noted that people working to meet both AA and AAA within one system need this explained well, so the override comes with its own guidance.

**Consequences:**
- The guided flow explains mixed targets when someone overrides a token. That covers which tokens meet which level, and why a mix is common (for example, AAA for body text and AA for interface elements).
- The explainer is honest that WCAG conformance applies to whole pages, not tokens, so some tokens meeting AAA doesn't make a page AAA.
- Non-text contrast (WCAG 1.4.11) has an AA requirement of 3:1 and no AAA level, so interface elements need 37 grades apart at either target.
- Checks, known issues and exports show the target each token was checked against.

### D-045 · The app is always current; the library is pinnable
**Date:** 29 Oct 2026 · **Decided by:** Benji Greig · **Status:** Accepted · **Plane:** CLR-7, CLR-21, CLR-35, CLR-75 · **Extends:** D-029

**Decision:** Compatibility is handled in two places.

- **In the app, always current.** A project or share link stores its inputs plus only the rules settings the person changed from the defaults. Opening an older one regenerates it on the current rules and says so: which versions it was made with, and what has changed in the method since, from the release notes. Settings that no longer exist in the new rules are flagged, never dropped silently.
- **In the library, pinnable.** The engine and rules are published as versioned packages, with every release kept. Anyone building on them, including developers and AI tools, can pin a version and reproduce an old result exactly.

**Supporting rules:**
- Every project records its rules version and engine version.
- Semantic versioning with a written promise: patch releases never change outputs, minor releases state exactly what changes, and major releases can change the method. Golden tests (fixed reference outputs) enforce it.
- During the beta, the app says plainly that projects and links pick up improvements as the method changes.

**Context:** Claude first proposed keeping every past rules version in the app so old projects regenerate exactly. Benji questioned the long-term bloat and maintainability. The real risk is engine code, not rules data: keeping old behaviour alive in the current engine piles up special cases over time.

**Alternatives considered:**
- Every rules version kept in the app, regenerating exactly forever.
- A support window, where the last two major versions regenerate exactly and older projects upgrade.
- Frozen engine snapshots hosted inside the app.

**Why:** Benji's view is that regenerating on the current method is a benefit, not a fault: the person gets an upgraded palette, honestly labelled. Exact reproducibility matters most to people using the library directly, and published, pinned versions serve them without any bloat in the app. A person's design system never depends on regeneration anyway, because their exported tokens hold the final values.

**Consequences:**
- The upgrade message can't show exact before-and-after colours without the old engine. Benji is fine with that: the person who shared a link can also share the exported reference sheet, which gives an exact comparison. An in-app comparison is a possible later feature.
- This answers ADR 0005's open questions on old rules versions and on how a person's changes are stored.

### D-046 · Project files and rules are validated by JSON Schema, precompiled with Ajv
**Date:** 29 Oct 2026 · **Decided by:** Benji Greig · **Status:** Accepted · **Plane:** CLR-7 · **ADR:** [adr/0006-validation-library.md](adr/0006-validation-library.md)

**Decision:** JSON Schema is written first. Ajv is a dev dependency only, used in tests and to generate the validators at build time. The generated validator is committed, formatted, and checked in CI. hyperjump cross-checks Ajv in CI. The app reads untrusted input through one function of our own, with a size cap.

**Context:** ADR 0005 left the validation library open. Project files and share links come from outside and can't be trusted, the app runs under a strict security policy with no server, and anything that runs in the app ships to everyone, so it was assessed as a substantial dependency (D-014).

**Alternatives considered:** Zod, Valibot, TypeBox and ArkType, writing the schema in code; Ajv compiled in the browser; cfworker, hyperjump and json-schema-library at runtime; schemasafe precompiled; jsonschema; a hand-written validator.

**Why:** It's the only actively released option that works under our strict security policy and adds under 3 KB. The schema stays standard and publishable, and the library is easy to replace. The code-first libraries' exported schemas lost rules or were larger; Ajv in the browser needs `unsafe-eval`; the runtime libraries were larger, crashed on deep nesting or had a single maintainer; schemasafe is inactive; a hand-written validator would drift from the schema. Benji chose to commit the generated validator so every change to what ships can be read in review.

**Consequences:** `packages/rules` gets a build step that generates and formats the validators. CI checks the test inputs through both Ajv and hyperjump, that the generated code is up to date, that the types agree with the schema, and the security-policy check in Chromium, Firefox and WebKit. Ajv's health is reviewed every October. The spike and desk research are kept in [research/validation/](research/validation/).

### D-047 · Colour conversions follow CSS Color 4; gamut mapping keeps L* and hue at the most chroma that fits
**Date:** 29 Oct 2026 · **Decided by:** Benji Greig · **Status:** Accepted · **Plane:** CLR-12 · **ADR:** builds on [adr/0001-colour-model.md](adr/0001-colour-model.md)

**Decision:**
- **Matrices:** the engine converts through CIE XYZ (D65) using the matrices and white from CSS Color 4's sample code: the exact rational sRGB matrices, and the higher-precision OKLab matrices CSS Color 4 recomputed from XYZ, rather than Ottosson's original linear-sRGB constants that the spike used.
- **Gamut mapping:** for a target CIE L\*, an OKLCH hue and the chroma wanted, the engine returns the colour at exactly that L\* and hue with the requested chroma if it fits, and otherwise the most chroma that fits. The result reports the requested and achieved chroma and whether it was reduced. The target gamut is a parameter: sRGB in the beta, and Display P3 later (CLR-74).
- **Greys:** a grey has no hue. OKLCH, CIE LCh and HSL report its hue as empty (`null`), never 0. Whether a converted colour counts as grey uses a rounding tolerance per space (chroma 1e-6 in OKLab, 1e-4 in CIE Lab), which only absorbs floating-point noise. It is not a method threshold; judgements about low chroma belong to the rules.

**Context:** ADR 0001 chose the colour model, and said gamut reduction must find the maximum in-gamut vividness at each step, because the analysis script's coarse reduction dulled some steps. CLR-12 builds the conversions and gamut mapping for the engine.

**Alternatives considered:** Ottosson's original matrices; CSS Color 4's own gamut mapping, which reduces chroma at constant OKLCH lightness and stops within a just noticeable difference (ΔE OK 0.02); clipping channels; a fixed sRGB target; reporting a grey's hue as 0.

**Why:** The CSS Color 4 matrices make the engine's `oklch()` exports match what browsers render and what Color.js computes; the two sets of matrices differ by about 0.0001. CSS Color 4's gamut mapping keeps OKLCH lightness rather than CIE L\*, so it would move steps off the ladder and break counting steps for contrast; its stopping tolerance would also dull steps the gamut doesn't require. Clipping shifts hue and lightness. A gamut parameter lets wide-gamut colour come later without a rewrite. A hue of 0 for a grey reads as red and would mislead any hue check, so the absence is made explicit.

**Consequences:** The engine's tests check every mapped colour is in gamut, at its target L\* and hue, and that a hair more chroma would not fit. Conversions are tested against published reference values (IEC 61966-2-1, CIE 15:2004, Ottosson's OKLab table, the 34 CIEDE2000 pairs from Sharma, Wu and Dalal) and cross-checked against Color.js 0.7.1 output committed as a fixture; Color.js isn't a dependency. Code that reads hue must handle an empty hue, including the view's hue, saturation and lightness readout in US-01.

### D-048 · How the rules schema is built: contrast by open lists of uses and contexts, and marked placeholders
**Date:** 29 Oct 2026 · **Decided by:** Benji Greig (uses, contexts, placeholders, reason text and scope); the typed literal and the two extra sections were proposed by Claude Code while building and reviewed by Benji, who asked for separation targets and both levels on every use · **Status:** Accepted · **Plane:** CLR-7, CLR-20, CLR-75 · **ADR:** builds on [adr/0005-rules-schema.md](adr/0005-rules-schema.md) and [adr/0006-validation-library.md](adr/0006-validation-library.md)

**Decision:**
- **Contrast targets are keyed by an open list of use IDs,** such as `bodyText`, `largeText` and `interfaceElement`. Each use can vary by context, and contexts are an open list too: `light`, `dark`, and `moreContrast` as a placeholder. Each target stores the WCAG ratio, which checks use, and the grade difference rounded up (37, 50 or 64), which teaching uses. Those simple numbers are promised only for colouri.st's own steps (D-049). A test keeps the two consistent.
- **Every use has both AA and AAA targets** (D-044). The schema requires both, and a test checks it.
- **Uses WCAG sets no ratio for have a separation target:** a minimum number of grades from what they sit on, by level and context. These are `surface`, `hover` and `subtleBorder`, with stand-ins from the CLR-13 research medians (surfaces about 2 grades in light mode and 4 in dark), as CLR-13 placeholders. A use has WCAG targets or a separation target, never both. Only the page background, which sits on nothing, has no use.
- **Undecided values are stand-ins with a `placeholder` marker** naming the deciding ticket and the stand-in's source. A test lists every placeholder, and the rules stay at version 0.x until none are left. Assigned tickets:
  - **CLR-13:** ladder presets, the recommendation, more-contrast targets, and whether states are ladder steps or overlays. The last is deliberately undecided, and nothing in the schema assumes either.
  - **CLR-17:** APCA targets, left empty rather than given stand-in values.
  - **CLR-72:** naming presets, and the token pattern, case and separator.
  - **CLR-3:** palette presets and groups.
  - **CLR-15:** vividness.
  - **CLR-16 and CLR-18:** distinctness.
  - **CLR-14:** hue drift.
  - **CLR-27:** semantic tokens.
- **Reason text stays in the app's language files** (`apps/web/src/lang/`), as ADR 0005 says. A test checks that every key exists, and that only placeholder rules have placeholder text. To be raised again with CLR-90, since a published rules package would carry keys without text.
- **The project and share-link schemas and their shipped validator** move to CLR-20 and CLR-75, with ADR 0006's commitments noted on both tickets. CLR-7 builds the rules schema only, which is checked in CI and never validated in the browser.
- **The schema is written as a typed TypeScript literal** (`packages/rules/src/schema.ts`), so Ajv's `JSONSchemaType` checks it against the hand-written types. That check needs Ajv's non-standard `nullable` keyword on optional properties. The published schema, `packages/rules/schema/rules.schema.json`, is the literal with `nullable` removed. Ajv in strict mode and hyperjump both validate against the published copy, and a test fails if it's out of date. One strict rule, `strictRequired`, is off, because "WCAG targets or a separation target" is written with `required` inside `oneOf`.
- **Two sections beyond ADR 0005's original table,** now added to it: `groups` (brand, feedback, neutral), which presets and vividness defaults refer to, and `hue`, for US-03's drift threshold.
- **The contrast grade function** lives in the engine (`contrastGrade`, `gradesForRatio`), as ADR 0005 says, so the rules tests check ladder grades against it.

**Context:** CLR-7 builds the rules schema to ADR 0005 and ADR 0006, while CLR-3, CLR-13 and other tickets are still deciding the values. The ladder distribution research (CLR-13) shows that uses will grow beyond text and interface elements, and that contexts such as dark mode and more contrast change the separations they need.

**Alternatives considered:** a fixed set of uses and levels; leaving undecided sections out of the schema; null or empty values instead of marked stand-ins; generating types from the schema, or the schema from code; building the project validator now.

**Why:** Open lists let CLR-13 add uses and contexts without a schema change. Marked stand-ins keep the shape whole and testable now, and stop a stand-in from being mistaken for a decision. Writing the schema as a typed literal keeps ADR 0006's type check, while the published schema stays standard. The project validator would be generated code that nothing uses yet.

**Consequences:** The rules are at version 0.1.0. CLR-13, CLR-3 and the other tickets replace stand-ins by removing their placeholders, which the placeholder test makes visible. A schema change means running `npm run schema --workspace @colourist/rules`.

### D-049 · The contrast rule colouri.st states: three layers, worded in grades
**Date:** 29 Oct 2026 · **Decided by:** Benji Greig · **Status:** Accepted, the wording for now · **Plane:** CLR-13 · **Research:** [research/contrast-rule.md](research/contrast-rule.md)

**Decision:** colouri.st tells people about contrast in three layers:
- **Everyday use needs no rule.** Semantic tokens come pre-paired and are checked on exact values, in WCAG 2 and APCA, so accessibility comes with the system (job 8).
- **The stated rule is in grades:** 37 apart for 3:1, 50 for 4.5:1 and 64 for 7:1, promised for colouri.st's own steps. A test checks every ladder preset so that no pair of steps meets those numbers on rounded names while failing on exact values. For colours that aren't steps, such as a brand colour, colouri.st checks the pair, and says so wherever the rule is taught.
- **Step counts are only a guide** in the ladder view, worked out for whichever ladder is chosen, such as "around the middle, 3 steps apart give 3:1". They're never the rule.

**Context:** CLR-13's first open question, because the others depend on it: a step-count rule only works on an evenly spaced ladder, while a grade rule holds on any ladder, which leaves the ladder free to follow uses (CLR-13 research). The exact thresholds are 36.08, 49.40 and 63.92 grades. People see whole-number names, so two names 50 apart can be 4.44:1 for colours off the ladder; on colouri.st's 11, 13 and 15-step ladders, no pair misleads.

**Alternatives considered:**
- A step-count rule, as Stripe has
- A lookup table, as IBM Carbon has
- A lightness difference, as Material has (approximate: tone 50 on white is 4.48:1)
- Contrast against one background, as Leonardo has
- For the wording: 37, 51 and 65 for any colour; names to one decimal place; 40, 55 and 70 with a margin

All are documented in the research.

**Why:** Designers mostly know the guidelines but don't apply them, and make mistakes checking by hand, so guarantees and built-in checks matter most. Grades hide the logarithm, so people only subtract, and the rule is exact on any ladder. The simple numbers are honest only for colouri.st's steps, so that's where they're promised.

**Consequences:**
- The rounding test sits with the ladder presets (CLR-13).
- Teaching content (US-11) states the rule with its condition.
- CLR-95 tests whether people use grades or step counts more accurately. If grades prove hard to use, the wording options can be revisited.

### D-050 · Ladders of each size are designed independently, not nested
**Date:** 29 Oct 2026 · **Decided by:** Benji Greig · **Status:** Superseded by D-054 · **Plane:** CLR-13 · **Research:** [research/ladder-distribution.md](research/ladder-distribution.md), Part 1

**Decision:** The 11, 13 and 15-step ladders aren't subsets of one another. Each is designed for its own size.

**Context:** Nesting would make a step shared between ladder sizes exactly the same colour.

**Alternatives considered:**
- Nesting on today's 13-step ladder. This leaves the 15-step ladder uneven, with grade gaps of about 6 beside 12.
- Nesting from a new 15-step ladder. This gives up the 13-step ladder tested in ADR 0001, and leaves a big jump at the dark end of the 11.

**Why:** Tokens name contrast grades (D-041), and the engine uses the nearest step, so changing ladder size keeps every token at about the same contrast without nesting.

**Consequences:** Steps shared between ladder sizes aren't identical hex values, though their grades line up. The ladders' values are still to be derived from uses and contexts (CLR-13).

### D-051 · Three token tiers; aliases are a mechanism and themes are dimensions
**Date:** 29 Oct 2026 · **Decided by:** Benji Greig · **Status:** Accepted · **Plane:** CLR-13, CLR-27 · **Research:** [research/token-layers.md](research/token-layers.md)

**Decision:** colouri.st uses the common three tiers of design tokens:
- **Primitive tokens** are the available values: the ladders, one family per colour. colouri.st generates them.
- **Semantic tokens** are decisions named by purpose, which reference primitives and change with the theme while the name stays the same.
- **Component tokens** are decisions for one component. They're mostly out of scope: teams map their own components to colouri.st's semantic tokens.

Two things often drawn as layers aren't tiers:
- **Aliases** are the mechanism that connects tiers, not a tier of their own.
- **Themes, modes and other contexts** are dimensions, modelled as the DTCG resolver module's modifiers and contexts. Each combination of contexts is a separate resolution.

**Context:** Benji reframed CLR-13's question about states: colouri.st represents relationships between colours, in any number of themes. That needed a precise shared definition of the kinds of tokens. Sources describe between three and five layers, because they count aliases, themes or modes as layers.

**Alternatives considered:**
- Five layers, counting aliases and themes or modes as tiers
- Material's naming (reference, system and component)
- Gossmann's critique that tiers matter to token designers, not consumers. Kept as guidance: explain tiers where people build the system, and show purposeful names where they use it.

**Why:** The three tiers are the most widely shared definition, from Frost, Spectrum, Material and Atlassian. Treating aliases and themes as what they are keeps the model clear and matches the DTCG format, which colouri.st exports.

**Consequences:** Exports carry primitives, semantic tokens and a resolver describing the dimensions (CLR-32). D-052 builds the model on these tiers.

### D-052 · Semantic tokens are defined by their relationships, and themes are dimensions the person defines
**Date:** 30 Oct 2026 · **Decided by:** Benji Greig · **Status:** Accepted as the direction; details open · **Plane:** CLR-13, CLR-27 · **Research:** [research/colour-relationships.md](research/colour-relationships.md)

**Decision:**
- **colouri.st represents relationships between colours.** A semantic token is defined by its relationships to other semantic tokens, not by a fixed grade.
- **Seven kinds of relationship**, none naming a component: legibility, separation, signifier, emphasis, state, distinctness and harmony. Harmony is only a guide, and never decides whether a combination is valid.
- **A theme is one resolution:** every semantic token mapped to a primitive, for one combination of the dimensions the person defines, such as brand, product, mode or contrast, in any number.
- **colouri.st shows which primitives satisfy each token's relationships** in every resolution, suggests a default and lets the person choose. Invalid combinations are never offered as valid.
- **People choose by looking,** with a component-agnostic test pattern. It shows text, icons, boundaries, fills, and fills with text, small and large, alone and side by side, on each surface, in each theme and each state.
- **States are semantic tokens** with a state relationship to their resting token. Whether they're exported as solid values or overlays is still open.

**Context:** Benji's view is that states depend on creative choices (dark buttons on a light page need different states from light ones), and that steps and overlays aren't the basis of the model. Themes vary by brand, product and more, not just light and dark.

**Alternatives considered:**
- A fixed grade for each semantic token in light and dark, as ADR 0005 first described
- Themes limited to light and dark
- Component-specific previews, such as button and form-field mock-ups. Replaced by the test pattern, which needs no components.

**Why:**
- Readability comes from luminance contrast, not hue (Legge et al., 1987 and 1990; Hall & Hanna, 2004).
- A colour's look depends on its neighbours (Krauskopf et al., 1986; Gilchrist et al., 1999), so relationships are judged in context.
- Regions group what's inside them (Palmer, 1992; Palmer & Rock, 1994).
- Standing out depends on neighbours (Wolfe & Horowitz, 2017), and interactive things need visible signals (Moran, 2017).
- Overlays look different over different backgrounds (Singh & Anderson, 2002). Measured on 27 design systems, overlays don't scale for dark mode and change coloured fills unevenly.
- Harmony follows patterns but varies between people (Schloss & Palmer, 2011; Ou et al., 2004).

**Consequences:**
- ADR 0005 is amended: semantic tokens name their relationships, and each resolution records the primitive and grade chosen.
- The rules schema (D-048) already has open lists of uses and contexts, and its semantic section holds only stand-in tokens marked for CLR-27. CLR-27 redesigns that section around relationship types and theme dimensions.
- US-06 and CLR-27 become the heart of the product, and will be rewritten with Benji around relationships, themes and the test pattern.
- CLR-13's remaining questions, how the ladder is derived and how many steps it has, sit inside this model. The ladder serves the relationships.
- Open: export format for states, how emphasis is specified, which dimensions the beta's guided flow covers, exporting interacting dimensions, and the smallest useful test pattern (CLR-95).

### D-053 · Ladders are presets you map onto; gaps are flagged in the beta, and tuning comes after
**Date:** 30 Oct 2026 · **Decided by:** Benji Greig · **Status:** Accepted, amended by D-054 · **Plane:** CLR-13, CLR-17, CLR-98 · **Research:** [research/ladder-derivation.md](research/ladder-derivation.md)

**Decision:**
- **Every family shares one ladder shape, from a preset** (11, 13 or 15 steps, D-005, D-050). A step means the same in every colour, so people can move between families and themes easily. Full ladders are always exported as primitives.
- **Mapping shows where a ladder falls short.** Each semantic token's relationships give it a range to sit in, in each theme (D-052). colouri.st flags any token with no step in its range, and any related tokens forced onto the same step.
- **In the beta, colouri.st flags these gaps** and suggests a larger preset where that helps (CLR-17).
- **After the beta, the ladder can be tuned to the mapping** (CLR-98):
  - An in-between step is added only in the family that needs it, named by its grade.
  - In new work, its neighbours are re-spaced so each gap in the family stays above the minimum L\* gap.
  - A "keep existing steps fixed" option is on by default for imported systems (CLR-97), and can be switched on once a project is in use. With it on, tuning only adds steps.

**Context:** CLR-13's question 2 asked how the ladder is derived from uses and contexts. Fitting the 27-system targets to one family serving light and dark needs 12 to 18 grey steps and 9 accent steps, depending on the uses and the AA or AAA target. At AA, the middle steps serve both modes: light control borders and dark muted text both land around 40 grades, and light muted text and dark control borders around 55. In 22 systems with both modes, light and dark share only 0 to 4 of 8 to 18 neutral values. Today's 13 steps miss some dark-mode surfaces and states, tints and fill hovers by up to 2 grades, and make uses near the page share steps.

**Alternatives considered:**
- A different ladder for each colour, fitted to its own needs. Rejected because uneven, varying ladders make switching between families hard. Consistency helps people learn and transfer what they know (Grudin, 1989), and Stripe, Goldman Sachs and Material all keep a step's meaning the same across hues.
- A ladder per theme, as Radix, Atlassian and Primer do. About twice the primitives, multiplying again with brand × mode.
- No ladder, with values solved per theme, as Leonardo and Material do. This loses the primitive tier (D-051).
- Trimming exports to the steps in use. Rejected: full ladders cost little in code and are useful as primitives.
- Never moving existing steps, in any case. Rejected: that only matters once a system is in use.

**Why:** A common, preset shape keeps steps interchangeable while people explore and choose. The value of fitting to relationships comes at mapping. Adding steps where needed matches practice: Material added surface tones, and Atlassian added in-between dark greys. Flagging gaps in the beta keeps outputs honest (D-031), and leaving tuning until after the beta keeps it trimmed in depth (D-003).

**Consequences:**
- CLR-17 (checks) gains the gap check for the beta.
- CLR-98 covers tuning and the "keep steps fixed" option, after the beta.
- Question 3 (step counts and when each preset is recommended) builds on this: a preset is recommended by how few gaps it leaves for the chosen uses, themes and target.
- The adjacent-step minimum uses the L\* gap (D-012, D-026). Its value is still to be set.

### D-054 · The ladder is built in three zones from the product's choices; presets become recipes
**Date:** 30 Oct 2026 · **Decided by:** Benji Greig · **Status:** Accepted · **Supersedes:** D-005, D-050 · **Amends:** D-053 · **Plane:** CLR-13, CLR-94 · **Research:** [research/ladder-zones.md](research/ladder-zones.md)

**Decision:**
- **Each project has one fixed ladder, shared by every colour family.** It's built from what the product contains, then held fixed. Steps are named by grade, so a name means the same contrast in every project (D-041).
- **The ladder has three zones:**
  1. **Light background zone:** fine steps near the light page, for surfaces, states, selection and subtle borders.
  2. **Contrast zone:** wide steps placed at the contrast thresholds from each page (37, 50 and 64 grades, or as the target sets them), so the contrast rule holds exactly where text and borders need it.
  3. **Dark background zone:** fine steps near the dark page, about twice as far apart as in the light zone.
- **Product choices add steps.** Layers, selection and states add steps to the background zones. A dark theme adds the dark zone. The target moves the contrast zone. The choices add up rather than being one pick.
- **Presets become recipes (CLR-94):** named sets of answers, such as a content site or an app with a dark theme. Each recipe builds a ladder. Without answers, the default recipe builds something close to today's 13 steps.
- **In the beta:** a few fixed recipes, their ladders worked out in the rules file. A gap found at mapping suggests changing an answer, such as adding layers, which rebuilds the ladder. Fully open answers and tuning (CLR-98) come after the beta.
- **D-053 still applies:** mapping flags gaps, and tuning adds in-between steps after the beta. Where D-053 says "preset", read "the recipe's ladder".

**For people used to fixed, even ladders:** familiar ladders are less even in contrast than they look, and systems with even ladders add hover colours or overlays outside the scale near the ends. colouri.st places steps where a system uses colour: close together where surfaces and states need small, visible differences, and far apart where text needs contrast. The steps an old ladder hid become part of the ladder, named, counted and checked. Data palettes stay evenly spaced, because charts need equal-looking steps. The full explanation is in the research.

**Context:** CLR-13's question 3 asked which preset to recommend, and when. Adding product choices together showed the shortfall is crowding near the page: an interactive light theme needs five tokens within about 5 grades of white, and even the 15-step preset has only two steps there. Uses are hard for people to state directly, and choices add up rather than being one pick.

**Alternatives considered:**
- Fixed presets of 11, 13 and 15 steps, with one recommended (D-005, D-050). Superseded: no preset fits once a product has layers, states and a dark theme.
- Recommending the preset with the fewest gaps. Rejected for the same reason.
- Dropping presets with no starting point. Rejected: people need a sensible default and familiar starting points, which recipes give.

**Why:**
- The zones follow perception: small differences are seen best near the background (crispening), and dark tones need bigger steps.
- Practice bunches steps the same way: Radix puts 8 of 12 steps in the light third, Polaris 10 of 16, and Material adds surface tones near each end.
- Placing middle steps on the thresholds keeps step counting exact where text and borders need it (D-049).
- Each step has a reason that can be shown to people (job 10).

**Consequences:**
- D-005 and D-050 are superseded.
- CLR-94 (recipes) moves into the beta, limited to a few fixed recipes.
- The rules schema gains recipes and the zone rules in place of fixed ladder presets (CLR-7, ADR 0005).
- US-02 (choose a ladder) needs rewriting around recipes, with Benji.
- The question set and its modelled interface examples are designed next, then tested with people (CLR-95).
