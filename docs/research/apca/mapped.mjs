// APCA against WCAG 2 for the default recipe's mapped pairs (D-073, CLR-17). Research only: run with 'npm install apca-w3@0.1.9' then 'node mapped.mjs'.
// APCA and WCAG for the default recipe's mapped pairs (grey family), light and dark themes.
import { APCAcontrast, sRGBtoY } from 'apca-w3';
const L = {0:100,2:97.67,8:90.58,9:89.43,37:60.82,45:53.34,50:49.39,58:42.37,61:40.23,68:34.41,81:23.21,86:18.82,91:13.08,95:6.79};
const yOfL = (l) => (l > 8 ? ((l + 16) / 116) ** 3 : l / (24389 / 27));
const enc = (c) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);
const g = (n) => { const v = Math.round(enc(yOfL(L[n])) * 255); return [v, v, v]; };
const wcag = (a, b) => { const Y = (c) => { const l = c.map((x) => { x /= 255; return x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; }); return 0.2126 * l[0] + 0.7152 * l[1] + 0.0722 * l[2]; }; const [y1, y2] = [Y(a), Y(b)].sort((p, q) => q - p); return (y1 + 0.05) / (y2 + 0.05); };
const rows = [
  ['Light', 'Body text on page', 91, 0, 75], ['Light', 'Muted text on page', 50, 0, 60], ['Light', 'Control border on page', 37, 0, 45],
  ['Light', 'Label (white) on brand fill', 0, 50, 60], ['Light', 'Text on card (2)', 91, 2, 75], ['Light', 'Muted text on card', 50, 2, 60],
  ['Dark', 'Body text on page', 8, 95, 75], ['Dark', 'Muted text on page', 45, 95, 60], ['Dark', 'Control border on page', 58, 95, 45],
  ['Dark', 'Label (white) on brand fill', 0, 50, 60], ['Dark', 'Text on surface (91)', 8, 91, 75], ['Dark', 'Muted text on surface', 45, 91, 60],
];
for (const [t, name, fg, bg, need] of rows) {
  const lc = Math.abs(APCAcontrast(sRGBtoY(g(fg)), sRGBtoY(g(bg))));
  console.log(`${t.padEnd(5)} ${name.padEnd(30)} step ${String(fg).padStart(2)} on ${String(bg).padStart(2)}  WCAG ${wcag(g(fg), g(bg)).toFixed(2).padStart(5)}:1  Lc ${lc.toFixed(1).padStart(5)}  (APCA guide ${need}) ${lc >= need ? 'pass' : 'FAIL'}`);
}
// What step would dark-theme muted text need for Lc 60, and body text for Lc 75?
for (const [need, label] of [[60, 'dark muted text Lc 60'], [75, 'dark body text Lc 75'], [75, 'light body text Lc 75 on white']]) {
  const bg = label.includes('light') ? 0 : 95;
  let best = null;
  for (let l = 100; l >= 0; l -= 0.25) { const v = Math.round(enc(yOfL(l)) * 255); const lc = Math.abs(APCAcontrast(sRGBtoY([v, v, v]), sRGBtoY(g(bg)))); if (lc >= need) { if (bg === 95 ? (best === null || l < best) : (best === null || l > best)) best = l; } }
  const Y = yOfL(best); const grade = 100 * Math.log(1.05 / (Y + 0.05)) / Math.log(21);
  console.log(`${label}: needs L* ${best} (grade ${grade.toFixed(0)})`);
}
