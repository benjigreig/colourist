/** Zod 4, code-first, with its just-in-time compiler turned off (jitless) so it works without eval. */
import * as z from "zod";
z.config({ jitless: true });
const semver = z.string().regex(/^[0-9]{1,4}\.[0-9]{1,4}\.[0-9]{1,4}$/);
const Colour = z.strictObject({ id: z.string().regex(/^[a-z0-9-]{1,32}$/), name: z.string().min(1).max(60), group: z.string().regex(/^[a-z][a-z0-9-]{0,31}$/), value: z.string().regex(/^#[0-9a-fA-F]{6}$/) });
export const Project = z.strictObject({
  format: z.literal("colourist-project"), formatVersion: z.int().min(1).max(1000), rulesVersion: semver, engineVersion: semver,
  name: z.string().min(1).max(120).optional(), target: z.enum(["AA", "AAA"]).optional(),
  colours: z.array(Colour).min(1).max(64),
  overrides: z.record(z.string().regex(/^[a-z][a-zA-Z0-9]{0,40}(\.[a-zA-Z0-9]{1,40}){0,8}$/), z.union([z.number(), z.string(), z.boolean()])).refine((o) => Object.keys(o).length <= 200).optional(),
});
export const name = "Zod (jitless)";
export function validate(text) { const r = Project.safeParse(JSON.parse(text)); return { ok: r.success, errors: r.success ? [] : r.error.issues.slice(0, 5).map((i) => `/${i.path.join("/")} ${i.message}`) }; }
