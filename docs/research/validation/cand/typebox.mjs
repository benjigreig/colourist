/** TypeBox, code-first: the schema is written in TypeScript and is itself JSON Schema. Value.Check doesn't generate code. */
import Type from "typebox";
import Value from "typebox/value";
const semver = Type.String({ pattern: "^[0-9]{1,4}\\.[0-9]{1,4}\\.[0-9]{1,4}$" });
const Colour = Type.Object({
  id: Type.String({ pattern: "^[a-z0-9-]{1,32}$" }),
  name: Type.String({ minLength: 1, maxLength: 60 }),
  group: Type.String({ pattern: "^[a-z][a-z0-9-]{0,31}$" }),
  value: Type.String({ pattern: "^#[0-9a-fA-F]{6}$" }),
}, { additionalProperties: false });
export const Project = Type.Object({
  format: Type.Literal("colourist-project"),
  formatVersion: Type.Integer({ minimum: 1, maximum: 1000 }),
  rulesVersion: semver, engineVersion: semver,
  name: Type.Optional(Type.String({ minLength: 1, maxLength: 120 })),
  target: Type.Optional(Type.Union([Type.Literal("AA"), Type.Literal("AAA")])),
  colours: Type.Array(Colour, { minItems: 1, maxItems: 64 }),
  overrides: Type.Optional(Type.Record(Type.String({ pattern: "^[a-z][a-zA-Z0-9]{0,40}(\\.[a-zA-Z0-9]{1,40}){0,8}$" }), Type.Union([Type.Number(), Type.String(), Type.Boolean()]), { maxProperties: 200, additionalProperties: false })),
}, { additionalProperties: false });
export const name = "TypeBox";
export function validate(text) { const data = JSON.parse(text); const ok = Value.Check(Project, data); return { ok, errors: ok ? [] : [...Value.Errors(Project, data)].slice(0, 5).map((e) => `${e.instancePath} ${e.message}`) }; }
