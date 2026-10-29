/** schemasafe, precompiled at build time to plain JavaScript (gen.mjs). */
import fn from "../gen/schemasafe-project.mjs";
export const name = "schemasafe, precompiled";
export function validate(text) { const data = JSON.parse(text); const ok = fn(data); return { ok, errors: ok ? [] : (fn.errors || []).map((e) => `${e.instanceLocation} ${e.keywordLocation}`) }; }
