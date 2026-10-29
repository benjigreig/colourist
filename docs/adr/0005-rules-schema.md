# ADR 0005 · Rules schema design

**Date:** 29 Oct 2026 · **Status:** Accepted, with one open question (the validation library) · **Decided by:** Benji Greig · **Plane:** CLR-7 · **Decision log:** D-041 to D-045

## Decision

The method's rules are one versioned JSON file per rules version, validated by a JSON Schema, in `packages/rules`. The engine reads them and never hard-codes a threshold, preset, step or name. The shape below brings together the decisions made on 28 and 29 October 2026:

- **Steps are named by contrast grade** (D-041): 100 × log(1.05 ÷ (Y + 0.05)) ÷ log(21), so the difference between two names gives their WCAG 2 contrast exactly. Grades count towards dark by default (D-042) and are shown as 0 to 100 (D-043).
- **Purpose labels**, such as background, border or text, belong to the semantic tokens, not the steps (D-041).
- **Familiar step names**, such as Tailwind-style and Radix-style, are naming presets (D-041).
- **The AA or AAA target** is one project setting, with per-token overrides (D-044).
- **The app always regenerates on the current rules** and says what changed. Exact reproduction comes from published, pinned packages (D-045).

## Context

D-010 puts the method's business logic in `packages/rules`, as data the engine interprets, so colouri.st's recommendations are simply the default configuration (D-011). Decisions since then add requirements:

- **Names are configuration** (D-025): a colour is a name, a group and a starting value, and the engine attaches no meaning to names.
- **Every rule carries its reasoning,** which the teaching content reuses, and explainer examples come from templates filled with the person's own colours (US-11).
- **Readable text lives in language files** (D-035, CLR-78), which are TypeScript modules in `apps/web/src/lang/`.
- **Projects and share links store only inputs** (D-029, CLR-75).
- **The ladder comes in 11, 13 and 15 steps** (D-005), so steps can't be referred to by position.

Two reference projects shaped the design (`docs/research/reference-projects.md`). Material Color Utilities defines each semantic role by its source, its tone in light and dark, what it sits on and its contrast target, and versions whole specs, but as code. Radix gives each step a stated purpose. The step-naming research (`docs/research/step-naming.md`) led to the contrast grade.

## The shape

| Section | Holds | Used by |
|---|---|---|
| `meta` | Rules version and schema version | Storage, links (D-045) |
| `ladders` | Ladder presets: each step's CIE L\* target and contrast grade, and when each preset is recommended | Stage 2 (US-02) |
| `contrast` | Required grade differences for AA and AAA by use (body text, large text, interface elements), and APCA targets checked alongside | Every check (US-07) |
| `vividness` | Curve presets, and default recovery and ceiling per group | Stage 4 (US-04) |
| `palettePresets` | Named sets of colours, each with a stable ID, a default name, a group and a starting value, such as the default error, warning, success and info | Stage 5 (US-05) |
| `distinctness` | Thresholds between and within groups, including the allowance for the lightest and darkest steps | US-05, US-07 |
| `semantic` | The semantic tokens: each token's purpose label, source colour, contrast grade in light and in dark, what it sits on, its states, and an optional target override | Stage 6 (US-06) |
| `naming` | The token pattern, case and separator; the grade direction; and naming presets for steps | Exports (US-08) |
| `guidance` | Adaptive guidance settings, such as the three-month gap | US-11 |

### Rules that run through every section

- **Every rule has a `reason`:** a key into the language files, not the text itself. The reasoning is written once, translated with everything else, and shown wherever the rule is used. Explainer templates are keys too, with named placeholders the engine fills from the person's project.
- **Colours are referenced by a stable ID,** never by name. Renaming a colour changes only its name, so tokens stay mapped. Removing it leaves them unmapped, which US-06 requires the person to resolve.
- **Semantic tokens name a grade, not a step.** The engine uses the nearest step on the chosen ladder. WCAG 2 is confirmed by the grade difference, and APCA is checked alongside, because it can't be captured in one number per step.
- **Contrast targets are grade differences:** 37 for 3:1, 50 for 4.5:1 and 64 for 7:1. Choosing AAA changes the required difference for body text across the project. Interface elements stay at 37 under either target, because WCAG 1.4.11 has no AAA level.

### An illustrative fragment

This shows the shape, not final values. Preset contents are decided in CLR-3 and CLR-13.

```json
{
  "meta": { "rulesVersion": "1.0.0", "schemaVersion": 1 },
  "semantic": {
    "text.body": {
      "purpose": "text",
      "source": "neutral",
      "grade": { "light": 90, "dark": 8 },
      "on": "surface.default",
      "use": "bodyText",
      "reason": "rules.semantic.textBody.reason"
    }
  }
}
```

### What a project stores

A project, share link or project file stores:
- the rules version and engine version
- the brand colours, and the colours added in stage 5
- only the settings the person changed from the defaults

Everything else is regenerated. On opening an older project, the engine re-applies those changes to the current rules, says which versions the project came from and what has changed in the method since, and flags any changed setting that no longer exists (D-045).

### Versioning promise

The rules and engine use semantic versioning:
- **Patch releases** never change outputs.
- **Minor releases** state exactly what changes.
- **Major releases** can change the method.

Golden tests, which check fixed reference outputs, enforce it. Published versions stay available, so anyone building on the library can pin one (CLR-90).

## Alternatives

- **Rules as code,** as Material does. Rejected by D-010: the method should be readable and changeable as data.
- **YAML instead of JSON.** JSON validates directly against JSON Schema and needs no parser in the browser.
- **Reasoning text inside the rules file.** Rejected: readable text lives in language files (D-035).
- **Steps referred to by position, lightness or contrast target.** Rejected in favour of contrast grades (D-041). See `docs/research/step-naming.md`.
- **A target on every token.** Rejected in favour of one setting with overrides (D-044).
- **Keeping every past rules version in the app.** Rejected in favour of an always-current app and pinnable packages (D-045).

## Consequences

- `packages/rules` holds the JSON Schema, the default rules file, and its tests.
- The engine reads rules and never hard-codes a threshold, preset, step or name.
- Every rule's `reason` key must exist in the language files, checked in CI (US-11, `[schema]`).
- Contrast grades and their rounding live in the engine. Names are rounded for people, and checks always use exact values.
- CLR-13 decides the ladder presets' values, and whether smaller ladders are subsets of larger ones.

## Open question

**The validation library.** ADR 0004 left schema validation to this design. Validation is needed in two places:
- **In tests and CI,** to check the rules file against the schema.
- **In the app,** to check project files and share links, which come from outside and can't be trusted.

Because it runs in the app, the library ships to people using colouri.st. That makes it a substantial dependency, to be assessed under D-014 before it's chosen.
