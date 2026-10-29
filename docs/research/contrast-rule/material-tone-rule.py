"""CLR-13 Q4: does Material's tone rule ("a tone difference of 50 for small elements, 40 for larger ones",
O'Leary 2022) guarantee WCAG 4.5:1 and 3:1 for every pair? Tone is CIE L*. Finds the worst pair."""
def Y(L): return ((L+16)/116)**3 if L > 8 else L/903.2962962
def ratio(a, b): ya, yb = Y(a), Y(b); return (max(ya, yb)+0.05)/(min(ya, yb)+0.05)
for diff, need in ((50, 4.5), (40, 3.0)):
    worst = min(((ratio(L, L+diff), L) for L in [x/10 for x in range(0, int((100-diff)*10)+1)]))
    print(f"tone difference {diff}: worst ratio {worst[0]:.3f}:1 at tones {worst[1]:.1f} and {worst[1]+diff:.1f} (needs {need}:1) -> {'holds' if worst[0] >= need else 'fails'}")
    # smallest difference that always holds
    d = diff
    while min(ratio(L, L+d) for L in [x/10 for x in range(0, int((100-d)*10)+1)]) < need: d += 0.1
    print(f"   smallest tone difference that always meets {need}:1: {d:.1f}")
