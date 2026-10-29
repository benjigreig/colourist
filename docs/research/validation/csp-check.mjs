/**
 * Loads each bundled candidate in Chromium, Firefox and WebKit under the strict content security policy
 * the app will ship with (script-src 'self', no 'unsafe-eval'), and records whether it works.
 * Usage: node csp-check.mjs  (writes csp.json)
 */
import { createServer } from "node:http";
import { readFileSync, readdirSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join } from "node:path";
const require = createRequire(import.meta.url);
const { chromium, firefox, webkit } = require("playwright");
/**
 * Same workaround as the repo's playwright.config.ts: on macOS 27, Playwright's Firefox exits with
 * "Could not find profile folder" (microsoft/playwright#42768), so give it an empty home of its own.
 * Remove once Playwright 1.65 is installed.
 */
function launchOptions(engine) {
  if (engine !== "firefox" || process.platform !== "darwin") return {};
  const home = join(tmpdir(), "colourist-playwright-firefox-home");
  mkdirSync(home, { recursive: true });
  return { env: { ...process.env, CFFIXED_USER_HOME: home } };
}
const CSP = "default-src 'self'; script-src 'self'; object-src 'none'; base-uri 'none'";
const types = { ".js": "text/javascript", ".html": "text/html", ".json": "application/json" };
const server = createServer((req, res) => {
  const path = "." + new URL(req.url, "http://x").pathname;
  if (!existsSync(path)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { "content-type": types[path.slice(path.lastIndexOf("."))] ?? "text/plain", "content-security-policy": CSP });
  res.end(readFileSync(path));
}).listen(4321);
const names = readdirSync("dist").filter((f) => f.endsWith(".js")).map((f) => f.replace(".js", ""));
const out = {};
for (const [engine, type] of Object.entries({ chromium, firefox, webkit })) {
  let browser;
  try { browser = await type.launch(launchOptions(engine)); } catch (e) { out[engine] = { error: "browser not available: " + String(e.message).split("\n")[0] }; console.log(engine, out[engine].error); continue; }
  out[engine] = {};
  for (const n of names) {
    const page = await (await browser.newContext()).newPage();
    await page.goto(`http://localhost:4321/csp/index.html?c=${n}`);
    const r = await page.waitForFunction(() => window.result, null, { timeout: 15000 }).then((h) => h.jsonValue()).catch((e) => ({ loaded: false, error: "timeout" }));
    out[engine][n] = r;
    console.log(engine.padEnd(9), n.padEnd(24), JSON.stringify(r));
    await page.close();
  }
  await browser.close();
}
server.close();
writeFileSync("csp.json", JSON.stringify({ policy: CSP, results: out }, null, 1));
