import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { registerSchema, validate } from '@hyperjump/json-schema/draft-2020-12';
import { Ajv2020 } from 'ajv/dist/2020.js';
import { beforeAll, describe, expect, it } from 'vitest';
import { SCHEMA_ID, rulesSchemaSource, withoutNullable } from '../src/index.ts';

const VERSIONED = 'CLR-7: Schema is versioned and validated in CI';
const VALIDATES = 'CLR-7: Default configuration file validates against it';
const RATIONALE =
  'CLR-7: Every rule can carry a rationale string that the teaching content can reuse';

const root = join(import.meta.dirname, '..');
const publishedSchema = JSON.parse(readFileSync(join(root, 'schema/rules.schema.json'), 'utf8'));
const rulesText = readFileSync(join(root, 'rules.json'), 'utf8');

// Ajv in strict mode also catches mistakes in the schema itself (ADR 0006). One strict rule is
// off: a use has WCAG targets or a separation target, which the schema says with `required`
// inside `oneOf`, naming properties defined on the use itself (D-048).
const ajv = new Ajv2020({ strict: true, strictRequired: false, allErrors: true });
const ajvValidate = ajv.compile(publishedSchema);

beforeAll(() => {
  registerSchema(publishedSchema);
});

/** Both validators' verdicts on JSON text, as it would arrive. hyperjump throwing is a rejection. */
async function verdicts(text: string): Promise<{ ajv: boolean; hyperjump: boolean }> {
  const value: unknown = JSON.parse(text);
  let hyperjump: boolean;
  try {
    hyperjump = (await validate(SCHEMA_ID, value as never)).valid;
  } catch {
    hyperjump = false;
  }
  return { ajv: ajvValidate(value), hyperjump };
}

/** The default rules with one change, as JSON text. */
function changed(edit: (rules: Record<string, unknown>) => void): string {
  const rules = JSON.parse(rulesText) as Record<string, unknown>;
  edit(rules);
  return JSON.stringify(rules);
}

const at = (value: unknown, ...path: string[]): Record<string, unknown> =>
  path.reduce((node, key) => (node as Record<string, unknown>)[key], value) as Record<
    string,
    unknown
  >;

