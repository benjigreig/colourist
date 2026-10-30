/**
 * @module schema
 * The rules schema, in JSON Schema draft 2020-12 (ADR 0005, ADR 0006).
 *
 * It's written here as a typed literal so Ajv's `JSONSchemaType` can check it against the
 * hand-written types. That check needs Ajv's own `nullable` keyword on optional properties, which
 * isn't standard JSON Schema, so the published schema, `schema/rules.schema.json`, is this
 * literal with `nullable` removed, and both validators check against that (D-048). Unknown
 * properties are rejected at every level.
 */
import type { JSONSchemaType } from 'ajv';
import type {
  ContextTargets,
  ContrastTarget,
  HueRule,
  Choice,
  LadderStep,
  LadderUse,
  LevelLadders,
  LevelTargets,
  Placeholder,
  QuestionGroup,
  Recipe,
  Rules,
  SemanticToken,
  SeparationRule,
  SeparationTargets,
  Zones,
} from './types.ts';

/** The schema's version. A breaking change to the schema raises it. */
export const SCHEMA_VERSION = 2;

/** The schema's identifier. */
export const SCHEMA_ID = `https://colouri.st/schemas/rules-${SCHEMA_VERSION}.schema.json`;

/** IDs are camelCase, so they read the same in JSON, TypeScript and token names. */
const ID_PATTERN = '^[a-z][a-zA-Z0-9]{0,47}$';
/** Semantic token IDs are dotted IDs, such as `text.body`. */
const TOKEN_ID_PATTERN = '^[a-z][a-zA-Z0-9]{0,47}(\\.[a-z][a-zA-Z0-9]{0,47}){0,3}$';

const reason = {
  type: 'string',
  pattern: '^rules(\\.[a-z][a-zA-Z0-9]{0,47}){2,6}$',
} as const;
const textKey = reason;
const id = { type: 'string', pattern: ID_PATTERN } as const;

const placeholder: JSONSchemaType<Placeholder> = {
  type: 'object',
  additionalProperties: false,
  required: ['ticket', 'note'],
  properties: {
    ticket: { type: 'string', pattern: '^CLR-[0-9]{1,5}$' },
    note: { type: 'string', minLength: 1, maxLength: 500 },
  },
};
const optionalPlaceholder = { ...placeholder, nullable: true } as const;

const target: JSONSchemaType<ContrastTarget> = {
  type: 'object',
  additionalProperties: false,
  required: ['ratio', 'grades'],
  properties: {
    ratio: { type: 'number', minimum: 1, maximum: 21 },
    grades: { type: 'integer', minimum: 0, maximum: 100 },
  },
};

const levelTargets: JSONSchemaType<LevelTargets> = {
  type: 'object',
  additionalProperties: false,
  required: ['aa', 'aaa'],
  properties: { aa: target, aaa: target },
};

const gradesByContext = {
  type: 'object',
  required: [],
  minProperties: 1,
  propertyNames: { type: 'string', pattern: ID_PATTERN },
  additionalProperties: { type: 'number', minimum: 0, maximum: 100 },
} as const;

const separationTargets: JSONSchemaType<SeparationTargets> = {
  type: 'object',
  additionalProperties: false,
  required: ['aa', 'aaa'],
  properties: {
    aa: gradesByContext,
    aaa: gradesByContext,
    placeholder: optionalPlaceholder,
  },
};

const contextTargets: JSONSchemaType<ContextTargets> = {
  type: 'object',
  additionalProperties: false,
  required: [],
  properties: {
    aa: { ...target, nullable: true },
    aaa: { ...target, nullable: true },
    placeholder: optionalPlaceholder,
  },
};

const ZONES = ['lightBackground', 'contrast', 'darkBackground'] as const;

const ladderStep: JSONSchemaType<LadderStep> = {
  type: 'object',
  additionalProperties: false,
  required: ['name', 'grade', 'lstar', 'zone', 'uses'],
  properties: {
    name: { type: 'integer', minimum: 0, maximum: 100 },
    grade: { type: 'number', minimum: 0, maximum: 100 },
    lstar: { type: 'number', minimum: 0, maximum: 100 },
    zone: { type: 'string', enum: [...ZONES] },
    uses: {
      type: 'array',
      minItems: 1,
      maxItems: 64,
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['theme', 'family', 'use'],
        properties: { theme: id, family: id, use: id },
      },
    },
  },
};

const ladder = { type: 'array', minItems: 2, maxItems: 48, items: ladderStep } as const;

