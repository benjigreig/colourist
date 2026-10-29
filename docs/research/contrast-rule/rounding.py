"""CLR-13 Q4: does a grade rule still hold when people use rounded grade names?
Exact thresholds, the safe difference on rounded names, and failures on colouri.st's ladders
and on every pair of 8-bit greys."""
import math, itertools
def Y(L): return ((L+16)/116)**3 if L > 8 else L/903.2962962
def grade_Y(y): return 100*math.log(1.05/(y+0.05))/math.log(21)
TH = {"3:1": 3, "4.5:1": 4.5, "7:1": 7}
print("Exact grade differences:", {k: round(100*math.log(r)/math.log(21), 2) for k, r in TH.items()})
def check(name, grades):
    fails = []
    for a, b in itertools.combinations(grades, 2):
        d = abs(b - a); rd = abs(round(b) - round(a)); ratio = 21 ** (d / 100)
        for k, r in TH.items():
            stated = {"3:1": 37, "4.5:1": 50, "7:1": 64}[k]
            if rd >= stated and ratio < r: fails.append((k, round(a, 2), round(b, 2), rd, round(ratio, 3)))
    print(f"{name}: {len(fails)} pairs where rounded names meet 37/50/64 but the pair fails", fails[:6])
ladders = {
  "13 (today)": [98,96,92,86,78,68,57,46,35,25,17,10,5],
  "11 (option B)": [98,95.4,89.9,81.4,70.1,57.0,43.8,30.8,20.0,11.2,5.0],
  "15 (option B)": [98,96.4,93.3,88.8,82.8,75.3,66.5,57.0,47.6,38.1,29.1,21.4,14.9,9.2,5.0],
}
for n, Ls in ladders.items(): check(n, [grade_Y(Y(L)) for L in Ls])
# every 8-bit grey: worst case for a hand-applied rule
def lin(c): c /= 255; return c/12.92 if c <= 0.04045 else ((c+0.055)/1.055)**2.4
greys = [grade_Y(lin(v)) for v in range(256)]
for k, r in TH.items():
    for stated in range(30, 75):
        bad = sum(1 for a, b in itertools.combinations(greys, 2) if abs(round(b)-round(a)) >= stated and 21**(abs(b-a)/100) < r)
        if bad == 0: print(f"8-bit greys, {k}: smallest rounded difference that never fails = {stated}"); break
