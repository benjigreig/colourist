/**
 * Quick check of the spike core: the step-counting contrast rule and hue holding.
 * Not the engine's test suite (that's CLR-12); this only confirms the spike draws real scales.
 */
import { contrast, rgbToOklch, parseHex } from "./colour";
import { LADDER_PRESETS } from "./config";
import { buildScale } from "./ladder";

const preset = LADDER_PRESETS[1];
for (const hex of ["#1B548F", "#E8B931", "#6E9B84", "#0057FF", "#B8D8E8"]) {
  const scale = buildScale(parseHex(hex)!, preset.ladder, preset.stepNames);
  let worst7 = 99;
  for (let i = 0; i + 7 < scale.steps.length; i++) worst7 = Math.min(worst7, contrast(scale.steps[i].rgb, scale.steps[i + 7].rgb));
  const hues = scale.steps.slice(3, 11).map((s) => rgbToOklch(s.rgb).h);
  console.log(hex, "worst 7 apart:", worst7.toFixed(2), "hue range 200-900:", (Math.max(...hues) - Math.min(...hues)).toFixed(1), "nearest:", scale.steps[scale.nearestStep].name, scale.steps.map((s) => s.hex).join(" "));
}