const levelLadders: JSONSchemaType<LevelLadders> = {
  type: 'object',
  additionalProperties: false,
  required: ['aa', 'aaa'],
  properties: { aa: ladder, aaa: ladder },
};

const recipe: JSONSchemaType<Recipe> = {
  type: 'object',
  additionalProperties: false,
  required: ['nameKey', 'reason', 'answers', 'themes', 'ladders'],
  properties: {
    nameKey: textKey,
    reason,
    answers: { type: 'array', items: id, uniqueItems: true, maxItems: 32 },
    themes: { type: 'array', items: id, uniqueItems: true, minItems: 1, maxItems: 16 },
    ladders: levelLadders,
  },
};

const ladderUse: JSONSchemaType<LadderUse> = {
  type: 'object',
  additionalProperties: false,
  required: ['nameKey'],
  properties: { nameKey: textKey, contrastUse: { ...id, nullable: true } },
};

const choice: JSONSchemaType<Choice> = {
  type: 'object',
  additionalProperties: false,
  required: ['id', 'labelKey', 'exampleKey', 'reason', 'default', 'effects'],
  properties: {
    id,
    labelKey: textKey,
    exampleKey: textKey,
    reason,
    default: { type: 'string', enum: ['always', 'on', 'off'] },
    effects: {
      type: 'object',
      additionalProperties: false,
      required: [],
      properties: {
        addsUses: { type: 'array', items: id, uniqueItems: true, maxItems: 32, nullable: true },
        addsContexts: { type: 'array', items: id, uniqueItems: true, maxItems: 8, nullable: true },
        suggestsTarget: { type: 'string', enum: ['aa', 'aaa'], nullable: true },
        separationMultipliers: {
          type: 'object',
          additionalProperties: false,
          required: [],
          minProperties: 1,
          properties: {
            lightBackground: { type: 'number', minimum: 1, maximum: 4, nullable: true },
            contrast: { type: 'number', minimum: 1, maximum: 4, nullable: true },
            darkBackground: { type: 'number', minimum: 1, maximum: 4, nullable: true },
          },
          nullable: true,
        },
        placeholder: optionalPlaceholder,
      },
    },
    later: optionalPlaceholder,
  },
};

const questionGroup: JSONSchemaType<QuestionGroup> = {
  type: 'object',
  additionalProperties: false,
  required: ['id', 'labelKey', 'choices'],
  properties: {
    id,
    labelKey: textKey,
    choices: { type: 'array', minItems: 1, maxItems: 16, items: choice },
  },
};

const zoneRule = {
  type: 'object',
  additionalProperties: false,
  required: ['reason'],
  properties: { reason, placeholder: optionalPlaceholder },
} as const;

const zones: JSONSchemaType<Zones> = {
  type: 'object',
  additionalProperties: false,
  required: [...ZONES],
  properties: {
    lightBackground: zoneRule,
    contrast: {
      type: 'object',
      additionalProperties: false,
      required: ['gradesFromEachPage', 'reason'],
      properties: {
        gradesFromEachPage: {
          type: 'array',
          minItems: 1,
          maxItems: 8,
          uniqueItems: true,
          items: { type: 'integer', minimum: 1, maximum: 100 },
        },
        reason,
        placeholder: optionalPlaceholder,
      },
    },
    darkBackground: {
      type: 'object',
      additionalProperties: false,
      required: ['separationMultiplier', 'reason'],
      properties: {
        separationMultiplier: { type: 'number', minimum: 1, maximum: 4 },
        reason,
        placeholder: optionalPlaceholder,
      },
    },
  },
};

const separationRule: JSONSchemaType<SeparationRule> = {
  type: 'object',
  additionalProperties: false,
  required: ['metric', 'minimum', 'reason'],
  properties: {
    metric: { type: 'string', enum: ['deltaE2000', 'deltaEOk'] },
    minimum: { type: 'number', minimum: 0 },
    reason,
    placeholder: optionalPlaceholder,
  },
};

const hueRule: JSONSchemaType<HueRule> = {
  type: 'object',
  additionalProperties: false,
  required: ['degrees', 'reason'],
  properties: {
    degrees: { type: 'number', minimum: 0, maximum: 180 },
    reason,
    placeholder: optionalPlaceholder,
  },
};

