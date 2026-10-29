/**
 * CLR-13 Q1: how translucent overlays behave as interaction states.
 * 1. The grade separation a fixed overlay gives on light and dark backgrounds of different lightness.
 * 2. What black and white overlays do to the hue and chroma of coloured fills, against a solid state that
 *    keeps hue and chroma and only changes lightness.
 */
import { parseColour, over, grade, Lstar } from "../ladder-distribution/uses/lib.mjs";
const lin = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
function oklch(c) {
  const r = lin(c.r), g = lin(c.g), b = lin(c.b);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b), m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b), s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s, A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s, B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  return { L, C: Math.hypot(A, B), H: ((Math.atan2(B, A) * 180) / Math.PI + 360) % 360 };
}
const grey = (L) => { const y = L > 8 ? ((L + 16) / 116) ** 3 : (L * 27) / 24389; const v = y <= 0.0031308 ? 12.92 * y : 1.055 * y ** (1 / 2.4) - 0.055; return { r: v, g: v, b: v, a: 1 }; };
console.log("1. Separation in grades from a fixed overlay of the text colour");
console.log("   background L*   overlay 4%   8%   12%   16%");
for (const [mode, ink, bgs] of [["light", { r: 0, g: 0, b: 0 }, [100, 98, 96, 92]], ["dark", { r: 1, g: 1, b: 1 }, [0, 6, 10, 17, 25]]]) {
  for (const L of bgs) {
    const bg = grey(L);
    const row = [0.04, 0.08, 0.12, 0.16].map((a) => Math.abs(grade(over({ ...ink, a }, bg)) - grade(bg)).toFixed(1).padStart(5));
    console.log(`   ${mode.padEnd(6)} ${String(L).padStart(4)}     ${row.join(" ")}`);
  }
}
console.log("\n2. Coloured fills: an 8% black overlay (light-mode hover) against a solid step with the same grade change");
const fills = { "blue #1B548F": "#1B548F", "green #2E7D32": "#2E7D32", "red #C0392B": "#C0392B", "amber #E8B931": "#E8B931", "purple #6B3FA0": "#6B3FA0" };
for (const [name, hex] of Object.entries(fills)) {
  const f = parseColour(hex), o = over({ r: 0, g: 0, b: 0, a: 0.08 }, f), w = over({ r: 1, g: 1, b: 1, a: 0.12 }, f);
  const a = oklch(f), b = oklch(o), c = oklch(w);
  console.log(`   ${name.padEnd(15)} black 8%: Δgrade ${(grade(o) - grade(f)).toFixed(1)}, chroma ${a.C.toFixed(3)}→${b.C.toFixed(3)} (${(((b.C - a.C) / a.C) * 100).toFixed(0)}%), hue ${(b.H - a.H).toFixed(1)}°   white 12%: Δgrade ${(grade(w) - grade(f)).toFixed(1)}, chroma ${(((c.C - a.C) / a.C) * 100).toFixed(0)}%, hue ${(c.H - a.H).toFixed(1)}°`);
}
