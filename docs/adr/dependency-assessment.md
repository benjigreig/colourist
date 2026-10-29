# How to assess a substantial dependency

D-014 treats any framework or library beyond a simple single-purpose package as an investment. This is the process, first used for the front-end framework ([ADR 0003](0003-front-end-framework.md)). Copy it for the next one.

## 1. Frame the question

Write down what the dependency is for, which layer it sits in (D-010), and what we'd do without it. Doing without it is always one of the candidates.

## 2. Desk research on every candidate

Measure each candidate over the last 12 months:

| Area | Measures | Where from |
|---|---|---|
| Long-term health | Active contributors, bus factor (fewest people behind half the commits), release cadence, issue close rate, median time to first response | GitHub API (see [`../research/framework/desk-research/`](../research/framework/desk-research/) for scripts) |
| Security practice | OpenSSF Scorecard overall score, plus Maintained, Code-Review, Security-Policy and Vulnerabilities | [OpenSSF Scorecard API](https://api.securityscorecards.dev/) |
| Contributor pool | How many people already know it, and npm downloads, noting when they're inflated by other packages | npm, ecosystem knowledge |
| Replaceability | How far it reaches beyond its own layer, and what replacing it would mean | The candidate's docs, and the spike |
| Fit | Accessibility support, static output (D-009), size, performance, developer and AI-tooling experience | Docs, Bundlephobia, the spike |
| Licence | Compatible with Apache 2.0, and any conditions | The licence file |

Record the date of every figure, and say plainly when a sample is too small to be more than a signal.

## 3. Spike the strongest two

Build the same small, real slice in each. Share everything that isn't the dependency (logic, styles, test data), so the comparison is about the dependency alone. Measure the same things the same way, with a script, and keep the code and results under `docs/research/<topic>/`.

## 4. Write the ADR

Record the decision, the context, the desk research, the spike results, every alternative with the reason it was rejected, and the consequences. That includes how and when its health will be reviewed. Set the status to "Proposed" until Benji approves it.

## 5. Log it

Once it's approved, add the decision to the decision log, link the ADR and the Plane ticket, and keep all the research, including the options that weren't chosen.