const semanticToken: JSONSchemaType<SemanticToken> = {
  type: 'object',
  additionalProperties: false,
  required: ['purpose', 'source', 'grade', 'reason'],
  properties: {
    purpose: id,
    source: id,
    grade: {
      type: 'object',
      required: [],
      minProperties: 1,
      propertyNames: id,
      additionalProperties: { type: 'number', minimum: 0, maximum: 100 },
    },
    on: { type: 'string', pattern: TOKEN_ID_PATTERN, nullable: true },
    use: { ...id, nullable: true },
    target: { type: 'string', enum: ['aa', 'aaa'], nullable: true },
    states: { type: 'array', items: id, uniqueItems: true, maxItems: 16, nullable: true },
    reason,
    placeholder: optionalPlaceholder,
  },
};

/**
 * Builds a map schema: an object whose keys are IDs and whose values follow one schema.
 * @param value - the schema every value follows
 * @param keys - the pattern keys must match; camelCase IDs by default
 * @returns the map schema
 */
function mapOf<T>(
  value: JSONSchemaType<T>,
  keys: string = ID_PATTERN,
): JSONSchemaType<Record<string, T>> {
  return {
    type: 'object',
    required: [],
    minProperties: 1,
    maxProperties: 128,
    propertyNames: { type: 'string', pattern: keys },
    additionalProperties: value,
  } as JSONSchemaType<Record<string, T>>;
}

