# ADR 0004 · Development toolchain

**Date:** 29 Oct 2026 · **Status:** Accepted · **Decided by:** Benji Greig · **Plane:** CLR-1 · **Decision log:** D-040

## Decision

| Area | Choice |
|---|---|
| Runtime | Node 26, the Active LTS since 28 Oct 2026, set in `.nvmrc` and `engines` |
| Language | TypeScript 6.0, not 7.0, until typescript-eslint and svelte-check support 7 |
| Package manager and workspaces | npm workspaces, with a committed lockfile, exact versions and install scripts turned off |
| Task running | Root npm scripts that call each workspace's scripts. No monorepo task runner. |
| Type checking | `tsc --noEmit` in strict mode for `packages/*`; `svelte-check` for `apps/web` |
| Unit, property and component tests | Vitest. fast-check for property tests, added with the first `[property]` scenario (CLR-12 or CLR-17). |
| Linting | ESLint with typescript-eslint, eslint-plugin-svelte and eslint-plugin-jsdoc |
| Formatting | Prettier with prettier-plugin-svelte |
| Browser and axe tests | Playwright with `@axe-core/playwright`, in Chromium, Firefox and WebKit |
| Gherkin scenarios | Ordinary tests named after each scenario, plus a small script that reports which scenarios have no test. The Gherkin isn't run directly. |
| CI and deploy | GitHub Actions on every push and pull request. `main` deploys to GitHub Pages with the official Pages actions. |

These are development tools only. None of them ships to people using colouri.st, which is why they're recorded together in one short ADR rather than assessed one by one (build brief, D-014). Each still states its reason and the alternatives considered.

## Context

CLR-1 sets up the monorepo from D-010 (`packages/engine`, `packages/rules`, `apps/web`), with type checking, linting and tests running in CI on every push, and a placeholder page deployed to GitHub Pages (D-015). The toolchain has to support every automated test tag in `docs/user-stories.md`: `[engine]`, `[property]`, `[schema]`, `[component]`, `[e2e]` and `[a11y]`. It also has to enforce three items in the verification checklist and CLAUDE.md:

- Every public engine function has a docstring and full types `[CI]`.
- "color" in code, "colour" in readable text (D-035).
- Svelte's accessibility warnings fail the build (ADR 0003).

The framework spike (CLR-5) already used npm, Vite 7, TypeScript 5.9, Playwright and `@axe-core/playwright`, so most of this is confirming what worked.

Schema validation for `[schema]` tests is part of the rules schema design (CLR-7) and isn't decided here.

## Choices and alternatives

### Runtime: Node 26 LTS

Node 26 became the Active LTS line on 28 Oct 2026 (26.13.0), and is supported until April 2029. Node 24 moved to maintenance on 20 Oct 2026. Node 26 also runs TypeScript files directly, so small repo scripts (such as the scenario report) need no extra runner like `tsx`.

- **Node 24:** rejected. It's now in maintenance, and starting a new project on it would mean an upgrade within months.

`engines` accepts any Node 26 release, so a contributor a patch or two behind the latest isn't blocked. CI uses the latest 26.

### Language: TypeScript 6.0

TypeScript 7.0, the native rewrite, has been out since July 2026. On 29 Oct 2026, typescript-eslint 8.72 supported TypeScript below 6.1, and svelte-check 4.7 supported 5 and 6. TypeScript 6.0 is the newest version both support. Dependabot will offer 7 when the tools catch up.

- **TypeScript 7.0:** rejected for now. Neither lint nor Svelte checking would run against it.

### Package manager: npm workspaces

npm comes with Node, so contributors install nothing extra, and its workspaces cover three packages comfortably. The spike used it without trouble.

Settings in `.npmrc`:

- `save-exact=true`, so versions only change on purpose.
- `ignore-scripts=true`, so a compromised dependency can't run code on install. Anything that genuinely needs an install script, such as Playwright's browsers, is run as an explicit step.
- `engine-strict=true`, so the wrong Node version fails early.

Alternatives:

- **pnpm:** stricter dependency isolation and faster installs. Rejected for now because it's an extra install for every contributor (Node no longer bundles Corepack), and at three packages its advantages are small. Moving to it later is a lockfile change, not a restructure.
- **Yarn:** no advantage over npm at this size.
- **Bun:** fast, but it's a second runtime, and its Node compatibility is one more thing to check for every tool here.

