/**
 * Bundles each candidate adapter for the browser (minified ESM, as the app would ship it)
 * and records raw and gzipped sizes. Usage: node bundle.mjs  (writes bundle.json, dist/*.js)
 */
import { build } from "esbuild";
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { gzipSync, brotliCompressSync } from "node:zlib";
const out = {};
for (const f of readdirSync("cand").filter((f) => f.endsWith(".mjs"))) {
  const name = f.replace(".mjs", "");
  try {
    await build({ entryPoints: [`cand/${f}`], bundle: true, minify: true, format: "esm", platform: "browser", target: "es2022", outfile: `dist/${name}.js`, logLevel: "error" });
    const code = readFileSync(`dist/${name}.js`);
    out[name] = { bytes: code.length, gzip: gzipSync(code, { level: 9 }).length, brotli: brotliCompressSync(code).length };
  } catch (e) { out[name] = { error: String(e.message).slice(0, 300) }; }
  console.log(name.padEnd(26), JSON.stringify(out[name]));
}
writeFileSync("bundle.json", JSON.stringify(out, null, 1));
