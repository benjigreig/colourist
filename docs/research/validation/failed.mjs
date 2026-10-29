import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const Ajv2020 = require("ajv/dist/2020").default;
const { Validator } = require("@cfworker/json-schema");
for (const file of ["required.json", "properties.json", "enum.json"]) {
  for (const g of JSON.parse(readFileSync(`suite/tests/draft2020-12/${file}`, "utf8"))) {
    const a = new Ajv2020({ strict: false }).compile(g.schema); const c = new Validator(g.schema, "2020-12", false);
    for (const t of g.tests) {
      const fa = a(t.data) !== t.valid, fc = c.validate(t.data).valid !== t.valid;
      if (fa || fc) console.log(file, "|", g.description, "|", t.description, "| ajv", fa ? "FAIL" : "ok", "| cfworker", fc ? "FAIL" : "ok");
    }
  }
}
