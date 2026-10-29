/**
 * Shared helpers for the uses research (CLR-13): read CSS custom properties, resolve var() references,
 * parse colours (hex, rgb, hsl, oklch), composite translucent colours over a background, and compute
 * CIE L* and contrast grade (D-041).
 */
export function cssVars(text) {
  const vars = {};
  for (const m of text.matchAll(/(--[\w-]+)\s*:\s*([^;}]+)[;}]/g)) if (!(m[1] in vars)) vars[m[1]] = m[2].trim();
  return vars;
}
export function resolve(value, vars, depth = 0) {
  if (value == null || depth > 20) return value;
  return String(value).replace(/var\((--[\w-]+)(?:\s*,\s*([^)]+))?\)/g, (_, name, fallback) => resolve(vars[name] ?? fallback, vars, depth + 1));
}
const lin = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const unlin = (c) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);
/** Returns {r,g,b,a} with r,g,b in 0..1 (gamma-encoded sRGB), or null. */
export function parseColour(s) {
  if (s == null) return null;
  s = String(s).trim();
  if (/^transparent$/i.test(s)) return { r: 0, g: 0, b: 0, a: 0 };
  let m = s.match(/^#([0-9a-f]{3,8})$/i);
  if (m) {
    let h = m[1];
    if (h.length <= 4) h = [...h].map((c) => c + c).join("");
    const n = (i) => parseInt(h.slice(i, i + 2), 16) / 255;
    return { r: n(0), g: n(2), b: n(4), a: h.length === 8 ? n(6) : 1 };
  }
  m = s.match(/^rgba?\(([^)]+)\)$/i);
  if (m) {
    const p = m[1].split(/[\s,/]+/).filter(Boolean);
    const ch = (x) => (x.endsWith("%") ? parseFloat(x) / 100 : parseFloat(x) / 255);
    return { r: ch(p[0]), g: ch(p[1]), b: ch(p[2]), a: p[3] != null ? (p[3].endsWith("%") ? parseFloat(p[3]) / 100 : parseFloat(p[3])) : 1 };
  }
  m = s.match(/^hsla?\(([^)]+)\)$/i);
  if (m) {
    const p = m[1].split(/[\s,/]+/).filter(Boolean);
    const h = parseFloat(p[0]) / 360, sat = parseFloat(p[1]) / 100, l = parseFloat(p[2]) / 100;
    const f = (n) => { const k = (n + h * 12) % 12; const a = sat * Math.min(l, 1 - l); return l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1)); };
    return { r: f(0), g: f(8), b: f(4), a: p[3] != null ? (p[3].endsWith("%") ? parseFloat(p[3]) / 100 : parseFloat(p[3])) : 1 };
  }
  m = s.match(/^oklch\(([^)]+)\)$/i);
  if (m) {
    const p = m[1].split(/[\s/]+/).filter(Boolean);
    const L = p[0].endsWith("%") ? parseFloat(p[0]) / 100 : parseFloat(p[0]), C = parseFloat(p[1]), H = (parseFloat(p[2]) || 0) * Math.PI / 180;
    const a = C * Math.cos(H), b = C * Math.sin(H);
    const l_ = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3, m_ = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3, s_ = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
    const r = 4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_, g = -1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_, bb = -0.0041960863 * l_ - 0.7034186147 * m_ + 1.707614701 * s_;
    const clip = (x) => unlin(Math.min(1, Math.max(0, x)));
    return { r: clip(r), g: clip(g), b: clip(bb), a: p[3] != null ? (p[3].endsWith("%") ? parseFloat(p[3]) / 100 : parseFloat(p[3])) : 1 };
  }
  return null;
}
/** Composites a translucent colour over an opaque background (in gamma-encoded sRGB, as browsers do). */
export function over(fg, bg) {
  if (!fg || fg.a >= 1) return fg;
  return { r: fg.r * fg.a + bg.r * (1 - fg.a), g: fg.g * fg.a + bg.g * (1 - fg.a), b: fg.b * fg.a + bg.b * (1 - fg.a), a: 1 };
}
export const Y = (c) => 0.2126729 * lin(c.r) + 0.7151522 * lin(c.g) + 0.072175 * lin(c.b);
export const Lstar = (c) => { const y = Y(c); return y > 216 / 24389 ? 116 * Math.cbrt(y) - 16 : y * 24389 / 27; };
export const grade = (c) => 100 * Math.log(1.05 / (Y(c) + 0.05)) / Math.log(21);
export const contrast = (a, b) => { const ya = Y(a), yb = Y(b); return (Math.max(ya, yb) + 0.05) / (Math.min(ya, yb) + 0.05); };
export const toHex = (c) => "#" + [c.r, c.g, c.b].map((x) => Math.round(Math.min(1, Math.max(0, x)) * 255).toString(16).padStart(2, "0")).join("");