### Task running: npm scripts, no Turborepo or Nx

`npm run <task> --workspaces --if-present` runs each package's script. A single `npm run check` at the root runs everything CI runs, in the same order.

- **Turborepo or Nx:** caching and task graphs pay off with many packages and slow builds. With three small packages they add configuration, and (with Nx) a substantial dependency, for no real saving. Revisit if CI time becomes a problem.

### Type checking: strict `tsc`, plus `svelte-check`

Every package uses `strict`, `noUncheckedIndexedAccess` and `verbatimModuleSyntax`. `packages/engine` and `packages/rules` are checked with `tsc --noEmit`. `apps/web` is checked with `svelte-check --fail-on-warnings`, which covers both its `.ts` and `.svelte` files and turns Svelte's accessibility warnings into failures (ADR 0003).

Internal packages are used as TypeScript source through their `exports` field, with no build step between them. Vite and Vitest read the source directly. A build for publishing the engine is added when it's first published (CLR-57).

- **TypeScript project references (`tsc -b`):** they need `composite` packages that emit declarations, which is a build step we don't need yet.
- **A build step per package:** slower feedback for no benefit until something is published.

### Tests: Vitest

Vitest uses the same Vite configuration and Svelte plugin as the app, so engine, rules and interface logic are all tested by one runner with one set of conventions. `[component]` tests cover interface logic, which is plain TypeScript (ADR 0003), so they run in Node without a browser or DOM library. Vitest is maintained by the Vite team.

fast-check is the standard property-testing library for JavaScript. It's small and single-purpose, so it's added when the first `[property]` scenario is built, rather than installed unused now.

- **Node's built-in test runner:** no dependency at all, and it can now run TypeScript. Rejected because it can't load `.svelte` files or share the Vite configuration, so interface tests would need a second runner anyway.
- **Jest:** its ESM and TypeScript support still needs extra configuration, and it doesn't share Vite's.
- **Bun test:** depends on Bun as a runtime (see above).

### Linting: ESLint

ESLint is the only linter that covers all three things we need to enforce:

- **Docstrings and types on every export:** `eslint-plugin-jsdoc` (`require-jsdoc` on exports, plus `require-param`, `require-returns` and `require-throws`), and typescript-eslint's `explicit-module-boundary-types`. This is the `[CI]` check from the verification checklist.
- **"color" in identifiers (D-035):** ESLint's built-in `id-match` rule rejects any identifier containing "colour". Comments and language files can still say "colour". No extra package is needed.
- **Svelte files:** `eslint-plugin-svelte`, maintained under the Svelte organisation, lints the markup. Its `svelte/valid-compile` rule is turned on so the compiler's accessibility warnings show as lint errors in the editor, not only in `svelte-check`.

- **Biome:** much faster, and one tool for linting and formatting. Rejected because its Svelte support covers only the script part of `.svelte` files, and it has no equivalent of the JSDoc rules.
- **oxlint:** fast, but it doesn't lint Svelte markup, so it would sit alongside ESLint rather than replace it.

### Formatting: Prettier

Prettier with `prettier-plugin-svelte` formats TypeScript, Svelte, CSS, JSON and YAML. `npm run format:check` runs in CI. Formatting rules stay out of ESLint so the two never conflict.

Markdown and `docs/` are left out. Prettier would realign every table in the decision log and stories, which are written by hand, and the research folders are kept as they were produced (ADR 0003).

- **Biome's formatter:** same Svelte gap as above.
- **dprint:** fast, but needs a plugin per language and has a smaller pool of people who know it.

### Browser and axe tests: Playwright

Playwright runs the same tests in Chromium, Firefox and WebKit, which covers the compatibility checklist (Chrome, Edge, Firefox, Safari) as closely as automation can. `@axe-core/playwright` runs axe inside those tests; both worked in the spike. Playwright can also watch every network request a page makes, which is what the `[e2e: network audit]` privacy checks need.

WebKit on Linux isn't Safari, so the manual VoiceOver and Safari passes (CLR-36) stay in the checklist.

