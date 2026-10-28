/**
 * Colour model comparison for CLR-4 (analysis only, not product code).
 *
 * Builds a 13-step shared-lightness ladder for three invented brand sets in
 * three colour models (CIE LCh, OKLCH, HCT), holding each source's hue and
 * chroma and reducing chroma only where needed to stay inside sRGB.
 * Then measures what matters for colouri.st:
 *   - contrast predictability by step distance (WCAG 2, across all families)
 *   - hue stability across the usable range (judged in CAM16 and OKLCH)
 *   - how much chroma the gamut takes away
 *   - how closely the nearest step reproduces each brand colour (ΔE2000)
 */
import Color from "colorjs.io";
import { Hct, argbFromHex, hexFromArgb } from "@material/material-color-utilities";

// Shared ladder in CIE L* (the method's default 13-step values), lightest to darkest.
const LADDER_LSTAR = [98, 96, 92, 86, 78, 68, 57, 46, 35, 25, 17, 10, 5];

// Invented brands only: a pastel stress test, a saturated set, close hues.
const BRANDS = {
  "Pastel (Driftwood)": ["#B8D8E8", "#E8C8B8", "#D8E0B0", "#F0E6D2", "#C9B8D9"],
  "Saturated (Voltline)": ["#0057FF", "#FF3D00", "#00C853", "#FFC400", "#8E24AA"],
  "Close hues (Ember & Clay)": ["#C1663F", "#B5714F", "#D08A5C", "#8C5A45"],
};

/** Reduce chroma on a polar colour until it fits sRGB, keeping L and h. */
function fitByChroma(space, l, c, h) {
  let lo = 0, hi = c;
  let best = new Color(space, [l, 0, h]);
  for (let i = 0; i < 30; i++) {
    const mid = (lo + hi) / 2;
    const col = new Color(space, [l, mid, h]);
    if (col.inGamut("srgb")) { best = col; lo = mid; } else { hi = mid; }
  }
  const full = new Color(space, [l, c, h]);
  return full.inGamut("srgb") ? { col: full, clipped: false } : { col: best, clipped: true };
}

/** OK L equivalent of each L* step, taken from a neutral grey at that L*. */
const LADDER_OKL = LADDER_LSTAR.map((L) => new Color("lch", [L, 0, 0]).to("oklch").coords[0]);

function toHex(col) {
  return col.to("srgb").toGamut().toString({ format: "hex", collapse: false });
}

/** Build one family's scale in the given model. Returns hex strings and clip flags. */
function buildScale(model, sourceHex) {
  const src = new Color(sourceHex);
  const steps = [];
  if (model === "CIE LCh") {
    const [, c, h] = src.to("lch").coords;
    for (const L of LADDER_LSTAR) steps.push(fitByChroma("lch", L, c, h ?? 0));
  } else if (model === "CIE LCh (D65)") {
    // Polar form of CIE Lab with a D65 white, so L* maps exactly to WCAG luminance.
    const [, a, b] = src.to("lab-d65").coords;
    const c = Math.hypot(a, b), h = (Math.atan2(b, a) * 180) / Math.PI;
    for (const L of LADDER_LSTAR) {
      let lo = 0, hi = c, best = null;
      const mk = (cc) => new Color("lab-d65", [L, cc * Math.cos((h * Math.PI) / 180), cc * Math.sin((h * Math.PI) / 180)]);
      if (mk(c).inGamut("srgb")) { steps.push({ col: mk(c), clipped: false }); continue; }
      for (let i = 0; i < 30; i++) { const m = (lo + hi) / 2; if (mk(m).inGamut("srgb")) { best = mk(m); lo = m; } else hi = m; }
      steps.push({ col: best ?? mk(0), clipped: true });
    }
  } else if (model === "Hybrid: L* + OK hue") {
    // Lightness pinned to CIE L* (D65) for exact contrast; hue and chroma held in OKLCH.
    const [, c0, h] = src.to("oklch").coords;
    const lstar = (col) => col.to("lab-d65").coords[0];
    for (const L of LADDER_LSTAR) {
      let c = c0, clipped = false, col;
      for (let pass = 0; pass < 40; pass++) {
        // Solve OK L so that L* hits the target at this chroma.
        let lo = 0, hi = 1;
        for (let i = 0; i < 40; i++) { const m = (lo + hi) / 2; if (lstar(new Color("oklch", [m, c, h ?? 0])) < L) lo = m; else hi = m; }
        col = new Color("oklch", [(lo + hi) / 2, c, h ?? 0]);
        if (col.inGamut("srgb")) break;
        c *= 0.95; clipped = true;
      }
      steps.push({ col, clipped });
    }
  } else if (model === "OKLCH") {
    const [, c, h] = src.to("oklch").coords;
    for (const L of LADDER_OKL) steps.push(fitByChroma("oklch", L, c, h ?? 0));
  } else if (model === "HCT") {
    const s = Hct.fromInt(argbFromHex(sourceHex));
    for (const T of LADDER_LSTAR) {
      const out = Hct.from(s.hue, s.chroma, T);
      steps.push({ col: new Color(hexFromArgb(out.toInt())), clipped: out.chroma < s.chroma - 0.5 });
    }
  }
  return steps.map((s) => ({ hex: toHex(s.col), clipped: s.clipped }));
}

