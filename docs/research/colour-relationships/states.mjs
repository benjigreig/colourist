/**
 * CLR-13 Q1: how each system makes its neutral interaction states (hover, pressed, selected):
 * as solid colours (ladder steps) or translucent overlays. Reads uses.json.
 */
import { readFileSync } from "node:fs";
import { parseColour } from "../ladder-distribution/uses/lib.mjs";
const data = JSON.parse(readFileSync(new URL("../ladder-distribution/uses/uses.json", import.meta.url), "utf8"));
const out = [];
for (const [system, { modes }] of Object.entries(data)) {
  const m = modes.light ?? Object.values(modes)[0];
  const kind = (u) => { const c = parseColour(m[u]?.value); return !c ? "—" : c.a < 1 ? `overlay ${Math.round(c.a * 100)}%` : "solid"; };
  out.push({ system, hover: kind("hover"), pressed: kind("pressed"), selected: kind("selected"), subtleBorder: kind("borderSubtle") });
}
console.table(out);
const count = (k) => out.reduce((a, r) => { const v = r[k].startsWith("overlay") ? "overlay" : r[k]; a[v] = (a[v] ?? 0) + 1; return a; }, {});
console.log("hover", count("hover"), "pressed", count("pressed"), "selected", count("selected"), "subtle border", count("subtleBorder"));