- **Cypress:** heavier, slower in CI, and its WebKit support is still experimental.
- **WebdriverIO:** capable, but more set-up for the same coverage, and the spike's work would be redone.
- **Vitest browser mode:** suits component tests in a browser, which we don't need because interface logic is tested in Node. It doesn't replace end-to-end tests.

Lighthouse (`[e2e: Lighthouse]`) is added with the performance work, not here.

### Gherkin: name tests after scenarios; report gaps

Each automated test is named after its story and scenario, as CLAUDE.md already says. For example, the scenario "Invalid input" in US-01 gets a test named `US-01: Invalid input`, with an optional detail after a dash: `US-01: Invalid input — hue shows dashes`.

A small script, `scripts/scenario-report.ts`, reads every scenario in `docs/user-stories.md`, collects the test names from Vitest and Playwright, and lists any scenario with no test at any level. It runs in CI as a report, not a gate, because almost nothing is built yet. It becomes a gate, failing the build for any untested scenario, before the closed beta starts on 23 November 2026.

Why not run the Gherkin directly:

- **One story, several layers.** Most stories are tested at two or three levels (`[engine]`, `[component]` and `[e2e]` in US-01, for example). playwright-bdd covers only the browser level, so engine scenarios would need a second Gherkin tool such as quickpickle or vitest-cucumber, and the step wording would have to suit both.
- **One source for the stories.** Running Gherkin needs `.feature` files. Either they duplicate `docs/user-stories.md`, and the two drift, or the stories are split out of the document Benji reviews.
- **Step definitions are a second layer of code** to maintain between the scenario and the test, and the scenarios are written for people, so many steps would be one-offs.
- **Traceability is kept anyway.** The naming convention plus the report gives the same "every scenario has a test" check, with no new dependencies.

- **playwright-bdd:** rejected for the reasons above. Worth revisiting if the stories ever move into `.feature` files of their own.
- **quickpickle or vitest-cucumber alongside playwright-bdd:** two Gherkin tools for one set of stories.

### CI and deploy: GitHub Actions and GitHub Pages

One workflow runs on every push and pull request: install, format check, lint, type check, unit tests, build, then Playwright in the three browsers. A second job on `main` deploys the built site with `actions/upload-pages-artifact` and `actions/deploy-pages`, so no build output is ever committed.

- Permissions are read-only by default. Only the deploy job gets `pages: write` and `id-token: write`.
- Third-party actions are pinned to a full commit SHA, with the version in a comment.
- Dependabot opens weekly, grouped updates for npm and for the actions.
- Until the colouri.st domain is set up (cycle 2, D-021), the site is served at `benjigreig.github.io/colourist/`, so the Vite `base` path is set from the build environment. It changes to `/` with the custom domain.

GitHub Pages serves one site per repository, so pull requests don't get their own preview URL. Each pull request's build is attached to its workflow run as a downloadable artifact instead.

- **Netlify or Cloudflare Pages for pull request previews:** rejected by D-015. Revisit there if previews per pull request become important.
- **The older `gh-pages` branch method:** commits build output into the repo history.

## Consequences

- A contributor needs only Node 26: `npm ci`, then `npm run check` runs exactly what CI runs.
- The development dependencies are TypeScript, Vite, the Svelte plugin, svelte-check, Vitest, ESLint (with typescript-eslint, eslint-plugin-svelte and eslint-plugin-jsdoc), Prettier (with prettier-plugin-svelte), Playwright and `@axe-core/playwright`. fast-check follows with the first property test. Exact versions are chosen at set-up and recorded in the lockfile.
- The docstring and "color" rules are enforced by lint, not just code review. The verification checklist's `[CI]` item can be ticked once lint passes on the engine.
- The scenario report makes untested scenarios visible from the first day of building.
- Turning off install scripts may need an exception if a future dependency genuinely requires one. Any exception is documented where it's made.
- These tools are reviewed with the yearly dependency health review (ADR 0003), and any of them can be swapped without touching the engine, rules or views.

## Sources

- [Node.js release schedule](https://github.com/nodejs/Release)
- [GitHub Pages: publishing with a custom GitHub Actions workflow](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
- [playwright-bdd](https://github.com/vitalets/playwright-bdd)
- [eslint-plugin-jsdoc](https://github.com/gajus/eslint-plugin-jsdoc)
