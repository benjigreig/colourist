/**
 * Extracts the blue and grey scales of ten design systems from their published npm packages,
 * as sRGB [r, g, b] 0-255 or OKLCH, for the CLR-13 step-distribution research. Writes scales.json.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const nm = "node_modules/";
const hex = (h) => { h = h.replace("#", ""); if (h.length === 3) h = [...h].map((c) => c + c).join(""); return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)); };
const rgbStr = (s) => s.match(/[\d.]+/g).slice(0, 3).map(Number);
const out = {};
const add = (system, family, steps, note) => { (out[system] ??= { note, families: {} }).families[family] = steps; };

// Tailwind v4 (OKLCH)
const tw = readFileSync(nm + "tailwindcss/theme.css", "utf8");
for (const fam of ["blue", "slate"]) add("Tailwind v4", fam, [...tw.matchAll(new RegExp(`--color-${fam}-(\\d+): oklch\\(([\\d.]+)% ([\\d.]+) ([\\d.]+)\\)`, "g"))].map((m) => ({ name: m[1], oklch: [m[2] / 100, +m[3], +m[4]] })), "tailwindcss@4 theme.css");
// Radix
const rx = require("@radix-ui/colors");
for (const fam of ["blue", "slate"]) add("Radix", fam, Object.entries(rx[fam]).map(([k, v]) => ({ name: k.replace(fam, ""), rgb: hex(v) })), "@radix-ui/colors, light scale");
// Carbon
const cb = require("@carbon/colors");
for (const fam of ["blue", "gray"]) add("IBM Carbon", fam, [10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((n) => ({ name: String(n), rgb: hex(cb[fam + n]) })), "@carbon/colors");
// Ant Design
const ant = require("@ant-design/colors");
for (const fam of ["blue", "gray"]) add("Ant Design", fam, ant[fam].slice(0, 10).map((v, i) => ({ name: String(i + 1), rgb: hex(v) })), "@ant-design/colors");
// Open Props
for (const fam of ["blue", "gray"]) add("Open Props", fam, [...readFileSync(nm + `open-props/${fam}.min.css`, "utf8").matchAll(new RegExp(`--${fam}-(\\d+):(#[0-9a-f]+)`, "g"))].map((m) => ({ name: m[1], rgb: hex(m[2]) })), "open-props");
// USWDS (system tokens; 90 may be missing)
for (const fam of ["blue", "gray"]) {
  const s = readFileSync(nm + `@uswds/uswds/packages/uswds-core/src/styles/tokens/color/_${fam}.scss`, "utf8").split('"vivid"')[0].split(/"cool"|"warm"/)[0];
  add("USWDS", fam, [...s.matchAll(/(\d+): (#[0-9a-f]{6})/g)].map((m) => ({ name: m[1], rgb: hex(m[2]) })), "@uswds/uswds system tokens (grade = name)");
}
// Spectrum
const sp = JSON.parse(readFileSync(nm + "@adobe/spectrum-tokens/src/color-palette.json", "utf8"));
for (const fam of ["blue", "gray"]) add("Adobe Spectrum", fam, Object.keys(sp).filter((k) => new RegExp(`^${fam}-\\d+$`).test(k)).sort((a, b) => +a.split("-")[1] - +b.split("-")[1]).map((k) => ({ name: k.split("-")[1], rgb: rgbStr((sp[k].sets?.light ?? sp[k]).value) })), "@adobe/spectrum-tokens, light set");
// Primer
const pr = JSON.parse(readFileSync(nm + "@primer/primitives/dist/figma/scales/light.json", "utf8"));
for (const [fam, key] of [["blue", "blue"], ["gray", "neutral"]]) add("GitHub Primer", fam, pr.filter((t) => new RegExp(`^base/color/${key}/\\d+$`).test(t.name)).map((t) => ({ name: t.name.split("/").pop(), rgb: [t.value.r, t.value.g, t.value.b].map((x) => Math.round(x * 255)) })), "@primer/primitives figma light scale");
// Polaris
const pol = readFileSync(nm + "@shopify/polaris-tokens/dist/esm/src/colors.mjs", "utf8");
for (const [fam, key] of [["blue", "azure"], ["gray", "gray"]]) {
  const block = pol.split(`var ${key} = {`)[1].split("};")[0];
  add("Shopify Polaris", fam, [...block.matchAll(/'?(\d+)'?: 'rgba\(([^)]*)\)'/g)].map((m) => ({ name: m[1], rgb: m[2].split(",").slice(0, 3).map(Number) })), "@shopify/polaris-tokens (azure for blue)");
}
// Atlassian (current palette; Neutral for grey, without pure white and black ends)
const at = require("@atlaskit/tokens/dist/cjs/artifacts/palettes-raw/palette.js").default;
for (const [fam, key] of [["blue", "Blue"], ["gray", "Neutral"]]) add("Atlassian", fam, at.filter((t) => new RegExp(`^color\\.palette\\.${key}\\d+$`).test(t.name) && !/Neutral(0|1200)$/.test(t.name)).map((t) => ({ name: t.name.replace(`color.palette.${key}`, ""), rgb: hex(t.value) })), "@atlaskit/tokens palette");
writeFileSync("scales.json", JSON.stringify(out, null, 1));
for (const [s, v] of Object.entries(out)) console.log(s.padEnd(16), Object.entries(v.families).map(([f, st]) => `${f}:${st.length}`).join(" "));
