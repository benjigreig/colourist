/** Ajv, compiling the schema in the browser at runtime (needs eval-like code generation). */
import Ajv2020 from "ajv/dist/2020.js";
import schema from "../project.schema.json" with { type: "json" };
const fn = new Ajv2020({ allErrors: true, allowUnionTypes: true }).compile(schema);
export const name = "Ajv, compiled at runtime";
export function validate(text) { const data = JSON.parse(text); const ok = fn(data); return { ok, errors: ok ? [] : fn.errors.map((e) => `${e.instancePath || "/"} ${e.message}`) }; }
