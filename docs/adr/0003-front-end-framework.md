# ADR 0003 · Front-end framework

**Date:** 29 Oct 2026 · **Status:** Accepted · **Decided by:** Benji Greig · **Plane:** CLR-5 · **Decision log:** D-039

## Decision

The view layer is built in **Svelte 5**, in runes mode, with Vite. State, logic and colour maths stay in plain TypeScript outside it (D-010). The view layer can be replaced without touching them.

## Context

D-014 treats any substantial dependency as an investment, assessed on long-term health, contributor pool, replaceability, accessibility support, static output, bundle size, developer and AI-tooling experience, and licence. Six candidates were assessed on desk research: Svelte 5, Vue 3, Preact with signals, Solid, Lit and framework-free TypeScript. Svelte and Preact were the strongest, so both were spiked.

## Desk research

Figures from GitHub, OpenSSF Scorecard, npm and Bundlephobia, taken on 28 Oct 2026, covering the previous 12 months. Response times come from five issues per project, so they're signals rather than measurements.

| | Svelte 5 | Vue 3 | Preact + signals | Solid | Lit |
|---|---|---|---|---|---|
| Active contributors | 62 | 24 | 14 + 13 | 17 | 21 |
| Bus factor (people behind half the commits) | 2 | 2 | 1 | 1 | 3 |
| Releases | 98 | 56 | 24 + 75 | 100 (mostly 2.0 test releases) | 8 |
| Issue close rate | 67% | 88% | 92% / 84% | 97% | 24% |
| Median first response | 27 hours | 13 days | 3 / 27 days | 2 days | 14 days |
| OpenSSF Scorecard | 7.6 | 6.4 | 5.5 / none | 6.0 | 6.0 (dated 2022) |
| Runtime size (gzip) | about 10.5 KB | 46 KB | 4.9 + 3.6 KB | 8.2 KB | 5.9 KB |
| Licence | MIT | MIT | MIT | MIT | BSD-3 |

Solid is mid-way through a 2.0 release candidate. Vue 3.6 is also a release candidate, and Vue is the heaviest option. Lit's activity has slowed, and shadow DOM still makes some ARIA references between components hard. Framework-free TypeScript has no dependency risk, but would mean writing and maintaining our own rendering and update code for eight interactive stages.

## The spike

Both stages 1 and 2 were built twice: brand colours (add, name, reorder, remove, hex validation with readouts) and the ladder (preset choice and every scale on the ladder). Both builds share one plain-TypeScript core and one stylesheet, and their markup matches element for element, so the comparison is about the framework alone. The code and results are in [`../research/framework/`](../research/framework/).

| Measure | Svelte 5 | Preact + signals |
|---|---|---|
| axe (WCAG 2.1 AA and best practice): on load, invalid input, 14 colours, dark mode, 320 pixels | 0 issues in every state | 0 issues in every state |
| Keyboard: add, type, choose a ladder by arrow keys, remove | All worked | All worked |
| Focus kept while typing, as the ladder re-renders | Yes | Yes |
| Focus after removing a colour | Moved reliably using `tick()` | Moved reliably once `useLayoutEffect` was used. A first attempt with `useEffect` was intermittently lost to the page. |
| Regenerating 14 colours on the 15-step ladder | About 32 ms, two frames | About 32 ms, two frames |
| JavaScript shipped (gzip) | 18.9 KB | 12.5 KB |
| Of which shared core | about 2.5 KB | about 2.5 KB |
| Code to connect the core's store to the framework | None. The core store already meets Svelte's store contract. | A 4-line adapter into a signal |
| View code (non-blank lines) | 136 | 159 |
| Accessibility checks while building | Built into the compiler. It caught 4 of 5 problems in a test file, but missed an unlabelled input, and raised one false positive on a deliberately focusable scrolling table. | None built in. Needs `eslint-plugin-jsx-a11y` set up separately. |
| Type checking | Needs `svelte-check` for `.svelte` files | Plain `tsc` covers everything |
| AI tooling | Official `llms.txt` files and MCP server. Svelte 5 changed its syntax in 2024, so AI tools can produce the older syntax without them. | JSX is widely known by AI tools |

Both builds produced identical pages. Neither made the core change in any way, which confirms the layers in D-010 work.

## Alternatives

- **Preact with signals:** the smallest, and JSX carries over to React, the largest contributor pool. Rejected because it depends on one maintainer (bus factor 1, top contributor 72% of commits), has no security policy, and its focus timing needed more care.
- **Vue 3:** healthy, with good accessibility tooling. Rejected for its size, about four times Svelte's runtime, while 3.6 is a release candidate.
- **Solid:** fast and small. Rejected because building now means building on 1.9 and migrating soon, or building on a moving target.
- **Lit:** the most replaceable, as standard web components. Rejected because activity has slowed, and shadow DOM makes accessible references between components hard, which costs us most as an accessibility-first tool.
- **Framework-free TypeScript:** kept as the fallback. The core is plain TypeScript, so moving to it later would mean rewriting only the views.

## Why Svelte

- **Healthiest project:** the most active contributors, the fastest responses and the best Scorecard of any candidate.
- **Accessibility support while building:** the compiler catches common mistakes before they reach a browser. It doesn't replace axe or manual testing, which stay in the checklist.
- **Cleanest separation:** the core's store works with Svelte directly, with no adapter, and `tick()` makes focus management straightforward.
- **AI tooling:** official `llms.txt` files and an MCP server help AI tools write current Svelte 5.

The extra 6 KB or so over Preact makes no practical difference against the 2-second load target.

## Consequences

- Views are written as `.svelte` files in runes mode. Components stay markup only, and call into the plain-TypeScript core.
- `svelte-check` runs in CI alongside `tsc`.
- The compiler's accessibility warnings are treated as errors in CI. Any deliberate exception needs a `svelte-ignore` comment that explains why.
- axe and the manual keyboard and VoiceOver checks still run, because the compiler misses some problems.
- Svelte's `llms.txt` and MCP server go into the CLAUDE.md for the build.
- SvelteKit isn't adopted yet. Plain Vite gives the static output we need, and SvelteKit can be assessed separately if routing becomes necessary.
- Health is reviewed once a year using the same measures. If Svelte's health falls, the framework-free fallback or Preact is reconsidered.
- Whether to run the Gherkin scenarios directly as tests (for example with playwright-bdd) was also in scope for CLR-5, but is a separate dependency question. It's recorded for the build set-up (CLR-1) rather than decided here.

## Sources

- [OpenSSF Scorecard API](https://api.securityscorecards.dev/)
- [Svelte AI docs and MCP server](https://svelte.dev/docs/ai/mcp)
- [Igalia: Solving cross-root ARIA issues in shadow DOM](https://blogs.igalia.com/mrego/solving-cross-root-aria-issues-in-shadow-dom/)
- [Chromium: Intent to ship Reference Target](https://groups.google.com/a/chromium.org/g/blink-dev/c/eBx3sXIfJnw/m/IxAlT_WJAQAJ)
