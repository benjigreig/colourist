/**
 * CLR-13 uses research: how far a primary fill's hover and pressed states move from the fill itself,
 * which tests whether the middle of the ladder needs closer steps. Grade differences (D-041).
 */
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { cssVars, resolve, parseColour, over, grade, Lstar } from "./lib.mjs";
const require = createRequire(import.meta.url);
const read = (p) => readFileSync("node_modules/" + p, "utf8");
const css = (t) => { const v = cssVars(t); return (n) => (v[n] ? resolve(v[n], v) : null); };
const sets = [];
const add = (system, mode, look, rest, hover, pressed) => sets.push({ system, mode, rest: look(rest), hover: look(hover), pressed: pressed ? look(pressed) : null });
for (const m of ["light", "dark"]) add("Primer", m, css(read(`@primer/primitives/dist/css/functional/themes/${m}.css`)), "--button-primary-bgColor-rest", "--button-primary-bgColor-hover", "--button-primary-bgColor-active");
for (const m of ["light", "dark"]) add("Atlassian", m, css(require(`./node_modules/@atlaskit/tokens/dist/cjs/artifacts/themes/atlassian-${m}.js`).default), "--ds-background-brand-bold", "--ds-background-brand-bold-hovered", "--ds-background-brand-bold-pressed");
add("GitLab", "light", css(read("@gitlab/ui/src/tokens/build/css/tokens.css")), "--gl-button-confirm-primary-background-color-default", "--gl-button-confirm-primary-background-color-hover", "--gl-button-confirm-primary-background-color-active");
add("Polaris", "light", css(read("@shopify/polaris-tokens/dist/css/styles.css")), "--p-color-bg-fill-brand", "--p-color-bg-fill-brand-hover", "--p-color-bg-fill-brand-active");
for (const [m, th] of [["light", "sap_horizon"], ["dark", "sap_horizon_dark"]]) add("SAP", m, css(read(`@sap-theming/theming-base-content/content/Base/baseLib/${th}/css_variables.css`)), "--sapButton_Emphasized_Background", "--sapButton_Emphasized_Hover_Background", "--sapButton_Emphasized_Active_Background");
const f = require("@fluentui/tokens"); for (const [m, th] of [["light", "webLightTheme"], ["dark", "webDarkTheme"]]) add("Fluent 2", m, (k) => f[th][k], "colorBrandBackground", "colorBrandBackgroundHover", "colorBrandBackgroundPressed");
const { theme } = require("antd"); for (const [m, o] of [["light", {}], ["dark", { algorithm: theme.darkAlgorithm }]]) { const t = theme.getDesignToken(o); add("Ant Design", m, (k) => t[k], "colorPrimary", "colorPrimaryHover", "colorPrimaryActive"); }
const c = require("@carbon/themes"); for (const [m, th] of [["light", "white"], ["dark", "g100"]]) { const b = c.buttonTokens; add("Carbon", m, (k) => (typeof b[k] === "object" ? b[k][th === "white" ? "whiteTheme" : "g100"] : c[th][k]), "buttonPrimary", "buttonPrimaryHover", "buttonPrimaryActive"); }
const r = require("@radix-ui/colors"); for (const [m, s] of [["light", ""], ["dark", "Dark"]]) add("Radix", m, (k) => r["blue" + s]["blue" + k], 9, 10, null);
for (const s of sets) {
  const ok = s.rest && s.hover; if (!ok) { console.log(s.system, s.mode, "missing", JSON.stringify(s)); continue; }
  const P = (x) => over(parseColour(x), parseColour(s.rest));
  const R = parseColour(s.rest), H = P(s.hover), A = s.pressed ? P(s.pressed) : null;
  const d = (x) => (x ? (grade(x) - grade(R)).toFixed(1) : "—");
  console.log(`${(s.system + " " + s.mode).padEnd(18)} fill grade ${grade(R).toFixed(0).padStart(3)} (L* ${Lstar(R).toFixed(0)})  hover ${d(H).padStart(5)}  pressed ${d(A).padStart(5)}`);
}
