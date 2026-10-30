/**
 * CLR-94: the colour anatomy of common components, as a reference for building the test pattern.
 *
 * Each component is broken into parts. Each part is an element (text, small text, large text,
 * icon, boundary, fill, surface, indicator) against what it sits on, with the relationship it
 * needs (D-052): legibility, separation, signifier, emphasis, state or distinctness. States are
 * listed per part. The components are the most common in The Component Gallery (40 or more
 * examples across 95 design systems), plus the notification, toast and modal Benji named.
 *
 * The rule agreed with Benji: the pattern shows every relationship the common components contain
 * at least once, not every component. This script de-duplicates the relationships across
 * components and checks which pattern form carries each. Run: node anatomy.mjs
 * Prints the coverage (anatomy.txt) and writes the per-component breakdown to components.md.
 */
import { writeFileSync } from "node:fs";

/** A part: [element, against, relationship, use, states]. */
const COMPONENTS = {
  "Button (filled)": [["fill", "page", "signifier", "fill", ["hover", "pressed", "focus", "disabled"]], ["small text", "fill", "legibility", "label on fill"], ["icon", "fill", "legibility", "label on fill"]],
  "Button (outlined or quiet)": [["boundary", "page", "signifier", "control border", ["hover", "pressed", "focus", "disabled"]], ["small text", "page", "legibility", "accent text"], ["surface", "page", "state", "hover", ["hover", "pressed"]]],
  "Icon button": [["icon", "page", "legibility", "text"], ["surface", "page", "state", "hover", ["hover", "pressed", "focus"]]],
  "Link": [["text", "page", "legibility", "accent text", ["hover", "focus"]], ["text", "text", "distinctness", "accent text against body text"]],
  "Badge or tag": [["fill", "page", "separation", "fill"], ["small text", "fill", "legibility", "label on fill"], ["fill", "tint", "separation", "tint (subtle badge)"], ["small text", "tint", "legibility", "accent text on tint"], ["fill", "fill", "distinctness", "feedback set"]],
  "Notification (alert)": [["surface", "page", "separation", "tint"], ["boundary", "tint", "emphasis", "tint border or edge bar"], ["icon", "tint", "legibility", "accent icon on tint"], ["large text", "tint", "legibility", "text on tint"], ["text", "tint", "legibility", "text on tint"], ["icon", "tint", "legibility", "close button", ["hover", "focus"]], ["surface", "surface", "distinctness", "feedback set"]],
  "Toast": [["surface", "page", "separation", "inverse surface"], ["text", "inverse", "legibility", "inverse text"], ["text", "inverse", "legibility", "accent text on inverse", ["hover", "focus"]], ["icon", "inverse", "legibility", "inverse icon"]],
  "Modal": [["surface", "page", "separation", "scrim over the page"], ["surface", "scrim", "separation", "overlay surface"], ["large text", "overlay", "legibility", "text"], ["text", "overlay", "legibility", "text"], ["fill", "overlay", "signifier", "fill", ["hover", "pressed", "focus"]], ["icon", "overlay", "legibility", "close button", ["hover", "focus"]]],
  "Popover or dropdown menu": [["surface", "surface", "separation", "overlay surface"], ["boundary", "surface", "separation", "subtle border"], ["text", "overlay", "legibility", "text"], ["surface", "overlay", "state", "item hover", ["hover", "selected", "focus"]], ["boundary", "overlay", "separation", "divider"]],
  "Tooltip": [["surface", "page", "separation", "inverse surface"], ["small text", "inverse", "legibility", "inverse text"]],
  "Card": [["surface", "page", "separation", "surface"], ["boundary", "page", "separation", "subtle border"], ["text", "surface", "legibility", "text"], ["text", "surface", "emphasis", "muted text"], ["surface", "page", "state", "interactive card", ["hover", "focus"]]],
  "Accordion": [["text", "surface", "legibility", "text", ["hover", "focus", "expanded"]], ["icon", "surface", "legibility", "chevron"], ["boundary", "surface", "separation", "divider"]],
  "Tabs": [["text", "page", "legibility", "text", ["hover", "focus"]], ["indicator", "page", "state", "selected indicator", ["selected"]], ["text", "text", "emphasis", "selected against unselected label"], ["boundary", "page", "separation", "divider"]],
  "Navigation": [["surface", "page", "separation", "navigation surface"], ["text", "surface", "legibility", "text", ["hover", "focus"]], ["surface", "surface", "state", "selected item", ["selected"]]],
  "Breadcrumbs": [["text", "page", "legibility", "accent text", ["hover", "focus"]], ["icon", "page", "emphasis", "muted separator"], ["text", "page", "emphasis", "muted current page"]],
  "Text input or textarea": [["boundary", "page", "signifier", "control border", ["hover", "focus", "disabled", "error"]], ["text", "page", "legibility", "value text"], ["text", "page", "legibility", "placeholder (muted)"], ["small text", "page", "legibility", "label"], ["text", "page", "legibility", "error message (feedback text)"]],
  "Select": [["boundary", "page", "signifier", "control border", ["hover", "focus", "disabled"]], ["text", "page", "legibility", "value text"], ["icon", "page", "legibility", "chevron"], ["surface", "surface", "separation", "overlay surface"]],
  "Checkbox": [["boundary", "page", "signifier", "control border", ["hover", "focus", "disabled"]], ["fill", "page", "state", "checked fill", ["selected"]], ["icon", "fill", "legibility", "check mark on fill"]],
  "Radio button": [["boundary", "page", "signifier", "control border", ["hover", "focus", "disabled"]], ["indicator", "page", "state", "selected dot", ["selected"]]],
  "Toggle": [["fill", "page", "signifier", "track (off)"], ["fill", "fill", "signifier", "thumb against track"], ["fill", "page", "state", "track (on)", ["selected", "focus", "disabled"]]],
  "Table": [["text", "surface", "legibility", "text"], ["text", "surface", "emphasis", "muted header"], ["boundary", "surface", "separation", "divider"], ["surface", "surface", "separation", "zebra row (sunken)"], ["surface", "surface", "state", "row", ["hover", "selected"]], ["icon", "surface", "legibility", "sort icon"]],
  "List": [["text", "surface", "legibility", "text"], ["boundary", "surface", "separation", "divider"], ["surface", "surface", "state", "item", ["hover", "selected", "focus"]]],
  "Pagination": [["text", "page", "legibility", "accent text", ["hover", "focus", "disabled"]], ["fill", "page", "state", "current page", ["selected"]], ["small text", "fill", "legibility", "label on fill"]],
  "Progress bar": [["fill", "page", "separation", "track"], ["fill", "fill", "legibility", "fill against track"]],
  "Spinner": [["fill", "fill", "legibility", "fill against track"]],
  "Date picker": [["boundary", "page", "signifier", "control border", ["focus"]], ["surface", "surface", "separation", "overlay surface"], ["text", "overlay", "legibility", "day numbers", ["hover", "focus"]], ["boundary", "overlay", "emphasis", "today ring"], ["fill", "overlay", "state", "selected day", ["selected"]], ["small text", "fill", "legibility", "label on fill"], ["surface", "overlay", "state", "selected range (tint)", ["selected"]]],
  "Icon": [["icon", "page", "legibility", "text"]],
};

