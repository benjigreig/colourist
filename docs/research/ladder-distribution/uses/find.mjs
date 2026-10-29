/** Exploration helper: print CSS custom properties in a file whose names match a pattern. Usage: node find.mjs <file> <regex> */
import { readFileSync } from "node:fs";
import { cssVars } from "./lib.mjs";
const v = cssVars(readFileSync(process.argv[2], "utf8"));
const re = new RegExp(process.argv[3]);
console.log(Object.entries(v).filter(([k]) => re.test(k)).slice(0, 60).map(([k, x]) => `${k}: ${x}`).join("\n"));
