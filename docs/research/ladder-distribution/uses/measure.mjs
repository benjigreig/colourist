/**
 * CLR-13 uses research: how far apart each use sits from the page, per system and mode.
 * Translucent colours are composited over the page (and the page over white or black).
 * Surfaces and states are measured as a CIE L* difference; borders, fills and text as a WCAG 2 contrast ratio.
 * Writes separations.json and prints a summary by use and mode group.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { parseColour, over, Lstar, contrast, toHex } from "./lib.mjs";
const data = JSON.parse(readFileSync("uses.json", "utf8"));
const AREA = ["surface", "sunken", "hover", "pressed", "selected"], LINE = ["borderSubtle", "borderStrong", "fill", "text", "textMuted"];
const rows = [];
for (const [system, { modes }] of Object.entries(data)) for (const [mode, uses] of Object.entries(modes)) {
  if (mode.includes("(g10)") || mode.includes("(g90)")) continue; // one theme per mode per system: Carbon white and g100
  const dark = mode.startsWith("dark"), group = mode.includes("high contrast") ? (dark ? "dark, high contrast" : "light, high contrast") : dark ? "dark" : "light";
  const base = dark ? { r: 0, g: 0, b: 0, a: 1 } : { r: 1, g: 1, b: 1, a: 1 };
  const page = over(parseColour(uses.page?.value), base);
  if (!page) continue;
  const row = { system, mode, group, page: { hex: toHex(page), L: +Lstar(page).toFixed(1) } };
  for (const u of [...AREA, ...LINE]) {
    const c = parseColour(uses[u]?.value); if (!c) continue;
    const col = over(c, page);
    row[u] = { hex: toHex(col), L: +Lstar(col).toFixed(1), dL: +Math.abs(Lstar(col) - Lstar(page)).toFixed(1), ratio: +contrast(col, page).toFixed(2), dir: Lstar(col) > Lstar(page) ? "lighter" : "darker" };
  }
  rows.push(row);
}
writeFileSync("separations.json", JSON.stringify(rows, null, 1));
const stat = (xs) => { xs = xs.filter((x) => x != null).sort((a, b) => a - b); if (!xs.length) return "—"; const q = (p) => xs[Math.round(p * (xs.length - 1))]; return `${q(0.5)} (${xs[0]}–${xs[xs.length - 1]}, n=${xs.length})`; };
for (const g of ["light", "dark", "light, high contrast", "dark, high contrast"]) {
  const rs = rows.filter((r) => r.group === g);
  console.log(`\n== ${g} (${new Set(rs.map((r) => r.system)).size} systems) — page L* ${stat(rs.map((r) => r.page.L))}`);
  for (const u of AREA) console.log(`  ${u.padEnd(13)} ΔL* from page  ${stat(rs.map((r) => r[u]?.dL))}   lighter: ${rs.filter((r) => r[u]?.dir === "lighter").length}`);
  for (const u of LINE) console.log(`  ${u.padEnd(13)} contrast      ${stat(rs.map((r) => r[u]?.ratio))}`);
}
