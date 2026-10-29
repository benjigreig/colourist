/**
 * Runs the official JSON Schema Test Suite (draft 2020-12, required tests only)
 * against each JSON Schema validator candidate, and counts passes and failures.
 *
 * Remote references are served from the suite's own `remotes` folder, the way
 * the suite expects (http://localhost:1234/...). Optional tests (formats, etc.)
 * are excluded, because 2020-12 treats `format` as an annotation by default.
 *
 * Usage: node compliance.mjs  (writes compliance.json)
 */
import { readFileSync, readdirSync, writeFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const SUITE = "suite/tests/draft2020-12";
const REMOTES = "suite/remotes";

/** Every remote schema the suite references, keyed by its URL. */
function loadRemotes() {
  const out = {};
  const walk = (dir) => {
    for (const name of readdirSync(dir)) {
      const path = join(dir, name);
      if (statSync(path).isDirectory()) walk(path);
      else if (name.endsWith(".json")) out[`http://localhost:1234/${relative(REMOTES, path)}`] = JSON.parse(readFileSync(path, "utf8"));
    }
  };
  walk(REMOTES);
  return out;
}
const remotes = loadRemotes();

/** All test groups from the required (non-optional) 2020-12 files. */
const groups = readdirSync(SUITE)
  .filter((f) => f.endsWith(".json"))
  .flatMap((file) => JSON.parse(readFileSync(join(SUITE, file), "utf8")).map((g) => ({ ...g, file })));

/**
 * Each adapter turns a schema into a function that returns true when an instance is valid.
 * Adapters may be async. A thrown error counts as a failure for every test in that group.
 */
const adapters = {
  "ajv (Ajv2020)": async () => {
    const Ajv2020 = require("ajv/dist/2020").default;
    return (schema) => {
      const ajv = new Ajv2020({ strict: false, validateFormats: false, loadSchema: undefined });
      for (const [url, s] of Object.entries(remotes)) { try { ajv.addSchema(s, url); } catch {} }
      const fn = ajv.compile(schema);
      return (x) => fn(x);
    };
  },
  "@cfworker/json-schema": async () => {
    const { Validator } = require("@cfworker/json-schema");
    return (schema) => {
      const v = new Validator(schema, "2020-12", false);
      for (const [url, s] of Object.entries(remotes)) v.addSchema(s, url);
      return (x) => v.validate(x).valid;
    };
  },
  "@hyperjump/json-schema": async () => {
    const hj = await import("@hyperjump/json-schema/draft-2020-12");
    for (const [url, s] of Object.entries(remotes)) { try { hj.registerSchema(s, url); } catch {} }
    let n = 0;
    return async (schema) => {
      const id = `https://colourist.test/schema/${n++}`;
      const s = typeof schema === "object" && schema !== null && !schema.$id ? { $schema: "https://json-schema.org/draft/2020-12/schema", ...schema } : schema;
      if (typeof s === "object" && s !== null && s.$id) { hj.registerSchema(s); const v = await hj.validate(s.$id); return (x) => v(x).valid; }
      hj.registerSchema(typeof s === "boolean" ? s : s, id);
      const v = await hj.validate(id);
      return (x) => v(x).valid;
    };
  },
  "@exodus/schemasafe": async () => {
    const { validator } = require("@exodus/schemasafe");
    return (schema) => {
      const fn = validator(schema, { mode: "default", allowUnusedKeywords: true, schemas: new Map(Object.entries(remotes)), $schemaDefault: "https://json-schema.org/draft/2020-12/schema" });
      return (x) => fn(x);
    };
  },
  "json-schema-library": async () => {
    const { compileSchema } = require("json-schema-library");
    return (schema) => {
      const remoteNodes = Object.entries(remotes).map(([url, s]) => compileSchema(typeof s === "object" ? { $id: url, ...s } : s));
      const node = compileSchema(schema, { drafts: undefined });
      for (const r of remoteNodes) { try { node.addRemoteSchema?.(r.schema?.$id, r.schema); } catch {} }
      return (x) => node.validate(x).valid;
    };
  },
  "jsonschema": async () => {
    const { Validator } = require("jsonschema");
    return (schema) => {
      const v = new Validator();
      for (const [url, s] of Object.entries(remotes)) { try { v.addSchema(s, url); } catch {} }
      return (x) => v.validate(x, schema).valid;
    };
  },
};

const results = {};
for (const [name, make] of Object.entries(adapters)) {
  const compile = await make();
  let pass = 0, fail = 0;
  const failedFiles = {};
  for (const g of groups) {
    let check;
    try { check = await compile(g.schema); } catch { check = null; }
    for (const t of g.tests) {
      let ok = false;
      try { ok = check !== null && (await check(t.data)) === t.valid; } catch { ok = false; }
      if (ok) pass++; else { fail++; failedFiles[g.file] = (failedFiles[g.file] ?? 0) + 1; }
    }
  }
  results[name] = { pass, fail, total: pass + fail, percent: Math.round((pass / (pass + fail)) * 1000) / 10, failedFiles };
  console.log(name, pass, "/", pass + fail, `${results[name].percent}%`);
}
writeFileSync("compliance.json", JSON.stringify(results, null, 1));
