# colouri.st

A free, open-source guided tool that takes individual designers and small teams from brand colours to a robust, accessible colour system, teaching the colour theory as you go and handing over tokens that are easy to use.

**Status:** in early development. Beta planned for December 2026. A placeholder page is deployed from `main` to [benjigreig.github.io/colourist](https://benjigreig.github.io/colourist/) until the colouri.st domain is set up.

## Why it exists

Brand colours are chosen for logos and campaigns, not for interfaces. A product needs the relationships between them: shades a predictable distance apart, colours that stay distinguishable, contrast that holds for text and borders, and one set of tokens for light and dark. colouri.st builds those relationships in from the first shade, and explains each choice so you can adjust it and defend it. The full case is in the [problem statement](docs/problem-statement.md).

colouri.st runs entirely in your browser. Your colours never leave it, and there's no tracking.

## Repository layout

| Path | What it holds |
|---|---|
| [`packages/engine`](packages/engine) | Pure TypeScript colour maths. No interface or framework code. |
| [`packages/rules`](packages/rules) | The method as versioned, declarative data the engine reads, with the rationale for each rule. |
| [`apps/web`](apps/web) | The guided app. Logic is plain TypeScript; Svelte 5 is used only in the view components. |
| [`scripts`](scripts) | Repo tooling, such as the scenario report. |
| [`docs`](docs) | The master copies of the problem statement, jobs to be done, user stories, decision log and ADRs. |

The layers are explained in decision D-010 in the [decision log](docs/decision-log.md).

## Getting started

You need [Node.js](https://nodejs.org/) 26 or later. The version is in [`.nvmrc`](.nvmrc), so `nvm use` picks it up.

```bash
npm ci
```

```bash
npm run e2e:install
```

The first command installs the dependencies, with install scripts turned off. The second downloads the browsers Playwright tests in, and only needs running once.

Then start the app locally:

```bash
npm run dev --workspace @colourist/web
```

## Scripts

| Command | What it does |
|---|---|
| `npm run check` | Everything CI runs, in the same order. Run it before opening a pull request. |
| `npm run format` / `format:check` | Format with Prettier, or check formatting. |
| `npm run lint` | ESLint, including docstrings on every export and "color" in identifiers. |
| `npm run typecheck` | TypeScript in strict mode, and `svelte-check` for the app. Svelte's accessibility warnings fail it. |
| `npm run test` | Unit and logic tests with Vitest. |
| `npm run build` | Build the static site into `apps/web/dist`. Set `BASE_PATH=/colourist/` to match GitHub Pages. |
| `npm run e2e` | Browser and axe tests with Playwright in Chromium, Firefox and WebKit, against the built site. |
| `npm run scenarios` | List the user story scenarios that don't have a test yet. |

## Dependencies

All of them are development tools; nothing is shipped to people using colouri.st except the Svelte runtime. The reasons for each, and the alternatives considered, are in [ADR 0004](docs/adr/0004-toolchain.md).

- **Build:** TypeScript, Vite, Svelte 5 and its Vite plugin
- **Checks:** svelte-check, ESLint (with typescript-eslint, eslint-plugin-svelte and eslint-plugin-jsdoc), Prettier (with prettier-plugin-svelte)
- **Tests:** Vitest, Playwright, axe-core for Playwright

Any new dependency beyond a small, single-purpose package needs an assessment and an ADR first. See [the assessment process](docs/adr/dependency-assessment.md).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) and the [code of conduct](CODE_OF_CONDUCT.md).

## Licence

Apache 2.0. See [LICENSE](LICENSE) and [NOTICE](NOTICE).
