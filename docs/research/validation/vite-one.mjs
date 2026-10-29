/**
 * Bundles one candidate with Vite (the app's bundler), for packages esbuild alone can't resolve for the
 * browser (hyperjump). Copies the result into dist/ beside the others and records its size in bundle.json.
 * Usage: node vite-one.mjs <candidate>
 */
import { build } from "vite";
import { copyFileSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { gzipSync, brotliCompressSync } from "node:zlib";
const name = process.argv[2];
const outDir = `dist-vite/${name}`;
await build({ logLevel: "error", configFile: false, build: { outDir, emptyOutDir: true, minify: true, target: "es2022", lib: { entry: `cand/${name}.mjs`, formats: ["es"], fileName: name } } });
// Vite names the file .js or .mjs depending on version and settings, so take whichever it wrote.
const file = readdirSync(outDir).find((f) => /\.m?js$/.test(f));
copyFileSync(`${outDir}/${file}`, `dist/${name}.js`);
const code = readFileSync(`dist/${name}.js`);
const sizes = JSON.parse(readFileSync("bundle.json", "utf8"));
sizes[name] = { bytes: code.length, gzip: gzipSync(code, { level: 9 }).length, brotli: brotliCompressSync(code).length, note: "bundled with Vite: esbuild alone can't resolve the package's browser entry" };
writeFileSync("bundle.json", JSON.stringify(sizes, null, 1));
console.log(name.padEnd(26), JSON.stringify(sizes[name]));