/** The test pattern's forms (D-055 brief, draft), as the same parts. */
const FORMS = {
  "Text block": [["large text", "page", "legibility"], ["text", "page", "legibility"], ["text", "page", "emphasis"], ["text", "text", "distinctness"], ["boundary", "page", "separation"]],
  "Filled pill": [["fill", "page", "signifier", ["hover", "pressed", "focus", "disabled"]], ["small text", "fill", "legibility"], ["icon", "fill", "legibility"]],
  "Quiet round button": [["icon", "page", "legibility"], ["surface", "page", "state", ["hover", "pressed", "focus"]]],
  "Bordered field, boxes and radios": [["boundary", "page", "signifier", ["hover", "focus", "disabled", "error"]], ["text", "page", "legibility"], ["small text", "page", "legibility"], ["fill", "page", "state", ["selected"]], ["indicator", "page", "state", ["selected"]], ["icon", "fill", "legibility"]],
  "Selection strip": [["indicator", "page", "state", ["selected"]], ["text", "text", "emphasis"], ["surface", "surface", "state", ["selected"]]],
  "Card": [["surface", "page", "separation"], ["boundary", "page", "separation"], ["text", "surface", "legibility"], ["text", "surface", "emphasis"], ["surface", "page", "state", ["hover", "focus"]]],
  "Overlay layer": [["surface", "surface", "separation"], ["boundary", "surface", "separation"], ["text", "overlay", "legibility"], ["surface", "overlay", "state", ["hover", "selected", "focus"]], ["boundary", "overlay", "separation"]],
  "Inverse chip": [["surface", "page", "separation"], ["small text", "inverse", "legibility"], ["text", "inverse", "legibility"]],
  "Status": [["surface", "page", "separation"], ["boundary", "tint", "emphasis"], ["icon", "tint", "legibility"], ["text", "tint", "legibility"], ["fill", "page", "separation"], ["small text", "fill", "legibility"], ["fill", "fill", "distinctness"], ["surface", "surface", "distinctness"]],
  "Border grid": [["text", "surface", "legibility"], ["boundary", "surface", "separation"], ["surface", "surface", "separation"], ["surface", "surface", "state", ["hover", "selected"]]],
  "Track and fill": [["fill", "page", "separation"], ["fill", "fill", "legibility"], ["fill", "fill", "signifier"]],
};

