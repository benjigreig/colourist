# ADR 0006 · Validation library

**Date:** 29 Oct 2026 · **Status:** Accepted · **Decided by:** Benji Greig · **Plane:** CLR-7 · **Decision log:** D-046 · **Evidence:** [`../research/validation/`](../research/validation/)

## Decision

The schemas are written first, in JSON Schema (draft 2020-12), not generated from code. [Ajv](https://ajv.js.org/) is a **dev dependency only**:

- **In tests and CI,** Ajv checks the rules file against its schema in strict mode, which also catches mistakes in the schema itself.
- **At build time,** Ajv turns the project and share-link schemas into plain JavaScript. That generated code is what ships to people using colouri.st: about 2.8 KB compressed, with nothing compiled in the browser.

**The generated validator is committed to the repo,** so each schema change shows up as a readable change to the code that actually ships:
- The build step formats the output with Prettier, because Ajv writes it as one long line.
- The file starts with a "generated, don't edit" header.
- CI regenerates it and fails if it differs from the committed copy.
- If two branches both change it, the fix is to regenerate it, not to merge it by hand.

**The app checks untrusted input through one function of our own,** which returns `{ok, value, issues}`. Each issue has a location and a rule name. The messages people see come from the language files (D-035). Because the library sits behind this one function, replacing it means changing a dependency, not rewriting the app.

**Some safety rules don't depend on the library:**
- Cap the input's size before reading it. Around 64 KB is likely; CLR-75 confirms the figure.
- Reject unknown properties at every level.
- Never copy parsed input into other objects. The engine reads only the fields it knows.

**A second implementation checks Ajv's work in CI.** [@hyperjump/json-schema](https://github.com/hyperjump-io/json-schema), written by one of the JSON Schema spec's authors, runs the same test inputs as a dev dependency only. If the two ever disagree, that's a bug to investigate.

**TypeScript types are written by hand.** Ajv's `JSONSchemaType` makes the compiler check that the types and the schema agree. In the spike, it caught a deliberate mismatch, though union types need a workaround (`types-check.ts`).

## Context

ADR 0005 left the validation library open. Validation is needed in two places:
- **In tests and CI,** for the rules file, which we write.
- **In the app,** for project files and share links, which come from outside and can't be trusted (D-029, CLR-75).

The app runs under a strict content security policy (no `unsafe-eval`), and it has no server to check anything for it. Anything that runs in the app ships to everyone using colouri.st, so this is a substantial dependency under D-014. We assessed it using [the dependency process](dependency-assessment.md).

## Approaches

- **Schema-first:** write JSON Schema, and validate with a JSON Schema library. The schema is the standard: it can be published with the library (D-045), editors can autocomplete from it, and it works in any language.
- **Code-first:** write the schema in TypeScript with Zod, Valibot, TypeBox or ArkType, and export JSON Schema from it.
- **Precompiled:** use a schema-first library at build time to generate plain JavaScript, so no library ships at all. Only Ajv and schemasafe can do this.

## Desk research

The figures cover the 12 months to 29 Oct 2026. All the options are MIT-licensed. The raw data is in [`../research/validation/desk-research/`](../research/validation/desk-research/).

| Library | Contributors | Bus factor (share of commits) | Releases | Issues closed | Scorecard | Weekly downloads | Dependencies |
|---|---|---|---|---|---|---|---|
| ajv | 4 | 1 (64%) | 4 | 18% | 4.8 (Maintained 0) | 427M | 4 |
| @cfworker/json-schema | 1 | 1 | 0, last Jan 2025 | 0% | 3.7 | 11.5M | 0 |
| @hyperjump/json-schema | 13 | 1 (59%) | 11 | 72% | none | 371k | 9 |
| @exodus/schemasafe | inactive | — | last Aug 2023 | — | 3.8 | 5.3M | 0 |
| json-schema-library | 12 | 1 (76%) | 38 | 97% | 4.1 | 653k | 9 |
| jsonschema | 1 | 1 | 0 | — | 3.1 | 6.9M | 0 |
| typebox (1.x) | 11 | 1 (94%) | 140 | 94% | 5.0 | 13.8M | 0 |
| zod | 27 | 1 (80%) | 27 | 80% | 5.1 | 371M | 0 |
| valibot | very active | not available | 7 | 39% | none | 26.4M | 0 |
| arktype | 40 | 2 (40%) | 13 | 49% | none | 2.9M | 3 |

The bus factor is the fewest people behind half the commits.

## Spike results

Every candidate validated the same spike project schema against 14 inputs:
- a valid project
- invalid ones: a bad hex value, a missing field, an unknown property, wrong types
- hostile ones:
  - `__proto__` and `constructor` keys
  - 10,000 levels of nesting
  - 100,000 colours
  - a 1 MB name
  - 201 overrides
  - a badly formed setting name

The candidates were bundled with the app's toolchain (Vite 8.3.5, TypeScript 6.0.3) and loaded under the app's security policy in Chromium, Firefox and WebKit.

| Option | Official test suite (2020-12) | Compressed size | Strict security policy (all 3 browsers) | Inputs handled correctly |
|---|---|---|---|---|
| **Ajv, precompiled** | 95.2% | **2.8 KB** | ✅ | **14/14** |
| schemasafe, precompiled | 92.7% | 1.5 KB | ✅ | 14/14 |
| Valibot | n/a | 2.7 KB | ✅ | 13/14\* |
| @cfworker/json-schema | 95.8% | 6.5 KB | ✅ | 14/14 |
| @hyperjump/json-schema | 97.8% | 16 KB | ✅ | 13/14 (crashes on deep nesting) |
| Zod (no code generation) | n/a | 28 KB | ✅ | 13/14\* |
| json-schema-library | 98.9% | 34 KB | ✅ | 13/14 (crashes on deep nesting) |
| TypeBox | n/a | 39 KB | ✅ | 14/14 |
| Ajv, compiled in the browser | 95.2% | 41 KB | ❌ blocked: needs `unsafe-eval` | 14/14 |
| ArkType (no code generation) | n/a | 51 KB | ⚠️ works, but logs a violation on every load | 11/14 |

\*These silently drop a `__proto__` key rather than rejecting the input. That's safe, but only if we use their output and never the original input.

**What else we found:**
- **Code-first exports lose rules.**
  - Zod, Valibot and ArkType all dropped the 200-override limit when exporting JSON Schema.
  - ArkType's export also accepted badly named settings.
  - TypeBox's export was exact.
- **Some libraries count inherited object properties as present.** Ajv and cfworker fail the official tests for `required` properties named after built-in JavaScript properties, such as `toString`. Our schemas never require such names, and they reject unknown properties, so every hostile input was still rejected. The schema rule below keeps it that way.
- **Speed doesn't separate the options.** Every one checks a normal project in a few millionths of a second. On a 100,000-colour file, TypeBox took 1.2 seconds and cfworker about 0.4. The size cap prevents that.

## Why Ajv, precompiled

- It's the only actively released option that works under the strict policy and adds almost nothing to the download.
- It follows the standard well. Its failures in the official suite are in `$dynamicRef` and `unevaluatedItems`, which we won't use.
- Ajv's project health is weak, but that matters less here:
  - Nothing of Ajv runs in the browser.
  - The second implementation checks its results in CI.
  - At 427 million downloads a week, it's among the most-used and most-scrutinised packages on npm.
  - If it stops being maintained, cfworker can take over at runtime. Because the schema is standard, switching means changing a dependency, not code.

## Alternatives

- **Zod, Valibot, ArkType:** their exported schemas say less than their code does. ArkType also logs a security-policy violation on every load. Valibot is the best of the code-first options, and was the closest call.
- **TypeBox:** exact JSON Schema, but 39 KB, slow on huge input, and its package was recently renamed, which means migration work.
- **Ajv compiled in the browser:** needs `unsafe-eval`.
- **cfworker, hyperjump and json-schema-library at runtime:**
  - They're 2 to 12 times the size of the precompiled code.
  - cfworker has one maintainer and no release since January 2025.
  - The other two have 9 dependencies each, and crash on deep nesting.
- **schemasafe, precompiled:** smallest, but no release since 2023.
- **jsonschema:** 81.3% on the official suite, and inactive.
- **A hand-written validator:** it would duplicate the schema and drift from it. Precompiling gives us the same result, generated from the schema.

## Consequences

- `packages/rules` holds:
  - the schemas
  - a build step that generates and formats the validators
  - the committed generated code
  - the shared test inputs from the spike
- **Schema rules:**
  - Use draft 2020-12, in Ajv strict mode.
  - Set `additionalProperties: false` everywhere.
  - Don't use `$dynamicRef` or `unevaluated*`.
  - Never `require` a property whose name is a built-in JavaScript property.
- **CI checks:**
  - the inputs through both Ajv and hyperjump
  - the generated code is up to date
  - the types agree with the schema
  - the strict-policy check in Chromium, Firefox and WebKit
- **Firefox on macOS 27:** the spike's browser check uses the same Firefox workaround as `playwright.config.ts`. Remove both together once Playwright 1.65 is installed.
- **Review:** check Ajv's health every October, and before taking any major version.
