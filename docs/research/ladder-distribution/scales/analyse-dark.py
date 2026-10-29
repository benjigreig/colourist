"""CLR-13 needs research: shapes of dark-mode scales and the surface steps of several systems.
Reads scales-dark.json and surfaces.json (from extract-dark.mjs); reuses analyse.py's maths."""
import json, io, contextlib
with contextlib.redirect_stdout(io.StringIO()): exec(open("analyse.py").read())
res = {}
for system, fams in json.load(open("scales-dark.json")).items():
    for fam, steps in fams.items():
        a = analyse(steps); res[f"{system} {fam}"] = a
        print(f"{system} {fam}: n={a['n']} L* light→dark {a['Lstar']}\n   CV gaps L* {a['cv_gap_L']}  thirds light/mid/dark {a['light_mid_dark_thirds']}  steps apart {a['steps_apart']}")
print()
for name, steps in json.load(open("surfaces.json")).items():
    Ls = [x["Lstar"] if "Lstar" in x else Lstar(Y_rgb(x["rgb"])) for x in steps]
    gaps = [round(abs(a - b), 1) for a, b in zip(Ls, Ls[1:])]
    res[name] = {"Lstar": [round(x, 1) for x in Ls], "gaps": gaps}
    print(f"{name}: L* {[round(x,1) for x in Ls]}  gaps {gaps}")
json.dump(res, open("analysis-dark.json", "w"), indent=1)