/**
 * The core cluster: a few small parts repeated on each background, as D-052's test pattern varies
 * the surround. Text, a heading, a label, an icon (one muted), a link, a filled pill and a quiet
 * button, with their states, on the page, a card, the overlay, a tint and an inverse chip.
 */
const CORE = (bg) => [["large text", bg, "legibility"], ["text", bg, "legibility", ["hover", "focus", "disabled", "expanded"]],
  ["small text", bg, "legibility"], ["icon", bg, "legibility", ["hover", "focus"]], ["icon", bg, "emphasis"],
  ["fill", bg, "signifier", ["hover", "pressed", "focus", "selected", "disabled"]], ["fill", bg, "state"], ["fill", bg, "separation"],
  ["surface", bg, "state", ["hover", "pressed", "focus", "selected"]], ["boundary", bg, "emphasis"]];
// Coverage with the eleven forms alone, before the clusters and the scrim were added.
const coveredBy = (forms) => { const c = new Set(); for (const parts of Object.values(forms)) for (const q of parts) { c.add(`${q[2]}: ${q[0]} on ${q[1]}`); for (const st of Array.isArray(q[3]) ? q[3] : []) c.add(`state ${st}: ${q[0]} on ${q[1]}`); } return c; };
const elevenOnly = coveredBy(structuredClone(FORMS));
for (const bg of ["page", "surface", "overlay", "tint", "inverse"]) FORMS[`Core cluster on the ${bg}`] = CORE(bg);
FORMS["Overlay layer"].push(["surface", "scrim", "separation"]);
FORMS["Bordered field, boxes and radios"][0][3].push("pressed");

const sig = ([element, against, relationship]) => `${relationship}: ${element} on ${against}`;
const stateSigs = ([element, against, , , states = []]) => states.map((s) => `state ${s}: ${element} on ${against}`);
const formStateSigs = (p) => (Array.isArray(p[3]) ? p[3] : []).map((s) => `state ${s}: ${p[0]} on ${p[1]}`);

const needed = new Map(); // signature → components
for (const [name, parts] of Object.entries(COMPONENTS)) for (const p of parts)
  for (const s of [sig(p), ...stateSigs(p)]) needed.set(s, [...(needed.get(s) ?? []), name]);
const carried = new Map(); // signature → forms
for (const [name, parts] of Object.entries(FORMS)) for (const p of parts)
  for (const s of [sig(p), ...formStateSigs(p)]) carried.set(s, [...(carried.get(s) ?? []), name]);

const rows = [...needed].sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]))
  .map(([s, cs]) => ({ relationship: s, components: cs.length, "carried by": (carried.get(s) ?? ["— GAP —"]).join(", ") }));
console.log(`${Object.keys(COMPONENTS).length} components · ${needed.size} distinct relationships (including states) · ${Object.keys(FORMS).length} forms`);
console.table(rows);
const gaps = rows.filter((r) => r["carried by"] === "— GAP —");
console.log(`With the eleven forms alone: ${[...needed.keys()].filter((k) => elevenOnly.has(k)).length} of ${needed.size} carried.`);
console.log(`Gaps: ${gaps.length ? gaps.map((g) => g.relationship).join("; ") : "none"}`);
const unused = [...carried.keys()].filter((s) => !needed.has(s));
console.log(`In the forms but in no component: ${unused.length ? unused.join("; ") : "none"}`);

// What each background needs, from the components alone: the smallest cluster per background.
console.log("\nWhat the components need on each background:");
const byBg = {};
for (const s of needed.keys()) { const m = s.match(/^(.*): (.*) on (\w+)$/); (byBg[m[3]] ??= new Set()).add(`${m[2]} (${m[1]})`); }
console.table(Object.entries(byBg).map(([bg, set]) => ({ background: bg, parts: set.size, needs: [...set].sort().join("; ") })));

// A readable breakdown of every component, for the research note's reference section (components.md).
const md = ["# Component anatomy: the breakdown", "", "Generated by `anatomy.mjs`. Each part is an element, what it sits on, the relationship it needs (D-052), the use it draws on, and its states.", ""];
for (const [name, parts] of Object.entries(COMPONENTS)) {
  md.push(`## ${name}`, "", "| Element | On | Relationship | Use | States |", "|---|---|---|---|---|");
  for (const [element, against, relationship, use, states = []] of parts) md.push(`| ${element} | ${against} | ${relationship} | ${use} | ${states.join(", ") || "—"} |`);
  md.push("");
}
writeFileSync(new URL("./components.md", import.meta.url), md.join("\n"));
