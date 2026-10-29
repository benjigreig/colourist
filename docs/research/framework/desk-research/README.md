# Framework desk research (CLR-5)

Health measures for the front-end framework candidates, gathered on 28 October 2026 for [ADR 0003](../../../adr/0003-front-end-framework.md).

## How the figures were gathered

- `health.py`: GitHub's public API, for the 12 months to 28 Oct 2026. Stars, licence, releases, commits and active contributors on the default branch, the share of commits by the top contributor, and the bus factor (the fewest people behind half the commits).
- `issues.py`: GitHub search, for issues opened in the same 12 months and how many of those are closed, plus the median time to a first response from someone other than the author, across five issues opened in August and September 2026.
- [OpenSSF Scorecard API](https://api.securityscorecards.dev/): the overall score and selected checks.
- [npm](https://www.npmjs.com/) weekly downloads and [Bundlephobia](https://bundlephobia.com/) runtime sizes.

The response-time samples are small, so treat them as signals rather than measurements. Commit figures cover the default branch only, so work on other branches (such as Solid 2.0) is undercounted.

## Results

| Measure | Svelte | Solid | Vue (core) | Preact | Preact signals | Lit |
|---|---|---|---|---|---|---|
| Stars | 88,503 | 36,187 | 54,802 | 38,961 | 4,504 | 21,868 |
| Licence | MIT | MIT | MIT | MIT | MIT | BSD-3-Clause |
| Releases in 12 months | 98 | 100 | 56 | 24 | 75 | 8 |
| Latest release | svelte@5.57.3 (26 Oct) | solid-js@2.0.0-rc.19 (27 Oct) | v3.6.0-rc.13 (23 Oct) | 11.0.2 (23 Oct) | @preact/signals@2.11.4 (27 Oct) | lit@3.3.3 (14 May) |
| Commits in 12 months | 927 | 104 | 330 | 267 | 224 | 45 |
| Active contributors | 62 | 17 | 24 | 14 | 13 | 21 |
| Top contributor's share | 31% | 50% | 38% | 72% | 71% | 29% |
| Bus factor | 2 | 1 | 2 | 1 | 1 | 3 |
| Issues opened | 625 | 792 | 317 | 49 | 25 | 70 |
| Of those, closed | 67% | 97% | 88% | 92% | 84% | 24% |
| Median first response (sample) | 26.6 hours | 47.3 hours | 305 hours | 69.9 hours | 660 hours | 327 hours |
| OpenSSF Scorecard | 7.6 (19 Oct 2026) | 6.0 (26 Oct 2026) | 6.4 (26 Oct 2026) | 5.5 (26 Oct 2026) | No result | 6.0 (15 Aug 2022) |
| Runtime size, gzip | 10.5 KB | 8.2 KB | 46.2 KB | 4.9 KB | 3.6 KB | 5.9 KB |
| npm downloads a week | 5.9 million | 7.0 million | 15.6 million | 35.0 million | — | 6.3 million |

## Notes

- **Solid:** almost all of the year's issues are reports against the 2.0 release candidate, which is why so many were opened and closed.
- **Preact:** its download count is inflated by other packages that depend on it.
- **Lit:** its Scorecard result is from 2022, and no newer one was available.
- **Svelte:** its runtime size from Bundlephobia is the whole package. A compiled app only ships what it uses.

## Files

- `health.py`, `issues.py`: the scripts used
- `health-preact-signals-lit.json`, `issues-svelte-solid-vue.json`, `issues-preact-signals-lit.json`: their raw output. The raw output of the first `health.py` run, for Svelte, Solid and Vue, was overwritten by the second run. Its figures above were copied from the run's printed output.
