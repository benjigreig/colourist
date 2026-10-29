"""CLR-13: can a 15-step master ladder yield good 13 and 11-step subsets (nested ladders)?
Brute force over which steps to drop, keeping both ends, minimising "lumpiness": the largest ratio
between neighbouring grade gaps (1 means the spacing changes perfectly smoothly).
Reuses ladders.py. Run: python3 nest_search.py"""
import itertools, io, contextlib
with contextlib.redirect_stdout(io.StringIO()):
    exec(open("ladders.py").read())

def lumpiness(Ls):
    g = [grade(L) for L in Ls]; gaps = [b - a for a, b in zip(g, g[1:])]
    return max(max(a, b) / min(a, b) for a, b in zip(gaps, gaps[1:]))

base15 = resample(15)
print("lumpiness: current 13", round(lumpiness(base13), 2), "| resampled 11", round(lumpiness(resample(11)), 2), "| resampled 15", round(lumpiness(base15), 2))
print("nested 15 (middle)", round(lumpiness([98, 96, 92, 86, 78, 68, 57, 51.5, 46, 40.5, 35, 25, 17, 10, 5]), 2), "| nested 11 drop 96,10", round(lumpiness([98, 92, 86, 78, 68, 57, 46, 35, 25, 17, 5]), 2))
best = None
for drop2 in itertools.combinations(range(1, 14), 2):
    l13 = [L for i, L in enumerate(base15) if i not in drop2]
    for drop2b in itertools.combinations(range(1, 12), 2):
        l11 = [L for i, L in enumerate(l13) if i not in drop2b]
        s = max(lumpiness(l13), lumpiness(l11))
        if best is None or s < best[0]: best = (s, l13, l11)
print("best 15-master nesting: worst lumpiness", round(best[0], 2))
for L in (base15, best[1], best[2]): show("master-derived", L)
