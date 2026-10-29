"""CLR-13: contrast grades and the step-distance rule for candidate ladder presets."""
import math
def Y(L): return ((L+16)/116)**3 if L > 8 else L/903.2962962
def grade(L): return 100*math.log(1.05/(Y(L)+0.05))/math.log(21)
TH = {"3:1": 100*math.log(3)/math.log(21), "4.5:1": 100*math.log(4.5)/math.log(21), "7:1": 100*math.log(7)/math.log(21)}
def rule(Ls):
    g = [grade(L) for L in Ls]; out = {}
    for name, d in TH.items():
        k = next((n for n in range(1, len(g)) if all(g[i+n]-g[i] >= d for i in range(len(g)-n))), None)
        # best case too: fewest steps that reach it anywhere
        best = next((n for n in range(1, len(g)) if any(g[i+n]-g[i] >= d for i in range(len(g)-n))), None)
        out[name] = (k, best)
    return g, out
def show(name, Ls):
    g, r = rule(Ls)
    gaps = [round(b-a,1) for a,b in zip(g,g[1:])]
    print(f"{name} ({len(Ls)} steps)\n  L*:     {Ls}\n  grades: {[round(x) for x in g]}\n  gaps:   {gaps}")
    print("  steps apart, always (fewest anywhere): " + ", ".join(f"{k} {v[0]} ({v[1]})" for k,v in r.items()))
base13 = [98,96,92,86,78,68,57,46,35,25,17,10,5]
show("Current 13", base13)
import sys; sys.stdout.flush()

# Inverse: grade -> L*
def L_from_grade(gr):
    lo, hi = 0.0, 100.0
    for _ in range(60):
        mid = (lo+hi)/2
        if grade(mid) > gr: lo = mid
        else: hi = mid
    return (lo+hi)/2

# Independent: resample the 13-step shape (L* as a smooth function of position) at n points.
def resample(n):
    import numpy as np
    from scipy.interpolate import PchipInterpolator
    f = PchipInterpolator(np.linspace(0,1,13), base13)
    return [round(float(f(t)),1) for t in np.linspace(0,1,n)]

print("\n--- Nested options (11 ⊂ 13 ⊂ 15) ---")
show("Nested 11, drop 96 and 10", [98,92,86,78,68,57,46,35,25,17,5])
show("Nested 11, drop 96 and 17", [98,92,86,78,68,57,46,35,25,10,5])
show("Nested 15, add 51.5 and 40.5 (middle)", [98,96,92,86,78,68,57,51.5,46,40.5,35,25,17,10,5])
show("Nested 15, add 62.5 and 30 (middle-wide)", [98,96,92,86,78,68,62.5,57,46,35,30,25,17,10,5])
print("\n--- Independent options (same shape, resampled) ---")
for n in (11,13,15): show(f"Resampled {n}", resample(n))
