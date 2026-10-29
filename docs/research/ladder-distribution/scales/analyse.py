"""CLR-13 research: how ten design systems spread their steps from light to dark.
For each blue and grey scale: CIE L*, contrast grade (D-041), the gaps between steps, how evenly
the steps are spaced in lightness versus in contrast, and how many steps apart reach 3:1 / 4.5:1 / 7:1.
Reads scales.json, writes analysis.json and prints a summary."""
import json, math, statistics as st
def lin(c): c/=255; return c/12.92 if c<=0.04045 else ((c+0.055)/1.055)**2.4
def Y_rgb(rgb): r,g,b=map(lin,rgb); return 0.2126729*r+0.7151522*g+0.0721750*b
def Y_oklch(L,C,h):
    a=C*math.cos(math.radians(h)); b=C*math.sin(math.radians(h))
    l_=L+0.3963377774*a+0.2158037573*b; m_=L-0.1055613458*a-0.0638541728*b; s_=L-0.0894841775*a-1.2914855480*b
    l,m,s=l_**3,m_**3,s_**3
    r=4.0767416621*l-3.3077115913*m+0.2309699292*s; g=-1.2684380046*l+2.6097574011*m-0.3413193965*s; bb=-0.0041960863*l-0.7034186147*m+1.7076147010*s
    return 0.2126729*r+0.7151522*g+0.0721750*bb  # unclipped, so wide-gamut values keep their true luminance
def Lstar(Y): return 116*Y**(1/3)-16 if Y>216/24389 else Y*24389/27
def grade(Y): return 100*math.log(1.05/(Y+0.05))/math.log(21)
TH={"3:1":100*math.log(3)/math.log(21),"4.5:1":100*math.log(4.5)/math.log(21),"7:1":100*math.log(7)/math.log(21)}
def cv(x): return st.pstdev(x)/st.mean(x)
def stepsapart(g,d):
    n=len(g); worst=next((k for k in range(1,n) if all(g[i+k]-g[i]>=d for i in range(n-k))),None)
    best=next((k for k in range(1,n) if any(g[i+k]-g[i]>=d for i in range(n-k))),None); return worst,best
def analyse(steps):
    Ys=[Y_oklch(*s["oklch"]) if "oklch" in s else Y_rgb(s["rgb"]) for s in steps]
    order=sorted(range(len(Ys)),key=lambda i:-Ys[i]); Ys=[Ys[i] for i in order]
    L=[Lstar(y) for y in Ys]; g=[grade(y) for y in Ys]
    dL=[a-b for a,b in zip(L,L[1:])]; dg=[b-a for a,b in zip(g,g[1:])]
    thirds=[sum(1 for x in g if x<33.3),sum(1 for x in g if 33.3<=x<66.7),sum(1 for x in g if x>=66.7)]
    return {"n":len(L),"Lstar":[round(x,1) for x in L],"grade":[round(x,1) for x in g],
        "range_L":[round(L[0],1),round(L[-1],1)],"cv_gap_L":round(cv(dL),2),"cv_gap_grade":round(cv(dg),2),
        "gap_grade_min_max":[round(min(dg),1),round(max(dg),1)],"light_mid_dark_thirds":thirds,
        "steps_apart":{k:stepsapart(g,d) for k,d in TH.items()}}
data=json.load(open("scales.json")); res={}
ours={"colouri.st 13 (option B)":[98,96,92,86,78,68,57,46,35,25,17,10,5]}
for name,Ls in ours.items():
    Ys=[((l+16)/116)**3 for l in Ls]; res[name]={"blue":analyse([{"rgb":None,"Y":y} for y in Ys]) if False else None}
def from_L(Ls):
    Ys=[((l+16)/116)**3 if l>8 else l*27/24389 for l in Ls]
    fake=[{"oklch":None}]*0
    L=[Lstar(y) for y in Ys]; g=[grade(y) for y in Ys]; dL=[a-b for a,b in zip(L,L[1:])]; dg=[b-a for a,b in zip(g,g[1:])]
    return {"n":len(L),"Lstar":Ls,"grade":[round(x,1) for x in g],"range_L":[Ls[0],Ls[-1]],"cv_gap_L":round(cv(dL),2),"cv_gap_grade":round(cv(dg),2),
        "gap_grade_min_max":[round(min(dg),1),round(max(dg),1)],"light_mid_dark_thirds":[sum(1 for x in g if x<33.3),sum(1 for x in g if 33.3<=x<66.7),sum(1 for x in g if x>=66.7)],
        "steps_apart":{k:stepsapart(g,d) for k,d in TH.items()}}
res={"colouri.st 13 (option B)":{"ladder":from_L([98,96,92,86,78,68,57,46,35,25,17,10,5])}}
for sysname,v in data.items():
    res[sysname]={fam:analyse(steps) for fam,steps in v["families"].items() if steps}
json.dump(res,open("analysis.json","w"),indent=1)
print(f"{'system':28}{'n':>3} {'L* range':>12} {'CV gaps L*':>10} {'CV gaps grade':>13} {'grade gap min-max':>17} {'light/mid/dark':>14}  steps apart 3:1, 4.5:1, 7:1 (worst/best)")
for s,fams in res.items():
    for f,a in fams.items():
        sa=" ".join(f"{w}/{b}" for w,b in a["steps_apart"].values())
        print(f"{(s+' '+f):28}{a['n']:>3} {str(a['range_L']):>12} {a['cv_gap_L']:>10} {a['cv_gap_grade']:>13} {str(a['gap_grade_min_max']):>17} {str(a['light_mid_dark_thirds']):>14}  {sa}")