/** The rules schema as a typed literal, with Ajv's `nullable` on optional properties. */
export const rulesSchemaSource: JSONSchemaType<Rules> = {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  $id: SCHEMA_ID,
  title: 'colouri.st rules',
  description:
    'The colouri.st method as versioned, declarative data the engine reads (ADR 0005). Every rule carries a reason key into the language files.',
  type: 'object',
  additionalProperties: false,
  required: [
    'meta',
    'questions',
    'recipes',
    'ladders',
    'contrast',
    'vividness',
    'groups',
    'palettePresets',
    'distinctness',
    'hue',
    'semantic',
    'naming',
    'guidance',
  ],
  properties: {
    $schema: { type: 'string', nullable: true },
    meta: {
      type: 'object',
      additionalProperties: false,
      required: ['rulesVersion', 'schemaVersion'],
      properties: {
        rulesVersion: { type: 'string', pattern: '^[0-9]{1,4}\\.[0-9]{1,4}\\.[0-9]{1,4}$' },
        schemaVersion: { type: 'integer', const: SCHEMA_VERSION },
      },
    },
    questions: { type: 'array', minItems: 1, maxItems: 8, items: questionGroup },
    recipes: {
      type: 'object',
      additionalProperties: false,
      required: ['default', 'items'],
      properties: { default: id, items: mapOf(recipe) },
    },
    ladders: {
      type: 'object',
      additionalProperties: false,
      required: ['zones', 'minimumGap', 'uses', 'states'],
      properties: {
        zones,
        minimumGap: {
          type: 'object',
          additionalProperties: false,
          required: ['grades', 'reason'],
          properties: {
            grades: { type: 'number', minimum: 0, maximum: 10 },
            reason,
            placeholder: optionalPlaceholder,
          },
        },
        uses: mapOf(ladderUse),
        states: {
          type: 'object',
          additionalProperties: false,
          required: ['reason'],
          properties: { reason, placeholder: optionalPlaceholder },
        },
      },
    },
    contrast: {
      type: 'object',
      additionalProperties: false,
      required: ['defaultLevel', 'contexts', 'uses', 'apca'],
      properties: {
        defaultLevel: { type: 'string', enum: ['aa', 'aaa'] },
        contexts: mapOf({
          type: 'object',
          additionalProperties: false,
          required: ['reason'],
          properties: { reason, placeholder: optionalPlaceholder },
        }),
        uses: mapOf({
          type: 'object',
          additionalProperties: false,
          required: ['reason'],
          // WCAG targets with the criteria they come from, or a separation target, not both.
          oneOf: [
            { required: ['wcag', 'targets'], not: { required: ['separation'] } },
            {
              required: ['separation'],
              not: {
                anyOf: [
                  { required: ['wcag'] },
                  { required: ['targets'] },
                  { required: ['contexts'] },
                ],
              },
            },
          ],
          properties: {
            wcag: {
              type: 'array',
              minItems: 1,
              uniqueItems: true,
              items: { type: 'string', pattern: '^[1-4]\\.[0-9]{1,2}\\.[0-9]{1,2}$' },
              nullable: true,
            },
            targets: { ...levelTargets, nullable: true },
            separation: { ...separationTargets, nullable: true },
            contexts: { ...mapOf(contextTargets), nullable: true },
            reason,
            placeholder: optionalPlaceholder,
          },
        }),
        apca: {
          type: 'object',
          additionalProperties: false,
          required: ['reason'],
          properties: {
            targets: {
              ...mapOf<number>({ type: 'number', minimum: 0, maximum: 110 }),
              nullable: true,
            },
            reason,
            placeholder: optionalPlaceholder,
          },
        },
      },
    },
    vividness: {
      type: 'object',
      additionalProperties: false,
      required: ['presets', 'defaults', 'styles'],
      properties: {
        presets: mapOf({
          type: 'object',
          additionalProperties: false,
          required: ['ceiling', 'recovery', 'reason'],
          properties: {
            ceiling: { type: 'number', minimum: 0, maximum: 1 },
            recovery: { type: 'number', minimum: 0, maximum: 1 },
            reason,
            placeholder: optionalPlaceholder,
          },
        }),
        defaults: mapOf<string>(id),
        styles: mapOf({
          type: 'object',
          additionalProperties: false,
          required: ['nameKey', 'reason'],
          properties: { nameKey: textKey, reason, placeholder: optionalPlaceholder },
        }),
      },
    },
    groups: mapOf({
      type: 'object',
      additionalProperties: false,
      required: ['nameKey', 'reason'],
      properties: { nameKey: textKey, reason, placeholder: optionalPlaceholder },
    }),
    palettePresets: mapOf({
      type: 'object',
      additionalProperties: false,
      required: ['nameKey', 'group', 'value', 'reason'],
      properties: {
        nameKey: textKey,
        group: id,
        value: { type: 'string', pattern: '^#[0-9A-F]{6}$' },
        reason,
        placeholder: optionalPlaceholder,
      },
    }),
    distinctness: {
      type: 'object',
      additionalProperties: false,
      required: ['betweenGroups', 'withinGroup', 'extremeSteps', 'similarHue'],
      properties: {
        betweenGroups: separationRule,
        withinGroup: separationRule,
        extremeSteps: {
          type: 'object',
          additionalProperties: false,
          required: ['steps', 'factor', 'reason'],
          properties: {
            steps: { type: 'integer', minimum: 0, maximum: 8 },
            factor: { type: 'number', minimum: 0, maximum: 1 },
            reason,
            placeholder: optionalPlaceholder,
          },
        },
        similarHue: hueRule,
      },
    },
    hue: {
      type: 'object',
      additionalProperties: false,
      required: ['maxDrift'],
      properties: { maxDrift: hueRule },
    },
    semantic: mapOf(semanticToken, TOKEN_ID_PATTERN),
    naming: {
      type: 'object',
      additionalProperties: false,
      required: ['direction', 'token', 'presets'],
      properties: {
        direction: {
          type: 'object',
          additionalProperties: false,
          required: ['value', 'reason'],
          properties: { value: { type: 'string', enum: ['towardsDark', 'towardsLight'] }, reason },
        },
        token: {
          type: 'object',
          additionalProperties: false,
          required: ['pattern', 'case', 'separator', 'reason'],
          properties: {
            pattern: { type: 'string', minLength: 1, maxLength: 120 },
            case: { type: 'string', enum: ['kebab', 'camel', 'snake'] },
            separator: { type: 'string', enum: ['-', '.', '/', '_'] },
            reason,
            placeholder: optionalPlaceholder,
          },
        },
        presets: mapOf({
          type: 'object',
          additionalProperties: false,
          required: ['nameKey', 'steps', 'reason'],
          properties: {
            nameKey: textKey,
            steps: {
              type: 'array',
              minItems: 2,
              maxItems: 32,
              items: { type: 'string', minLength: 1, maxLength: 16 },
            },
            reason,
            placeholder: optionalPlaceholder,
          },
        }),
      },
    },
    guidance: {
      type: 'object',
      additionalProperties: false,
      required: ['refreshAfterMonths', 'reason'],
      properties: { refreshAfterMonths: { type: 'integer', minimum: 1, maximum: 36 }, reason },
    },
  },
};

/**
 * Removes Ajv's `nullable` keyword throughout a schema, leaving standard JSON Schema.
 * @param schema - a schema, or any part of one
 * @returns a copy without `nullable`
 */
export function withoutNullable(schema: unknown): unknown {
  if (Array.isArray(schema)) return schema.map(withoutNullable);
  if (schema === null || typeof schema !== 'object') return schema;
  return Object.fromEntries(
    Object.entries(schema)
      .filter(([key]) => key !== 'nullable')
      .map(([key, value]) => [key, withoutNullable(value)]),
  );
}
