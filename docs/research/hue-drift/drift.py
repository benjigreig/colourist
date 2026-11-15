"""Hue drift on the example brands, for the CLR-14 threshold.

Builds each family the way the method does (D-012, D-047): CIE L* from the default recipe's
AA ladder, OKLCH hue and chroma from the source, chroma reduced only to fit sRGB. Then rounds
to hex, as people will use it, and measures drift two ways:
  - OKLCH: what the engine controls. Hue is held exactly, so drift comes only from hex rounding.
  - CAM16-UCS: an independent appearance model, as a check on perceived drift.
Each reports drift in degrees and as a hue difference (dH) weighted by chroma, because a hue
change at low chroma is far less visible than the same angle at high chroma."""
import math, json, numpy as np, colour  # pip install colour-science numpy (research only, not an app dependency)

LADDER = [100,97.67,96.22,95.03,90.58,89.43,83.74,75.49,68.33,60.82,53.34,49.39,42.37,40.23,34.41,23.21,20.01,18.82,17.06,13.08,6.79]
BRANDS = {
 'Doggly': {'Verdigris':'1b998b','Neon pink':'ff297b','Dusty grape':'53599a','Tangerine dream':'ff9b71'},
 'Kerfwell': {'Brick red':'bb0a21','Air Force blue':'4b88a2','Mono dark':'252627','Mono light':'fff9fb'},
 'Sorrel': {'Pink mist':'d991ba','Sage green':'60992d','Muted olive':'8cae68','Pink orchid':'ebb9df','Petal frost':'f5d5ed'},
}
# CSS Color 4 matrices (as D-047)
M_lin2xyz = np.array([[506752/1228815,87881/245763,12673/70218],[87098/409605,175762/245763,12673/175545],[7918/409605,87881/737289,1001167/1053342]])
M_xyz2lin = np.linalg.inv(M_lin2xyz)
M1 = np.array([[0.8190224379967030,0.3619062600528904,-0.1288737815209879],[0.0329836539323885,0.9292868615863434,0.0361446663506424],[0.0481771893596242,0.2642395317527308,0.6335478284694309]])
M2 = np.array([[0.2104542683093140,0.7936177747023054,-0.0040720430116193],[1.9779985324311684,-2.4285922420485799,0.4505937096174110],[0.0259040424655478,0.7827717124575296,-0.8086757549230774]])
WHITE = np.array([0.3127/0.3290,1.0,(1-0.3127-0.3290)/0.3290])
def to_lin(c): return np.where(c<=0.04045,c/12.92,((c+0.055)/1.055)**2.4)
def from_lin(c): return np.where(c<=0.0031308,12.92*c,1.055*np.sign(c)*np.abs(c)**(1/2.4)-0.055)
def hex2rgb(h): return np.array([int(h[i:i+2],16)/255 for i in (0,2,4)])
def rgb2xyz(rgb): return M_lin2xyz@to_lin(rgb)
def xyz2oklab(x): return M2@np.cbrt(M1@x)
def oklab2xyz(l): return np.linalg.solve(M1,(np.linalg.solve(M2,l))**3)
def lstar(x):
    y=x[1]; f=np.cbrt(y) if y>216/24389 else (24389/27*y+16)/116
    return 116*f-16
def oklch(l): return l[0],math.hypot(l[1],l[2]),math.degrees(math.atan2(l[2],l[1]))%360
def from_lch(L,C,h): return np.array([L,C*math.cos(math.radians(h)),C*math.sin(math.radians(h))])
def solve(Lstar,C,h):
    lo,hi=0.0,1.0
    for _ in range(60):
        m=(lo+hi)/2
        if lstar(oklab2xyz(from_lch(m,C,h)))<Lstar: lo=m
        else: hi=m
    return oklab2xyz(from_lch((lo+hi)/2,C,h))
def in_gamut(x,eps=1e-7):
    r=M_xyz2lin@x; return np.all(r>=-eps) and np.all(r<=1+eps)
def step(Lstar,C,h):
    if in_gamut(solve(Lstar,C,h)): return solve(Lstar,C,h),C
    lo,hi=0.0,C
    for _ in range(50):
        m=(lo+hi)/2
        if in_gamut(solve(Lstar,m,h)): lo=m
        else: hi=m
    return solve(Lstar,lo,h),lo
