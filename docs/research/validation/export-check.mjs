/**
 * For the code-first candidates: exports each schema to JSON Schema, then validates the samples with
 * Ajv against that exported schema, to see whether the export says the same thing as the code.
 * Usage: node export-check.mjs  (writes export.json and exported/*.json)
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { cases } from "./samples.mjs";
const require = createRequire(import.meta.url);
const Ajv2020 = require("ajv/dist/2020").default;
mkdirSync("exported", { recursive: true });
const out = {};
const exporters = {
  typebox: async () => (await import("./cand/typebox.mjs")).Project,
  zod: async () => { const z = await import("zod"); return z.toJSONSchema((await import("./cand/zod.mjs")).Project, { unrepresentable: "any" }); },
  valibot: async () => { const { toJsonSchema } = await import("@valibot/to-json-schema"); return toJsonSchema((await import("./cand/valibot.mjs")).Project, { errorMode: "warn" }); },
  arktype: async () => (await import("./cand/arktype.mjs")).Project.toJsonSchema({ fallback: (ctx) => ctx.base }),
};
for (const [name, get] of Object.entries(exporters)) {
  try {
    const schema = JSON.parse(JSON.stringify(await get()));
    writeFileSync(`exported/${name}.json`, JSON.stringify(schema, null, 1));
    const ajv = new Ajv2020({ strict: false, allowUnionTypes: true });
    if (schema.$schema && !schema.$schema.includes("2020-12")) delete schema.$schema;
    const fn = ajv.compile(schema);
    const disagreements = cases.filter(([, text, shouldPass]) => fn(JSON.parse(text)) !== shouldPass).map(([d]) => d);
    out[name] = { $schema: schema.$schema ?? null, disagreements };
  } catch (e) { out[name] = { error: String(e.message).slice(0, 300) }; }
  console.log(name.padEnd(8), JSON.stringify(out[name]));
}
writeFileSync("export.json", JSON.stringify(out, null, 1));
