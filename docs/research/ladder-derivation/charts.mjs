/**
 * CLR-94: what chart palettes need from the ladder.
 *
 * Chart palettes are usually one ordered sequence of distinct hues, sometimes with a lighter and
 * darker version of each, rather than full scales (Benji). For several published categorical
 * palettes this reports each colour's contrast grade (D-041), its contrast against a white page,
 * and, for paired palettes, how far apart each pair is in grades.
 *
 * Sources: Elastic EUI Borealis (light), Atlassian (light and dark), from their npm packages;
 * Tableau 10, ColorBrewer Paired and Set2 from d3-scale-chromatic 3.1.0; Okabe & Ito (2008).
 */
import { parseColour, grade, contrast } from "../ladder-distribution/uses/lib.mjs";

const PALETTES = {
  "Elastic EUI (paired)": { paired: true, colours: "#16C5C0 #A6EDEA #61A2FF #BFDBFF #EE72A6 #FFC7DB #F6726A #FFC9C2 #EAAE01 #FCD883" },
  "Atlassian light": { colours: "#357DE8 #82B536 #BF63F3 #F68909 #1558BC #964AC0 #42B2D7 #BD5B00" },
  "Atlassian dark": { page: "#1F1F21", colours: "#4688EC #94C748 #C97CF4 #FCA700 #1558BC #964AC0 #42B2D7 #E06C00" },
  "Tableau 10": { colours: "#4e79a7 #f28e2c #e15759 #76b7b2 #59a14f #edc949 #af7aa1 #ff9da7 #9c755f #bab0ab" },
  "ColorBrewer Paired": { paired: true, colours: "#a6cee3 #1f78b4 #b2df8a #33a02c #fb9a99 #e31a1c #fdbf6f #ff7f00 #cab2d6 #6a3d9a #ffff99 #b15928" },
  "ColorBrewer Set2": { colours: "#66c2a5 #fc8d62 #8da0cb #e78ac3 #a6d854 #ffd92f #e5c494 #b3b3b3" },
  "Okabe & Ito": { colours: "#E69F00 #56B4E9 #009E73 #F0E442 #0072B2 #D55E00 #CC79A7 #000000" },
};

const rows = [];
for (const [name, p] of Object.entries(PALETTES)) {
  const page = parseColour(p.page ?? "#ffffff");
  const cs = p.colours.split(" ").map(parseColour);
  const g = cs.map((c) => grade(c));
  const ratios = cs.map((c) => contrast(c, page));
  const pairGaps = p.paired ? cs.filter((_, i) => i % 2 === 0).map((_, i) => Math.abs(g[2 * i] - g[2 * i + 1])) : [];
  rows.push({
    palette: name, colours: cs.length,
    "grades (min–max)": `${Math.min(...g).toFixed(0)}–${Math.max(...g).toFixed(0)}`,
    "reach 3:1 on the page": `${ratios.filter((r) => r >= 3).length} of ${cs.length}`,
    "pair gap in grades": pairGaps.length ? `${Math.min(...pairGaps).toFixed(0)}–${Math.max(...pairGaps).toFixed(0)}` : "—",
  });
  console.log(`${name}: grades ${g.map((x) => x.toFixed(0)).join(", ")}`);
}
console.table(rows);
