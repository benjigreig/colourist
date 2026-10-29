/**
 * Measures both spikes the same way: accessibility (axe), keyboard behaviour,
 * focus handling, regeneration time and screenshots. Writes results.json.
 * Usage: node measure.mjs  (expects both apps built into svelte/dist and preact/dist)
 */
import { createRequire } from "node:module";
const { chromium } = createRequire(import.meta.url)("playwright");
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join } from "node:path";
import { writeFile } from "node:fs/promises";
import AxeBuilder from "@axe-core/playwright";

const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css" };
/** Serves one built app as static files, the way GitHub Pages would. */
function serve(dir, port) {
  return new Promise((resolve) => {
    const server = createServer(async (req, res) => {
      const path = join(dir, req.url === "/" ? "index.html" : req.url.split("?")[0]);
      try { res.writeHead(200, { "content-type": TYPES[extname(path)] ?? "application/octet-stream" }); res.end(await readFile(path)); }
      catch { res.writeHead(404); res.end(); }
    }).listen(port, () => resolve(server));
  });
}

const axe = async (page) => (await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "best-practice"]).analyze()).violations.map((v) => `${v.id} (${v.nodes.length})`);

const results = {};
const browser = await chromium.launch();
for (const [name, port] of [["svelte", 4101], ["preact", 4102]]) {
  const server = await serve(`${name}/dist`, port);
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  const r = {};
  await page.goto(`http://localhost:${port}/`);
  r.axe_initial = await axe(page);

  // Keyboard only: add a colour, type a value one key at a time, check focus and value survive re-renders.
  await page.keyboard.press("Tab"); // first name field
  const order = [];
  for (let i = 0; i < 12; i++) { order.push(await page.evaluate(() => { const e = document.activeElement; return e.getAttribute("aria-label") || e.labels?.[0]?.textContent || e.textContent?.trim().slice(0, 20) || e.tagName; })); await page.keyboard.press("Tab"); }
  r.tab_order = order;
  await page.getByRole("button", { name: "Add a colour" }).focus();
  await page.keyboard.press("Enter");
  const hex = page.getByLabel("Hex value").nth(1);
  await hex.focus();
  await page.keyboard.type("#E8B9", { delay: 20 });
  r.invalid_partial_shows_error = await page.getByText("Use a hex value like #1B548F").isVisible();
  r.readout_dashes = (await page.locator(".readout").nth(1).textContent()).includes("–");
  r.axe_invalid = await axe(page);
  await page.keyboard.type("31", { delay: 20 });
  r.focus_kept_while_typing = await page.evaluate(() => document.activeElement?.id?.startsWith("hex-"));
  r.value_after_typing = await hex.inputValue();
  r.rows_in_ladder = await page.locator("tbody tr").count();

  // Radio group by keyboard.
  await page.getByRole("radio", { name: "13 steps" }).focus();
  await page.keyboard.press("ArrowDown");
  r.preset_after_arrow = await page.evaluate(() => document.querySelector("input[name=preset]:checked")?.value);
  r.columns_after_arrow = await page.locator("tbody tr").first().locator("td").count();

  // Focus after removing a colour: does it land somewhere sensible?
  await page.getByRole("button", { name: /^Remove/ }).last().focus();
  await page.keyboard.press("Enter");
  const where = () => page.evaluate(() => document.activeElement?.tagName + (document.activeElement?.id ? "#" + document.activeElement.id : ""));
  r.focus_after_remove_immediately = await where();
  await page.waitForTimeout(100);
  r.focus_after_remove = await where();
  r.announcement_after_remove = await page.locator("[aria-live]").textContent();

  // Regeneration time with the largest preset and 15 colours.
  await page.getByRole("radio", { name: "15 steps" }).check();
  for (let i = 0; i < 13; i++) await page.getByRole("button", { name: "Add a colour" }).click();
  const fields = page.getByLabel("Hex value");
  const count = await fields.count();
  for (let i = 0; i < count; i++) await fields.nth(i).fill(["#1B548F", "#E8B931", "#6E9B84", "#0057FF", "#B8D8E8"][i % 5]);
  r.colours_for_timing = count;
  const times = [];
  for (const value of ["#C0392B", "#2C3E50", "#8E44AD", "#16A085", "#D35400"]) {
    times.push(await page.evaluate(async (v) => {
      const input = document.querySelectorAll("input[id^=hex-]")[0];
      const t0 = performance.now();
      input.value = v; input.dispatchEvent(new Event("input", { bubbles: true }));
      await new Promise((res) => requestAnimationFrame(() => requestAnimationFrame(res)));
      return performance.now() - t0;
    }, value));
  }
  r.regeneration_ms = times.map((t) => Math.round(t));
  r.axe_full = await axe(page);

  await page.getByRole("button", { name: "Try an example" }).click();
  await page.getByRole("radio", { name: "13 steps" }).check();
  await page.screenshot({ path: `screenshot-${name}.png`, fullPage: true });
  await page.emulateMedia({ colorScheme: "dark" });
  r.axe_dark = await axe(page);
  await page.setViewportSize({ width: 320, height: 800 });
  await page.emulateMedia({ colorScheme: "light" });
  r.axe_320px = await axe(page);
  r.horizontal_scroll_at_320 = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  await page.screenshot({ path: `screenshot-${name}-320.png`, fullPage: true });

  results[name] = r;
  await context.close(); server.close();
}
await browser.close();
await writeFile("results.json", JSON.stringify(results, null, 1));
console.log(JSON.stringify(results, null, 1));
