# Contributing to colouri.st

Thanks for your interest. colouri.st is in early development, so the best ways to help right now are trying it, telling us what you think, and suggesting features.

Everyone taking part agrees to the [code of conduct](CODE_OF_CONDUCT.md).

## Suggesting a feature or reporting a problem

- **Feature requests** go in the "Feature requests" category of GitHub Discussions, where upvotes count as votes (D-028).
- **Bugs** go in GitHub Issues. Say what you did, what you expected and what happened. Please use an invented palette, or describe the colours, rather than sharing a client's brand.
- **Presets and naming templates** can be contributed as pull requests to `packages/rules/rules.json`, which is checked against its schema in CI (D-048).

## Before you change behaviour

Read these first. They explain what's being built and why, and most questions are already answered there.

- [User stories](docs/user-stories.md): every change traces to a story (`US-xx`).
- [Decision log](docs/decision-log.md) and [ADRs](docs/adr/): check them before reversing a choice. Accepted decisions are never rewritten; a changed decision gets a new entry that supersedes the old one.
- [Problem statement](docs/problem-statement.md) and [jobs to be done](docs/jobs-to-be-done.md): who it's for.

## Setting up

Follow [Getting started](README.md#getting-started) in the README. `npm run check` runs everything CI runs.

## How the code is organised

- `packages/engine` is pure TypeScript colour maths, with no interface or framework code.
- `packages/rules` holds the method as versioned, declarative data. Recommendations are default configuration, and each rule carries its rationale.
- `apps/web` is the guided app. State and logic are plain TypeScript. Svelte 5, in runes mode, is used only in `.svelte` view components, which stay markup only.

New behaviour goes in the engine or the rules first; the view only displays it. Visual design (CSS), logic and configuration stay in separate layers.

## Conventions

- **Spelling:** `color` everywhere in code, identifiers, token names and exports. Lint rejects any identifier containing "colour". Text people read is Australian English ("colour") and lives in language files, never in components (D-035).
- **Docstrings:** every exported function, class and module has one, covering its purpose, parameters, return value and errors. Lint enforces this. Comments explain why, not what.
- **Tests:** named after their story and scenario, with an optional detail after a dash, for example `US-01: Invalid input — hue shows dashes`. The tags under each story say which level tests each scenario. `npm run scenarios` lists scenarios that don't have a test yet.
- **Accessibility:** the baseline is WCAG 2.1 AA. Svelte's accessibility warnings fail the build; a deliberate exception needs a `svelte-ignore` comment saying why. axe runs in the browser tests, and keyboard and VoiceOver checks are part of done for anything interactive.
- **Interface colours:** the interface is predominantly black, white and grey, and every colour in it comes from colouri.st's own generated tokens (D-038). Status colour always pairs with an icon and words.
- **Example colours:** invented brands only. Real organisations' code, colours or names stay out of the repo.
- **Privacy:** no analytics, tracking, cookies or network calls carrying a person's colours. Share links keep their data in the URL fragment (D-020, D-029).
- **Dependencies:** anything beyond a small, single-purpose package needs an assessment and an ADR first ([process](docs/adr/dependency-assessment.md)).
- **APCA:** only through the unmodified `apca-w3` package, in its own add-on, never copied or modified ([ADR 0002](docs/adr/0002-apca.md)).

## Pull requests

- Link the story and the Plane ticket (`CLR-xx`) the change serves.
- Update any affected document in `docs/` in the same change.
- Write commit messages as a short imperative sentence with the ticket in brackets, for example `Add ladder presets (CLR-13)`.
- CI must pass: formatting, lint, type checks, tests, the build and the browser tests.

## Licence

colouri.st is licensed under [Apache 2.0](LICENSE). By contributing, you agree that your contributions are licensed under the same terms.
