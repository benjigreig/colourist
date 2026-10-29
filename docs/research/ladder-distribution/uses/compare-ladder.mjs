/**
 * CLR-13: compares where each use sits in practice (median grade distance from the page, across systems)
 * with where colouri.st's 13-step ladder puts its steps, counting from the lightest step in light mode
 * and from the darkest step in dark mode.
 */
import { readFileSync } from "node:fs";
const rows = JSON.parse(readFileSync("separations.json", "utf8"));
const ladder = [2, 3, 7, 12, 19, 29, 41, 54, 67, 79, 88, 93, 97]; // grades of L* 98 … 5
const g = (r) => 100 * Math.log(r) / Math.log(21);
const median = (xs) => { xs = xs.filter((x) => x != null).sort((a, b) => a - b); return xs[Math.round((xs.length - 1) * 0.5)]; };
const uses = ["surface", "hover", "pressed", "borderSubtle", "borderStrong", "fill", "textMuted", "text"];
for (const mode of ["light", "dark"]) {
  const rs = rows.filter((r) => r.group === mode);
  const steps = mode === "light" ? ladder.map((x) => x - ladder[0]) : ladder.map((x) => ladder[12] - x).reverse();
  console.log(`\n${mode}: ladder steps as grade distances from the page step: ${steps.map((x) => x.toFixed(0)).join(", ")}`);
  for (const u of uses) {
    const m = median(rs.map((r) => (r[u] ? g(r[u].ratio) : null)));
    const near = steps.reduce((b, s, i) => (Math.abs(s - m) < Math.abs(steps[b] - m) ? i : b), 0);
    console.log(`  ${u.padEnd(13)} practice ${m.toFixed(1).padStart(5)}  nearest step ${near} at ${steps[near].toFixed(0).padStart(3)}  off by ${(steps[near] - m).toFixed(1)}`);
  }
}
