/**
 * @module @colourist/rules
 * The colouri.st method as versioned, declarative data: ladder presets, contrast targets,
 * vividness, palette presets, distinctness, semantic tokens, naming and guidance (D-010,
 * ADR 0005). Recommendations are the default configuration, and each rule carries the key of
 * its reasoning in the language files.
 *
 * Values not decided yet carry a `placeholder` naming the ticket that decides them (D-048).
 */
import rulesFile from '../rules.json' with { type: 'json' };
import type { Rules } from './types.ts';

export { SCHEMA_ID, SCHEMA_VERSION, rulesSchemaSource, withoutNullable } from './schema.ts';
export type * from './types.ts';

/**
 * The default rules. CI validates the file against the schema with two independent validators,
 * so the type is checked there rather than at run time (ADR 0006).
 */
export const defaultRules: Rules = rulesFile as Rules;
