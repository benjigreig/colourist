# Validation library spike

Evidence for [ADR 0006](../../adr/0006-validation-library.md) (CLR-7, D-046), produced on 29 October 2026. This folder isn't part of the app, and it's kept as it was produced.

## What's here

| File | What it is |
|---|---|
| `project.schema.json` | The spike project schema (JSON Schema 2020-12). Not the final schema. |
| `samples.mjs` | The 14 test inputs: valid, invalid and hostile. |
| `cand/` | One adapter per candidate, each exporting `validate(text)`. |
| `gen.mjs`, `gen/` | The build-time step that precompiles the schema with Ajv and schemasafe, and its output. |
| `compliance.mjs`, `compliance.json` | Each JSON Schema library against the official test suite (draft 2020-12, required tests). |
| `measure.mjs`, `measure.json` | Each candidate against the test inputs: correct, threw, polluted, errors and speed. |
| `bundle.mjs`, `vite-one.mjs`, `bundle.json` | Browser bundle sizes. hyperjump is built with Vite, because esbuild alone can't resolve its browser entry. |
| `csp-check.mjs`, `csp/`, `csp.json` | Each bundle loaded under the app's security policy in Chromium, Firefox and WebKit. |
| `export-check.mjs`, `exported/`, `export.json` | The code-first libraries' JSON Schema exports, checked against the same inputs. |
| `types-check.ts` | Ajv's `JSONSchemaType` checking a hand-written type against the schema. |
| `deps.json` | Each library's dependencies and installed size. |
| `proto-check.mjs`, `failed.mjs` | Diagnostics for the `__proto__` and `required` findings. |
| `desk-research/` | Raw GitHub, OpenSSF Scorecard and npm data, and the scripts that fetched it. |

## Rerunning it

The browser check uses the Playwright install at the repo root, so run `npm run e2e:install` there first. Then, in this folder:

```bash
npm install
npm run suite
npm run compliance
npm run gen
npm run measure
npm run bundle
npm run csp
npm run export
npm run types
```

`npm run bundle` prints esbuild errors for hyperjump before rebuilding it with Vite. That's expected.
