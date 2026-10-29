/** json-schema-library, interpreting the schema at runtime. */
import { compileSchema } from "json-schema-library";
import schema from "../project.schema.json" with { type: "json" };
const node = compileSchema(schema);
export const name = "json-schema-library";
export function validate(text) { const r = node.validate(JSON.parse(text)); return { ok: r.valid, errors: r.errors.map((e) => e.message) }; }
