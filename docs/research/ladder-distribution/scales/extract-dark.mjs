/**
 * CLR-13 needs research: dark-mode scales (Radix, Primer, Spectrum), and the surface steps of
 * Fluent 2, the Australian Government Design System (AGDS), GOV.UK and Material 3.
 * Writes scales-dark.json and surfaces.json.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const nm = "node_modules/";
const hex = (h) => { h = h.replace("#", ""); return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)); };
const rgbStr = (s) => s.match(/[\d.]+/g).slice(0, 3).map(Number);
const out = {};
const add = (system, family, steps) => ((out[system] ??= {})[family] = steps);
const rx = require("@radix-ui/colors");
for (const fam of ["blue", "slate"]) add("Radix dark", fam, Object.entries(rx[fam + "Dark"]).map(([k, v]) => ({ name: k, rgb: hex(v) })));
const pr = JSON.parse(readFileSync(nm + "@primer/primitives/dist/figma/scales/dark.json", "utf8"));
for (const [fam, key] of [["blue", "blue"], ["gray", "neutral"]]) add("GitHub Primer dark", fam, pr.filter((t) => new RegExp(`^base/color/${key}/\\d+$`).test(t.name)).map((t) => ({ name: t.name.split("/").pop(), rgb: [t.value.r, t.value.g, t.value.b].map((x) => Math.round(x * 255)) })));
const sp = JSON.parse(readFileSync(nm + "@adobe/spectrum-tokens/src/color-palette.json", "utf8"));
for (const fam of ["blue", "gray"]) add("Adobe Spectrum dark", fam, Object.keys(sp).filter((k) => new RegExp(`^${fam}-\\d+$`).test(k) && sp[k].sets?.dark).map((k) => ({ name: k, rgb: rgbStr(sp[k].sets.dark.value) })));
writeFileSync("scales-dark.json", JSON.stringify(out, null, 1));
const t = require("@fluentui/tokens");
const pick = (th, re) => Object.entries(t[th]).filter(([k]) => re.test(k)).map(([k, v]) => ({ name: k, rgb: hex(v) }));
const surfaces = {
  "Fluent 2 light surfaces": pick("webLightTheme", /^colorNeutralBackground[1-6]$/),
  "Fluent 2 dark surfaces": pick("webDarkTheme", /^colorNeutralBackground[1-6]$/),
  "AGDS light surfaces": ["#ffffff", "#f5f5f5", "#ebebeb", "#e0e0e0"].map((h, i) => ({ name: ["body", "shade", "bodyAlt", "shadeAlt"][i], rgb: hex(h) })),
  "AGDS brand-coloured ('dark') surfaces": ["#135e70", "#104f5f", "#0d414d", "#0a323c"].map((h, i) => ({ name: ["body", "shade", "bodyAlt", "shadeAlt"][i], rgb: hex(h) })),
  "GOV.UK blue (primary with tints and shades)": Object.entries({ "tint-95": "#f4f8fb", "tint-80": "#d2e2f1", "tint-50": "#8eb8dc", "tint-25": "#5694ca", primary: "#1d70b8", "shade-10": "#1a65a6", "shade-25": "#16548a", "shade-50": "#0f385c" }).map(([k, v]) => ({ name: k, rgb: hex(v) })),
  "Material 3 light surfaces (tones)": [100, 98, 96, 94, 92, 90, 87].map((L) => ({ name: "T" + L, Lstar: L })),
  "Material 3 dark surfaces (tones)": [4, 6, 10, 12, 17, 22, 24].map((L) => ({ name: "T" + L, Lstar: L })),
};
writeFileSync("surfaces.json", JSON.stringify(surfaces, null, 1));
console.log(Object.entries(out).map(([s, f]) => s + " " + Object.entries(f).map(([k, v]) => k + ":" + v.length).join(" ")).join("\n"));