describe('the rules schema', () => {
  it(`${VERSIONED} — the published schema is up to date`, () => {
    // Regenerate with `npm run schema --workspace @colourist/rules`.
    expect(publishedSchema).toEqual(withoutNullable(rulesSchemaSource));
  });

  it(`${VERSIONED} — the schema and the rules both carry a version`, () => {
    expect(publishedSchema.$id).toBe(SCHEMA_ID);
    // Replacing ladder presets with recipes was a breaking change, so the schema is at 2 (D-058).
    expect(publishedSchema.$id).toMatch(/rules-2\.schema\.json$/);
    const rules = JSON.parse(rulesText);
    expect(rules.meta.schemaVersion).toBe(2);
    expect(rules.meta.rulesVersion).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it(`${VERSIONED} — the published schema is standard JSON Schema, without Ajv's nullable`, () => {
    expect(JSON.stringify(publishedSchema)).not.toContain('"nullable"');
    expect(publishedSchema.$schema).toBe('https://json-schema.org/draft/2020-12/schema');
  });

  it(`${VALIDATES} — Ajv and hyperjump both accept the default rules`, async () => {
    expect(await verdicts(rulesText)).toEqual({ ajv: true, hyperjump: true });
    expect(ajvValidate.errors ?? []).toEqual([]);
  });

  const invalid: [string, string][] = [
    ['an unknown top-level property', changed((r) => (r.extra = 1))],
    [
      'an unknown property in a recipe',
      changed((r) => (at(r, 'recipes', 'items', 'contentLight').extra = 1)),
    ],
    [
      'the old ladder presets',
      changed((r) => (at(r, 'ladders').presets = { steps13: { steps: [], reason: 'rules.x.y' } })),
    ],
    [
      'a recipe with only an AA ladder',
      changed((r) => delete at(r, 'recipes', 'items', 'contentLight', 'ladders').aaa),
    ],
    [
      'a step with no uses',
      changed((r) => (at(r, 'recipes', 'items', 'contentLight', 'ladders', 'aa', '0').uses = [])),
    ],
    [
      'a step with an unknown zone',
      changed(
        (r) => (at(r, 'recipes', 'items', 'contentLight', 'ladders', 'aa', '0').zone = 'middle'),
      ),
    ],
    [
      'a step name that is not a whole number',
      changed((r) => (at(r, 'recipes', 'items', 'contentLight', 'ladders', 'aa', '1').name = 3.4)),
    ],
    [
      'a choice default other than always, on or off',
      changed((r) => (at(r, 'questions', '0', 'choices', '1').default = 'maybe')),
    ],
    [
      'a choice without an example key',
      changed((r) => delete at(r, 'questions', '0', 'choices', '1').exampleKey),
    ],
    [
      'a separation multiplier for a zone that does not exist',
      changed(
        (r) =>
          (at(r, 'questions', '2', 'choices', '5', 'effects').separationMultipliers = {
            middle: 2,
          }),
      ),
    ],
    ['states as overlays (D-059)', changed((r) => (at(r, 'ladders', 'states').form = 'overlay'))],
    ['a missing zone', changed((r) => delete at(r, 'ladders', 'zones').darkBackground)],
    ['a missing section', changed((r) => delete r.guidance)],
    ['the wrong schema version', changed((r) => (at(r, 'meta').schemaVersion = 1))],
    ['a badly formed rules version', changed((r) => (at(r, 'meta').rulesVersion = 'one'))],
    ['a lowercase hex value', changed((r) => (at(r, 'palettePresets', 'error').value = '#c4362b'))],
    [
      'a ratio above 21:1',
      changed((r) => (at(r, 'contrast', 'uses', 'bodyText', 'targets', 'aa').ratio = 22)),
    ],
    [
      'a use with both WCAG and separation targets',
      changed(
        (r) =>
          (at(r, 'contrast', 'uses', 'bodyText').separation = at(
            r,
            'contrast',
            'uses',
            'surface',
            'separation',
          )),
      ),
    ],
    ['a use with neither', changed((r) => delete at(r, 'contrast', 'uses', 'surface').separation)],
    [
      'WCAG targets without their criteria',
      changed((r) => delete at(r, 'contrast', 'uses', 'bodyText').wcag),
    ],
    [
      'a WCAG target missing AAA',
      changed((r) => delete at(r, 'contrast', 'uses', 'bodyText', 'targets').aaa),
    ],
    [
      'a separation target missing AAA',
      changed((r) => delete at(r, 'contrast', 'uses', 'surface', 'separation').aaa),
    ],
    ['a level that isn’t AA or AAA', changed((r) => (at(r, 'contrast').defaultLevel = 'a'))],
    [
      'a badly formed ID',
      changed(
        (r) => (at(r, 'contrast', 'uses')['Body Text'] = at(r, 'contrast', 'uses', 'bodyText')),
      ),
    ],
    [
      'a placeholder with no ticket',
      changed((r) => (at(r, 'ladders', 'states').placeholder = { note: 'x' })),
    ],
    [
      'a placeholder naming another tracker',
      changed((r) => (at(r, 'ladders', 'states').placeholder = { ticket: 'JIRA-1', note: 'x' })),
    ],
    [
      'a reason that is text, not a key',
      changed((r) => (at(r, 'guidance').reason = 'Because it helps.')),
    ],
    ['__proto__ at the top level', rulesText.replace('{', '{"__proto__":{"polluted":true},')],
    [
      '__proto__ as a use ID',
      rulesText.replace('"uses": {', '"uses": {"__proto__":{"polluted":true},'),
    ],
    [
      'a constructor key in a preset',
      rulesText.replace(
        '"ceiling": 1,',
        '"constructor": {"prototype": {"polluted": true}}, "ceiling": 1,',
      ),
    ],
    [
      'a toString key in a group',
      rulesText.replace(
        '"nameKey": "rules.groups.brand.name",',
        '"nameKey": "rules.groups.brand.name", "toString": "x",',
      ),
    ],
    [
      'deeply nested placeholder (500 levels)',
      rulesText.replace('"note": "Stand-in grey."', `"note": ${'['.repeat(500)}${']'.repeat(500)}`),
    ],
    [
      'too many recipes (129)',
      changed((r) => {
        const items = at(r, 'recipes', 'items');
        for (let i = 0; i < 129; i++) items[`extra${i}`] = items.contentLight;
      }),
    ],
  ];

  it.each(invalid)(`${VALIDATES} — both validators reject %s`, async (_, text) => {
    expect(await verdicts(text)).toEqual({ ajv: false, hyperjump: false });
  });

  it(`${RATIONALE} — a rule without a reason is rejected`, async () => {
    const withoutReason = [
      changed((r) => delete at(r, 'contrast', 'uses', 'bodyText').reason),
      changed((r) => delete at(r, 'recipes', 'items', 'contentLight').reason),
      changed((r) => delete at(r, 'ladders', 'zones', 'contrast').reason),
      changed((r) => delete at(r, 'questions', '0', 'choices', '0').reason),
      changed((r) => delete at(r, 'vividness', 'styles', 'vivid').reason),
      changed((r) => delete at(r, 'semantic', 'text.body').reason),
      changed((r) => delete at(r, 'naming', 'direction').reason),
      changed((r) => delete at(r, 'distinctness', 'similarHue').reason),
    ];
    for (const text of withoutReason) {
      expect(await verdicts(text)).toEqual({ ajv: false, hyperjump: false });
    }
  });
});
