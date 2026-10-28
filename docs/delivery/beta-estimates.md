# Beta estimates and capacity

> Snapshot taken 28 October 2026. Plane is the live source for estimates; this records the reasoning at the time. Decisions: D-034, D-036, D-037. Review: CLR-82 (Sun 8 Nov).

## Scale

Custom points in Plane, where **1 point = half a day of work**: 1, 2, 4, 6 and 10. Anything larger than 10 is split. The estimate is the total effort, whoever does it.

## Capacity

- **Benji:** at least 4 hours a week, about 1 point a week, or about 4.5 points to the beta on Fri 27 Nov
- **Claude:** evening build sessions. Not a fixed number, so it's checked against actual pace at the end of cycle 1.

## Totals by cycle

| Cycle | Dates | Points | About how many days |
|---|---|---|---|
| 0–1 | 28 Oct – 8 Nov | 63 | 31 |
| 2 | 9 – 15 Nov | 47 | 23 |
| 3 | 16 – 22 Nov | 45 | 22 |
| 4 | 23 – 27 Nov | 9 | 4 |
| Spanning cycles | | 1 | 0.5 |
| **Total** | | **about 165** | **about 82** |

These totals were taken before CLR-82 (capacity review, 1 point) and CLR-83 (the interface's own tokens, 4 points) were added.

## Benji's share

| Ticket | Total | Benji's share |
|---|---|---|
| CLR-28: content, stages 1 to 5 | 6 | about 2 (skeleton review and final edit) |
| CLR-37: content, stages 6 to 8 | 4 | about 1.5 |
| CLR-38: alpha sessions | 4 | about 3 |
| CLR-64: closed beta invites | 2 | about 1 |
| CLR-10: IP conversation | 1 | 1 |
| CLR-42: go/no-go and launch | 1 | 1 |
| CLR-41: DNS in Dynadot | 1 | about 0.5 |
| CLR-58: send the Myndex email | 1 | about 0.25 |
| CLR-85: first-pass interface mapping, together | — | about 0.5 |
| **Total** | | **about 10.5** |

Review time for stories, ADRs and pull requests isn't counted, so the real figure is a little higher.

## What we did about the gap

- Before the two-pass content approach, Benji's share was about 20 points, four times his capacity.
- Content moved to two passes, with Claude drafting and Benji reviewing (D-034). That brought it to about twice his capacity.
- The alpha keeps its full scope and stays with Benji (D-037).
- No scope or date changes until the end of cycle 1, when the gap is reviewed against actual pace (CLR-82).
