# colouri.st

A free, open-source guided tool that turns a brand's colours into an accessible colour system, explaining the colour theory at each step. Static, browser-only, Apache 2.0. Work is tracked in Plane (project `CLR`).

## Read before changing behaviour

- `docs/user-stories.md`: what's being built. Every change traces to a story (`US-xx`) and a ticket (`CLR-xx`).
- `docs/decision-log.md` and `docs/adr/`: why things are the way they are. Check them before reversing a choice.
- `docs/problem-statement.md` and `docs/jobs-to-be-done.md`: who it's for.
- `docs/research/`: evidence behind decisions, including the colour model and framework spikes.
- `docs/colour-theory-index.md`: colour questions already answered. Check it before raising or reopening a colour question, and build on the answer unless Benji reopens it. Rows marked "earlier work, to re-validate" aren't relied on until confirmed.

## Layers (D-010)

- `packages/engine`: pure TypeScript colour maths. No interface or framework code.
- `packages/rules`: the method as versioned, declarative data the engine reads. Recommendations are default configuration, and each rule carries its rationale.
- `apps/web`: the guided app. State and logic are plain TypeScript; Svelte 5 (runes mode) appears only in `.svelte` view components, which stay markup only (ADR 0003).

Visual design (CSS), logic and configuration stay in separate layers. New behaviour goes in the engine or rules first; the view only displays it.

## Conventions

- **Spelling:** `color` everywhere in code, identifiers, token names and exports. Readable text is Australian English ("colour") and lives in language files, never in components (D-035, CLR-78).
- **Docs in code:** every exported function, class and module has a docstring covering purpose, parameters, return value and errors. Comments explain why.
- **Tests:** named after their story and the scenario's exact title, with an optional detail after a dash, for example `US-01: Invalid input — hue shows dashes`. The tags in `docs/user-stories.md` say which layer tests each scenario, and `npm run scenarios` lists scenarios without a test (ADR 0004).
- **Definition of done:** every scenario passes at its tagged level, the ticket links the pull request, and any affected doc in `docs/` is updated in the same change.
- **Check the repo first:** other sessions (Benji, and Claude in planning sessions) change the repo too. Before writing, run `git status` and `git log`, re-read any file you're about to change, and edit only the part you mean to change rather than rewriting the file. Take the next decision log or ADR number from the repo as it stands just before you write.
- **Decisions made while building:** when Benji answers a question, record the answer and the reasoning in the same change (decision log or ADR for decisions, the story for clarifications) and note it on the Plane ticket. Without Plane access, list the ticket comment in the summary instead.
- **Commits:** Benji commits and pushes. Leave changes uncommitted, list what changed, and suggest a commit message that references the ticket, for example `Add the recipe ladders (CLR-13)`.

## Accessibility (WCAG 2.1 AA baseline)

- Svelte's compiler accessibility warnings fail the build. A deliberate exception needs a `svelte-ignore` comment saying why.
- axe runs in end-to-end tests; keyboard and VoiceOver checks are part of done for interactive work.
- The interface is predominantly black, white and grey. Every interface colour comes from colouri.st's own generated tokens (D-038, CLR-83). Status colour always pairs with an icon and words.

## Guardrails

- **Private by design:** no analytics, tracking, cookies or network calls carrying a person's colours. Share links keep data in the URL fragment (D-020, D-029).
- **Dependencies:** anything beyond a small single-purpose package needs an assessment and an ADR first, following `docs/adr/dependency-assessment.md` (D-014).
- **APCA:** only through the unmodified `apca-w3` package, in its separate add-on, never copied or modified (ADR 0002).
- **Example colours:** invented brands only. Real organisations' code, colours or names stay out of the repo; `fixtures/private/` is never committed.
- **Decisions:** accepted decision log entries are never rewritten. A changed decision gets a new entry that supersedes the old one.

## Svelte

Use Svelte 5 runes syntax. Svelte's AI docs are at https://svelte.dev/docs/ai, including `llms.txt` and an MCP server.