def tohex(x):
    rgb=np.clip(from_lin(np.clip(M_xyz2lin@x,0,1)),0,1)
    return ''.join(f'{round(v*255):02x}' for v in rgb)
def cam16(hexs):
    """CAM16 colourfulness (M) and hue angle, average surround, 20% background."""
    xyz=np.array([rgb2xyz(hex2rgb(h)) for h in hexs])*100
    spec=colour.XYZ_to_CAM16(xyz, WHITE*100, 64/math.pi*0.2, 20)
    return np.array(spec.M), np.array(spec.h)
def dH(c1,c2,dh_deg):
    """Hue difference weighted by chroma: 2·sqrt(C1·C2)·sin(dh/2), in the units of the chroma given."""
    return 2*math.sqrt(max(c1*c2,0))*math.sin(math.radians(abs(dh_deg))/2)
def hdiff(a,b):
    """Signed difference between two hue angles, in degrees, from -180 to 180."""
    return (a-b+180)%360-180

out={}
for brand,cols in BRANDS.items():
    for name,hx in cols.items():
        src=xyz2oklab(rgb2xyz(hex2rgb(hx))); _,C,h=oklch(src)
        rows=[]
        for L in LADDER[1:]:  # usable steps: everything but the white page
            x,c=step(L,C,h); hx2=tohex(x); o=xyz2oklab(rgb2xyz(hex2rgb(hx2))); _,co,ho=oklch(o)
            rows.append(dict(L=L,hex=hx2,c=c,co=co,ho=ho))
        okdeg=max(abs(hdiff(r['ho'],h)) for r in rows if r['co']>1e-9)
        okdH=max(dH(r['c'],r['co'],hdiff(r['ho'],h)) for r in rows)
        Ms,hs=cam16([r['hex'] for r in rows]); Msrc,hsrc=cam16([hx])
        camdeg=[abs(hdiff(hh,hsrc[0])) for hh in hs]
        camdH=[dH(m,Msrc[0],d) for m,d in zip(Ms,camdeg)]
        # perceived drift among the mid steps (L* 75 to 23), like ADR 0001's 200 to 900
        mid=[i for i,r in enumerate(rows) if 23<=r['L']<=76]
        camspread=max(hs[i] for i in mid)-min(hs[i] for i in mid) if max(hs[i] for i in mid)-min(hs[i] for i in mid)<180 else float('nan')
        out[f'{brand}/{name}']=dict(srcC=round(C,4),srcH=round(h,1),ok_deg=round(okdeg,2),ok_dH=round(okdH,4),
            cam_deg_max=round(max(camdeg),1),cam_mid_spread=round(camspread,1),cam_dH_max=round(max(camdH),2),srcM=round(Msrc[0],1))
for k,v in out.items(): print(f"{k:28} {v}")
json.dump(out,open('drift.json','w'),indent=1)

# Where the largest OKLCH drift in degrees happens, and the chroma there
import sys
for key in ['Kerfwell/Brick red','Doggly/Tangerine dream','Doggly/Neon pink']:
    brand,name=key.split('/'); hx=BRANDS[brand][name]
    src=xyz2oklab(rgb2xyz(hex2rgb(hx))); _,C,h=oklch(src)
    worst=None
    for L in LADDER[1:]:
        x,c=step(L,C,h); hx2=tohex(x); _,co,ho=oklch(xyz2oklab(rgb2xyz(hex2rgb(hx2))))
        d=abs(hdiff(ho,h))
        if worst is None or d>worst[0]: worst=(d,L,c,hx2)
    print(f"{key}: worst {worst[0]:.2f} deg at L* {worst[1]}, chroma {worst[2]:.4f}, #{worst[3]}")
# Degrees allowed by a hue difference of 0.01 and 0.02 (one JND) at a range of chroma
for c in (0.02,0.05,0.10,0.15,0.20,0.25):
    print(c, [round(math.degrees(2*math.asin(t/(2*c))),1) if t<2*c else 'any' for t in (0.01,0.02)])
