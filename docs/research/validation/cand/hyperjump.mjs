/** @hyperjump/json-schema, interpreting the schema at runtime. Its API is asynchronous. */
import { registerSchema, validate as hjValidate } from "@hyperjump/json-schema/draft-2020-12";
import schema from "../project.schema.json" with { type: "json" };
registerSchema(schema);
const ready = hjValidate(schema.$id);
export const name = "@hyperjump/json-schema";
export async function validate(text) { const fn = await ready; const r = fn(JSON.parse(text), "BASIC"); return { ok: r.valid, errors: (r.errors || []).map((e) => `${e.instanceLocation} ${e.keyword ?? e.absoluteKeywordLocation}`) }; }
