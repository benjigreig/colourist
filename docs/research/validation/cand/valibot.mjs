/** Valibot, code-first. Doesn't generate code. */
import * as v from "valibot";
const semver = v.pipe(v.string(), v.regex(/^[0-9]{1,4}\.[0-9]{1,4}\.[0-9]{1,4}$/));
const Colour = v.strictObject({ id: v.pipe(v.string(), v.regex(/^[a-z0-9-]{1,32}$/)), name: v.pipe(v.string(), v.minLength(1), v.maxLength(60)), group: v.pipe(v.string(), v.regex(/^[a-z][a-z0-9-]{0,31}$/)), value: v.pipe(v.string(), v.regex(/^#[0-9a-fA-F]{6}$/)) });
export const Project = v.strictObject({
  format: v.literal("colourist-project"), formatVersion: v.pipe(v.number(), v.integer(), v.minValue(1), v.maxValue(1000)), rulesVersion: semver, engineVersion: semver,
  name: v.optional(v.pipe(v.string(), v.minLength(1), v.maxLength(120))), target: v.optional(v.picklist(["AA", "AAA"])),
  colours: v.pipe(v.array(Colour), v.minLength(1), v.maxLength(64)),
  overrides: v.optional(v.pipe(v.record(v.pipe(v.string(), v.regex(/^[a-z][a-zA-Z0-9]{0,40}(\.[a-zA-Z0-9]{1,40}){0,8}$/)), v.union([v.number(), v.string(), v.boolean()])), v.check((o) => Object.keys(o).length <= 200))),
});
export const name = "Valibot";
export function validate(text) { const r = v.safeParse(Project, JSON.parse(text)); return { ok: r.success, errors: r.success ? [] : r.issues.slice(0, 5).map((i) => `/${(i.path || []).map((p) => p.key).join("/")} ${i.message}`) }; }
