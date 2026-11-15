// APCA Lc at the grade rule's distances on the default ladder (D-073, CLR-17). Research only: 'npm install apca-w3@0.1.9', then 'node grade-rule.mjs'.
// APCA Lc for the grade rule's pairs on the default ladder: greys, plus each example colour's
// step against the light page (white) and the dark page (grade 95), at 37, 50 and 64 grades.
import { APCAcontrast, sRGBtoY } from 'apca-w3';
const LADDER = [[0,100],[2,97.67],[3,96.22],[4,95.03],[8,90.58],[9,89.43],[14,83.74],[22,75.49],[29,68.33],[37,60.82],[45,53.34],[50,49.39],[58,42.37],[61,40.23],[68,34.41],[75,29.0],[81,23.21],[85,20.01],[86,18.82],[88,17.06],[91,13.08],[95,6.79]];
// grey hex at an L*
const yOfL = (L) => (L > 8 ? ((L + 16) / 116) ** 3 : L / (24389 / 27));
const enc = (c) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);
const grey = (L) => { const v = Math.round(enc(yOfL(L)) * 255); return [v, v, v]; };
const lc = (fg, bg) => APCAcontrast(sRGBtoY(fg), sRGBtoY(bg));
const wcag = (a, b) => { const Y = (c) => { const l = c.map((x) => { x /= 255; return x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; }); return 0.2126 * l[0] + 0.7152 * l[1] + 0.0722 * l[2]; }; const [y1, y2] = [Y(a), Y(b)].sort((p, q) => q - p); return (y1 + 0.05) / (y2 + 0.05); };
const step = (g) => LADDER.find(([n]) => n === g);
console.log('Greys: text step against each page, at the grade rule distances');
for (const [label, page, dir] of [['light page (0)', 0, 1], ['dark page (95)', 95, -1]]) {
  for (const d of [37, 50, 64]) {
    const target = page + dir * d;
    // nearest ladder step at least d grades away
    const cand = LADDER.filter(([n]) => dir * (n - page) >= d).sort((a, b) => Math.abs(a[0] - page) - Math.abs(b[0] - page))[0];
    const fg = grey(cand[1]), bg = grey(step(page)[1]);
    console.log(`  ${label}: ${d} grades -> step ${cand[0]}  WCAG ${wcag(fg, bg).toFixed(2)}:1  APCA Lc ${lc(fg, bg).toFixed(1)}`);
  }
}
