/**
 * Runs every candidate adapter in cand/ against samples.mjs and records:
 * correct pass or fail, whether it threw, whether Object.prototype was polluted,
 * the first errors (for message quality) and median time on a typical project.
 * Usage: node measure.mjs  (writes measure.json)
 */
import { readdirSync, writeFileSync } from "node:fs";
import { validText, cases } from "./samples.mjs";

const files = readdirSync("cand").filter((f) => f.endsWith(".mjs"));
const out = {};
for (const f of files) {
  const mod = await import(`./cand/${f}`);
  const r = { name: mod.name, cases: [] };
  for (const [desc, text, shouldPass] of cases) {
    const before = Object.getOwnPropertyNames(Object.prototype).join();
    const t0 = performance.now();
    let res, threw = null;
    try { res = await mod.validate(text); } catch (e) { threw = String(e.message).slice(0, 160); }
    const ms = performance.now() - t0;
    const polluted = Object.getOwnPropertyNames(Object.prototype).join() !== before || ({}).polluted !== undefined;
    r.cases.push({ desc, expected: shouldPass, ok: res?.ok ?? null, correct: !threw && res?.ok === shouldPass, threw, polluted, ms: Math.round(ms * 10) / 10, errors: res?.errors?.slice(0, 3) ?? [] });
  }
  // Speed: median of 2,000 runs on the valid project.
  const times = [];
  for (let i = 0; i < 2000; i++) { const t = performance.now(); await mod.validate(validText); times.push(performance.now() - t); }
  times.sort((a, b) => a - b);
  r.medianMicroseconds = Math.round(times[1000] * 1000);
  r.correct = r.cases.filter((c) => c.correct).length + "/" + r.cases.length;
  out[f.replace(".mjs", "")] = r;
  console.log(f.padEnd(28), r.correct, `${r.medianMicroseconds}µs`, r.cases.filter((c) => !c.correct).map((c) => c.desc + (c.threw ? " [threw]" : "")).join("; "));
}
writeFileSync("measure.json", JSON.stringify(out, null, 1));
