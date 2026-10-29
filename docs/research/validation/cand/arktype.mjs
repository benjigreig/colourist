/** ArkType, code-first, with its just-in-time compiler turned off (jitless). */
import { configure } from "arktype/config";
configure({ jitless: true });
const { type } = await import("arktype");
const Colour = type({ "+": "reject", id: /^[a-z0-9-]{1,32}$/, name: "1 <= string <= 60", group: /^[a-z][a-z0-9-]{0,31}$/, value: /^#[0-9a-fA-F]{6}$/ });
export const Project = type({
  "+": "reject", format: "'colourist-project'", formatVersion: "1 <= number.integer <= 1000",
  rulesVersion: /^[0-9]{1,4}\.[0-9]{1,4}\.[0-9]{1,4}$/, engineVersion: /^[0-9]{1,4}\.[0-9]{1,4}\.[0-9]{1,4}$/,
  "name?": "1 <= string <= 120", "target?": "'AA' | 'AAA'",
  colours: Colour.array().atLeastLength(1).atMostLength(64),
  "overrides?": type.Record(/^[a-z][a-zA-Z0-9]{0,40}(\.[a-zA-Z0-9]{1,40}){0,8}$/, "number | string | boolean").narrow((o) => Object.keys(o).length <= 200),
});
export const name = "ArkType (jitless)";
export function validate(text) { const r = Project(JSON.parse(text)); const ok = !(r instanceof type.errors); return { ok, errors: ok ? [] : String(r.summary).split("\n").slice(0, 5) }; }
