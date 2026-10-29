/** Ajv, precompiled at build time to plain JavaScript (gen.mjs). Only small runtime helpers ship. */
import fn from "../gen/ajv-project.mjs";
export const name = "Ajv, precompiled";
export function validate(text) { const data = JSON.parse(text); const ok = fn(data); return { ok, errors: ok ? [] : fn.errors.map((e) => `${e.instancePath || "/"} ${e.message}`) }; }
