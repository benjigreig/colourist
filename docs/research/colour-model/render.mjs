/** Renders results.json as a grey-chromed comparison sheet (analysis only). */
import { readFileSync, writeFileSync } from "node:fs";
const r = JSON.parse(readFileSync(new URL("./results.json", import.meta.url)));
const models = ["CIE LCh (D65)", "OKLCH", "Hybrid: L* + OK hue", "HCT"];
const labels = ["25","50","100","200","300","400","500","600","700","800","900","950","975"];
const brands = Object.keys(r["HCT"].brands);
let html = `<!doctype html><meta charset=utf-8><style>
body{font:13px/1.3 -apple-system,Helvetica,Arial,sans-serif;background:#e6e6e6;color:#1a1a1a;margin:24px;width:1400px}
h2{margin:28px 0 6px;font-size:16px} .row{display:flex;align-items:center;margin:2px 0}
.lab{width:170px;font-size:12px;color:#333}.sw{width:88px;height:30px}
.hdr .sw{height:auto;text-align:center;font-size:11px;color:#444}.gap{height:10px}
</style><h1 style="font-size:20px">Same sources, same L* ladder, four colour models</h1>`;
for (const b of brands) {
  html += `<h2>${b}</h2><div class="row hdr"><div class="lab"></div>${labels.map(l=>`<div class=sw>${l}</div>`).join("")}</div>`;
  const n = r["HCT"].brands[b].scales.length;
  for (let k = 0; k < n; k++) {
    for (const m of models) {
      const sc = r[m].brands[b].scales[k];
      html += `<div class=row><div class=lab>${k===0||true? m : ""}</div>${sc.map(h=>`<div class=sw style="background:${h}"></div>`).join("")}</div>`;
    }
    html += `<div class=gap></div>`;
  }
}
writeFileSync(new URL("./compare.html", import.meta.url), html);
