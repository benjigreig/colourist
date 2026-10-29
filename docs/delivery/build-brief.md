# Build brief: handing the build to Claude Code

> Agreed with Benji Greig, 29 October 2026. Read alongside [CLAUDE.md](../../CLAUDE.md). Plane: project `CLR`.

## Who does what

| Work | Who | Why |
|---|---|---|
| CLR-1: repo scaffold, CI and preview deploy | Claude Code | All repo work |
| CLR-12 to CLR-19: the engine | Claude Code | Code and tests, with the acceptance criteria already written |
| CLR-7: rules schema | Shared. The design is agreed with Benji first and recorded as an ADR; Claude Code builds and validates it | The schema holds the method's decisions, so its shape is a design choice |
| CLR-3 naming presets, CLR-8 reference projects, CLR-9 example brands | Claude (planning sessions) with Benji | Research and content |
| CLR-10: IP conversation | Benji | Only Benji can do it |

## Order

1. CLR-1: scaffold
2. CLR-7: rules schema, once its design ADR is agreed
3. CLR-12: colour conversions and gamut mapping
4. CLR-13 and CLR-14: ladder presets, and scales from several brand colours
5. CLR-15 to CLR-18: vividness, distinctness, contrast checks, similar-hue check
6. CLR-19: the method test suite

## What CLR-1 decides

The development toolchain: package manager and workspaces, test runner, linting and formatting, browser and axe testing, and whether to run the Gherkin scenarios in `docs/user-stories.md` directly as tests or name ordinary tests after them. These are recorded in one short toolchain ADR (0004) rather than a full assessment each. Every choice still states its reason and the alternatives considered (D-014, [dependency-assessment.md](../adr/dependency-assessment.md)).

## How each session runs

1. **Read** the ticket and the stories it serves, then **propose a plan** before writing any code.
2. **Build** to the ticket's acceptance criteria and the story's scenarios, with tests named after them.
3. **Use only decided values.** Thresholds, preset contents and other rule values come from the decision log, the ADRs or the rules. Where one is still undecided, use a clearly marked placeholder and say so.
4. **Ask when something is unclear.** If a story or decision is unclear, stop and ask Benji rather than guessing.
5. **Finish uncommitted,** with a summary of what changed and a suggested commit message. Benji commits and pushes.
6. **Record what was decided.** When a question is answered:
   - **A decision:** a new decision log entry, or an ADR for a bigger one, with the reasoning and the alternatives considered.
   - **A clarification:** an update to the story or acceptance criteria it clarifies.
   - **Either way:** a comment on the Plane ticket. If Plane isn't available, list the comment in the summary for Benji to add.

   The record goes in the same change as the code it explains.

## Reusing the spike

The engine can start from the spike's colour maths in [`docs/research/framework/core/`](../research/framework/core/), since it's our own code. It still has to meet CLR-12's acceptance criteria, including tests against published reference values. The spike folder itself stays as it is, as evidence for ADR 0003.

## First prompt

> Read CLAUDE.md and docs/delivery/build-brief.md, then pick up CLR-1 (scaffold the monorepo, CI and a GitHub Pages preview). Start by proposing the toolchain choices as a draft ADR 0004 and a plan. Don't write any code until I've agreed both.
