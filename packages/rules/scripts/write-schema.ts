/**
 * @module write-schema
 * Writes `schema/rules.schema.json`, the published schema: the typed literal in `src/schema.ts`
 * with Ajv's `nullable` keyword removed (D-048). A test fails when the file is out of date.
 *
 * Run it with `npm run schema --workspace @colourist/rules`.
 */
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { format } from 'prettier';
import { rulesSchemaSource, withoutNullable } from '../src/schema.ts';

const out = join(import.meta.dirname, '../schema/rules.schema.json');
const json = JSON.stringify(withoutNullable(rulesSchemaSource));
writeFileSync(out, await format(json, { parser: 'json', printWidth: 100 }));
console.log(`Wrote ${out}`);