function wcag(a, b) { return new Color(a).contrast(new Color(b), "WCAG21"); }
function cam16Hue(hex) { return Hct.fromInt(argbFromHex(hex)).hue; }
function okHue(hex) { return new Color(hex).to("oklch").coords[2] ?? 0; }
function hueSpread(hues) {
  // Circular range: smallest arc containing all hues.
  const s = [...hues].sort((a, b) => a - b);
  let maxGap = 0;
  for (let i = 0; i < s.length; i++) {
    const gap = (i === s.length - 1 ? s[0] + 360 : s[i + 1]) - s[i];
    maxGap = Math.max(maxGap, gap);
  }
  return 360 - maxGap;
}

const results = {};
for (const model of ["CIE LCh", "CIE LCh (D65)", "OKLCH", "Hybrid: L* + OK hue", "HCT"]) {
  const r = { brands: {} };
  for (const [brand, sources] of Object.entries(BRANDS)) {
    const scales = sources.map((s) => buildScale(model, s));
    // Contrast by step distance, worst case across every pair of families (incl. same family).
    const minByDist = {};
    const maxByDist = {};
    for (const A of scales) for (const B of scales) for (let i = 0; i < 13; i++) for (let j = i + 1; j < 13; j++) {
      const d = j - i;
      const ratio = wcag(A[i].hex, B[j].hex);
      minByDist[d] = Math.min(minByDist[d] ?? Infinity, ratio);
      maxByDist[d] = Math.max(maxByDist[d] ?? 0, ratio);
    }
    const stepsFor = (t) => Number(Object.keys(minByDist).find((d) => minByDist[d] >= t));
    // Hue stability across the usable range (steps 3..10, i.e. 200 to 900).
    const camDrift = scales.map((sc) => hueSpread(sc.slice(3, 11).map((s) => cam16Hue(s.hex))));
    const okDrift = scales.map((sc) => hueSpread(sc.slice(3, 11).map((s) => okHue(s.hex))));
    // Clipping and source fidelity.
    const clipped = scales.flat().filter((s) => s.clipped).length;
    const fidelity = sources.map((src, k) =>
      Math.min(...scales[k].map((s) => new Color(src).deltaE(new Color(s.hex), "2000"))));
    r.brands[brand] = {
      stepsFor3: stepsFor(3), stepsFor45: stepsFor(4.5), stepsFor7: stepsFor(7),
      at7Range: [minByDist[7], maxByDist[7]].map((x) => +x.toFixed(2)),
      camDriftMax: +Math.max(...camDrift).toFixed(1),
      okDriftMax: +Math.max(...okDrift).toFixed(1),
      clippedSteps: `${clipped}/${scales.flat().length}`,
      fidelityMaxDE: +Math.max(...fidelity).toFixed(1),
      scales: scales.map((sc) => sc.map((s) => s.hex)),
    };
  }
  results[model] = r;
}

import { writeFileSync } from "node:fs";
writeFileSync(new URL("./results.json", import.meta.url), JSON.stringify(results, null, 2));
for (const [model, r] of Object.entries(results)) {
  console.log(`\n=== ${model}`);
  for (const [brand, b] of Object.entries(r.brands)) {
    const { scales, ...rest } = b;
    console.log(brand.padEnd(28), JSON.stringify(rest));
  }
}
