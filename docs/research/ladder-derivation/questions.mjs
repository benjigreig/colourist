/**
 * CLR-94: test candidate product questions against the ladder model.
 *
 * Each candidate question, if ticked, adds neutral tokens (or a theme). For every combination
 * of the other answers, this measures what ticking it changes:
 *   - steps the neutral family needs (light and dark may share, model.mjs)
 *   - steps needed in the light background zone (within 15 grades of the light page), where
 *     crowding happens
 * A question whose answer changes little isn't worth asking; one that changes a lot, or adds to
 * the crowded zone, is. Questions that shape colour families rather than greys (charts, status,
 * style) can't be tested here yet and are listed separately.
 */
import { neutral, neutralDark, themeRanges, share } from "./model.mjs";

const BASE = ["page", "subtle border", "muted text", "text"];

/** Candidate structural questions, each a thing the product will have, and the tokens it adds. */
const QUESTIONS = {
  "cards or panels on the page": { tokens: ["surface"] },
  "menus, dialogs or popovers over it": { tokens: ["sunken"] }, // a second surface layer
  "buttons, inputs and other controls": { tokens: ["hover", "pressed", "control border"] },
  "lists or tables people select items in": { tokens: ["selected"] },
  "a dark theme": { theme: "dark" },
  "AAA instead of AA": { level: "aaa" },
};

const subsets = (keys) => keys.reduce((acc, k) => acc.concat(acc.map((s) => [...s, k])), [[]]);

/** Steps needed, and steps in the light background zone, for one set of answers. */
function measure(answers) {
  const level = answers.includes("AAA instead of AA") ? "aaa" : "aa";
  const dark = answers.includes("a dark theme");
  const names = [...BASE, ...answers.flatMap((a) => QUESTIONS[a].tokens ?? [])];
  const pick = (ts) => ts.filter(([n]) => names.includes(n));
  const light = themeRanges("light", pick(neutral(level)));
  const darkR = dark ? themeRanges("dark", pick(neutralDark(level))) : [];
  const steps = light.length + darkR.length - (dark ? share(light, darkR).length : 0);
  const lightZone = light.filter((r) => r.hi <= 15).length;
  return { steps, lightZone };
}

const keys = Object.keys(QUESTIONS);
const rows = keys.map((q) => {
  const others = keys.filter((k) => k !== q);
  const deltas = subsets(others).map((s) => {
    const off = measure(s), on = measure([...s, q]);
    return { steps: on.steps - off.steps, zone: on.lightZone - off.lightZone };
  });
  const avg = (k) => +(deltas.reduce((a, d) => a + d[k], 0) / deltas.length).toFixed(2);
  return { question: q, "extra steps (mean)": avg("steps"), "extra steps (max)": Math.max(...deltas.map((d) => d.steps)),
           "extra steps near the light page (mean)": avg("zone") };
});
console.table(rows);
console.log("All ticked:", measure(keys.filter((k) => k !== "AAA instead of AA")), "· none ticked:", measure([]));
console.log("Not testable with the grey model yet: charts and data; status messages (alerts, badges); brand style (neutral, tinted, vivid); high-contrast theme; bright surroundings; older or low-vision audiences.");
