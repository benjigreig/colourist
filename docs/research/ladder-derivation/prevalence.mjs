/**
 * CLR-13: how common each answer is among the 27 design systems (D-056), as a guide to the
 * default recipe. Counts the systems that publish a dark mode, and, in light mode, each use with
 * its own value distinct from the page. These are proxies: systems publish tokens, not uses, and
 * a sunken surface stands in for "overlays". Reads ../ladder-distribution/uses/uses.json.
 */
import { readFileSync } from "node:fs";

const data = JSON.parse(readFileSync(new URL("../ladder-distribution/uses/uses.json", import.meta.url), "utf8"));
const USES = { surface: "cards or panels", sunken: "a second surface layer (overlays)", hover: "hover", pressed: "pressed",
  selected: "selection", borderSubtle: "subtle border", borderStrong: "control border", fill: "fill", textMuted: "muted text" };
let systems = 0, dark = 0; const counts = {};
for (const { modes } of Object.values(data)) {
  systems++; if (modes.dark) dark++;
  const m = modes.light ?? Object.values(modes)[0];
  for (const k of Object.keys(USES)) if (m[k]?.value && m[k].value !== m.page?.value) counts[k] = (counts[k] ?? 0) + 1;
}
console.log(`${systems} systems; ${dark} publish a dark mode`);
console.table(Object.entries(USES).map(([k, label]) => ({ use: label, systems: counts[k] ?? 0 })));
