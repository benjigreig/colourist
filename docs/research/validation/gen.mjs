/** Build-time step: precompiles the project schema to plain JavaScript with Ajv and schemasafe, so no compiler ships. */
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const schema = JSON.parse(readFileSync("project.schema.json", "utf8"));
const Ajv2020 = require("ajv/dist/2020").default;
const standalone = require("ajv/dist/standalone").default;
const ajv = new Ajv2020({ code: { source: true, esm: true }, allErrors: true, strict: true, allowUnionTypes: true });
// Ajv's ESM output still uses require() for its small runtime helpers, so turn those into imports.
const ajvCode = standalone(ajv, ajv.compile(schema)).replace(/const (\w+) = require\("([^"]+)"\)\.default;/g, (_, v, m) => `import ${v}_m from "${m}.js";const ${v} = ${v}_m.default ?? ${v}_m;`);
writeFileSync("gen/ajv-project.mjs", ajvCode);
const { validator } = require("@exodus/schemasafe");
writeFileSync("gen/schemasafe-project.mjs", "export default " + validator(schema, { includeErrors: true, allErrors: true }).toModule() + ";\n");
console.log("generated");
