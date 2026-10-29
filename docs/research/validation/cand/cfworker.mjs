/** @cfworker/json-schema, interpreting the schema at runtime (no code generation). */
import { Validator } from "@cfworker/json-schema";
import schema from "../project.schema.json" with { type: "json" };
const v = new Validator(schema, "2020-12", false);
export const name = "@cfworker/json-schema";
export function validate(text) { const r = v.validate(JSON.parse(text)); return { ok: r.valid, errors: r.errors.map((e) => `${e.instanceLocation} ${e.error}`) }; }
