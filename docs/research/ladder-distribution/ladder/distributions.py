"""CLR-13: four ways to distribute 13 steps between L* 98 and 5, and what each gives."""
import math, io, contextlib
with contextlib.redirect_stdout(io.StringIO()): exec(open("ladders.py").read())
n=13
def even_L(): return [round(98-(98-5)*i/(n-1),1) for i in range(n)]
def even_grade():
    g0,g1=grade(98),grade(5); return [round(L_from_grade(g0+(g1-g0)*i/(n-1)),1) for i in range(n)]
def light_weighted():
    # dense near white only: positions follow t^1.6 in grade
    g0,g1=grade(98),grade(5); return [round(L_from_grade(g0+(g1-g0)*(i/(n-1))**1.6),1) for i in range(n)]
for name,Ls in [("Even in lightness (L*)",even_L()),("Even in contrast (grade)",even_grade()),("Dense near white (light mode only)",light_weighted()),("Dense at both ends (today's 13)",base13)]:
    show(name,Ls)
