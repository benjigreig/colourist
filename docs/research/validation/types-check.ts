/** Checks that a hand-written TypeScript type and the JSON Schema agree, using Ajv's JSONSchemaType (no extra dependency). */
import type { JSONSchemaType } from "ajv";
export interface Colour { id: string; name: string; group: string; value: string }
export interface Project {
  format: "colourist-project"; formatVersion: number; rulesVersion: string; engineVersion: string;
  name?: string; target?: "AA" | "AAA"; colours: Colour[]; overrides?: Record<string, number | string | boolean>;
}
export const projectSchema: JSONSchemaType<Project> = {
  type: "object", additionalProperties: false,
  required: ["format", "formatVersion", "rulesVersion", "engineVersion", "colours"],
  properties: {
    format: { type: "string", const: "colourist-project" },
    formatVersion: { type: "integer", minimum: 1, maximum: 1000 },
    rulesVersion: { type: "string", pattern: "^[0-9]{1,4}\\.[0-9]{1,4}\\.[0-9]{1,4}$" },
    engineVersion: { type: "string", pattern: "^[0-9]{1,4}\\.[0-9]{1,4}\\.[0-9]{1,4}$" },
    name: { type: "string", minLength: 1, maxLength: 120, nullable: true },
    target: { type: "string", enum: ["AA", "AAA"], nullable: true },
    colours: { type: "array", minItems: 1, maxItems: 64, items: { type: "object", additionalProperties: false, required: ["id", "name", "group", "value"], properties: {
      id: { type: "string", pattern: "^[a-z0-9-]{1,32}$" }, name: { type: "string", minLength: 1, maxLength: 60 },
      group: { type: "string", pattern: "^[a-z][a-z0-9-]{0,31}$" }, value: { type: "string", pattern: "^#[0-9a-fA-F]{6}$" } } } },
    overrides: { type: "object", nullable: true, required: [], maxProperties: 200, additionalProperties: { type: ["number", "string", "boolean"] } as any },
  },
};
