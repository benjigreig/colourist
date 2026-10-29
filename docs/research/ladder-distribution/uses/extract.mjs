/**
 * CLR-13 uses research: for each design system, the colour each interface use gets in light and dark mode.
 * Uses: page, surface (a layer on the page), sunken or secondary surface, hover, pressed, selected,
 * subtle border, strong border (controls), solid fill (primary action), text, muted text.
 * Sources are the systems' published npm packages, read as installed on 29 Oct 2026. Writes uses.json.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { cssVars, resolve } from "./lib.mjs";
const require = createRequire(import.meta.url);
const nm = (p) => "node_modules/" + p;
const read = (...ps) => ps.map((p) => readFileSync(nm(p), "utf8")).join("\n");
const USES = ["page", "surface", "sunken", "hover", "pressed", "selected", "borderSubtle", "borderStrong", "fill", "text", "textMuted"];
const out = {};
/** Records one system and mode: map is {use: tokenName}, lookup turns a token name into a colour string. */
function record(system, mode, map, lookup, note) {
  const row = {};
  for (const use of USES) if (map[use]) row[use] = { token: map[use], value: lookup(map[use]) ?? null };
  (out[system] ??= { note, modes: {} }).modes[mode] = row;
}
const fromCss = (text) => { const v = cssVars(text); return (name) => (v[name] != null ? resolve(v[name], v).trim() : null); };
function tryRun(name, fn) { try { fn(); } catch (e) { console.error("FAILED", name, e.message.slice(0, 160)); } }

tryRun("GitHub Primer", () => {
  const map = { page: "--bgColor-default", surface: "--bgColor-muted", sunken: "--bgColor-inset", hover: "--control-bgColor-hover", pressed: "--control-bgColor-active", selected: "--control-bgColor-selected", borderSubtle: "--borderColor-muted", borderStrong: "--control-borderColor-rest", fill: "--button-primary-bgColor-rest", text: "--fgColor-default", textMuted: "--fgColor-muted" };
  for (const [mode, f] of [["light", "light"], ["dark", "dark"], ["light, high contrast", "light-high-contrast"], ["dark, high contrast", "dark-high-contrast"]]) record("GitHub Primer", mode, map, fromCss(read(`@primer/primitives/dist/css/functional/themes/${f}.css`)), "@primer/primitives functional themes");
});
tryRun("Atlassian", () => {
  const map = { page: "--ds-surface", surface: "--ds-surface-raised", sunken: "--ds-surface-sunken", hover: "--ds-background-neutral-subtle-hovered", pressed: "--ds-background-neutral-subtle-pressed", selected: "--ds-background-selected", borderSubtle: "--ds-border", borderStrong: "--ds-border-input", fill: "--ds-background-brand-bold", text: "--ds-text", textMuted: "--ds-text-subtle" };
  for (const [mode, f] of [["light", "light"], ["dark", "dark"], ["light, high contrast", "light-increased-contrast"], ["dark, high contrast", "dark-increased-contrast"]]) record("Atlassian", mode, map, fromCss((require("./" + nm(`@atlaskit/tokens/dist/cjs/artifacts/themes/atlassian-${f}.js`)).default)), "@atlaskit/tokens; in dark mode the raised surface is lighter than the page");
});
tryRun("GitLab Pajamas", () => {
  const map = { page: "--gl-background-color-default", surface: "--gl-background-color-subtle", sunken: "--gl-background-color-strong", hover: "--gl-action-neutral-background-color-hover", pressed: "--gl-action-neutral-background-color-active", borderSubtle: "--gl-border-color-default", borderStrong: "--gl-control-border-color-default", fill: "--gl-button-confirm-primary-background-color-default", text: "--gl-text-color-default", textMuted: "--gl-text-color-subtle" };
  const light = read("@gitlab/ui/src/tokens/build/css/tokens.css");
  record("GitLab Pajamas", "light", map, fromCss(light), "@gitlab/ui tokens");
  record("GitLab Pajamas", "dark", map, fromCss(read("@gitlab/ui/src/tokens/build/css/tokens.dark.css") + "\n" + light), "@gitlab/ui tokens");
});
tryRun("Shopify Polaris", () => {
  const map = { page: "--p-color-bg", surface: "--p-color-bg-surface", sunken: "--p-color-bg-surface-secondary", hover: "--p-color-bg-surface-hover", pressed: "--p-color-bg-surface-active", selected: "--p-color-bg-surface-selected", borderSubtle: "--p-color-border-secondary", borderStrong: "--p-color-input-border", fill: "--p-color-bg-fill-brand", text: "--p-color-text", textMuted: "--p-color-text-secondary" };
  record("Shopify Polaris", "light", map, fromCss(read("@shopify/polaris-tokens/dist/css/styles.css")), "@shopify/polaris-tokens (light only)");
});
tryRun("Twilio Paste", () => {
  const map = { page: "--color-background-body", surface: "--color-background-weak", sunken: "--color-background", hover: "--color-background-strong", borderSubtle: "--color-border-weaker", borderStrong: "--color-border", fill: "--color-background-primary", text: "--color-text", textMuted: "--color-text-weak" };
  record("Twilio Paste", "light", map, fromCss(read("@twilio-paste/design-tokens/dist/tokens.custom-properties.css")), "@twilio-paste/design-tokens");
  record("Twilio Paste", "dark", map, fromCss(read("@twilio-paste/design-tokens/dist/themes/dark/tokens.custom-properties.css")), "@twilio-paste/design-tokens");
});
tryRun("SAP Fiori Horizon", () => {
  const map = { page: "--sapBackgroundColor", surface: "--sapGroup_ContentBackground", sunken: "--sapShell_Background", hover: "--sapList_Hover_Background", pressed: "--sapList_Active_Background", selected: "--sapList_SelectionBackgroundColor", borderSubtle: "--sapList_BorderColor", borderStrong: "--sapField_BorderColor", fill: "--sapButton_Emphasized_Background", text: "--sapTextColor", textMuted: "--sapContent_LabelColor" };
  for (const [mode, theme] of [["light", "sap_horizon"], ["dark", "sap_horizon_dark"]]) record("SAP Fiori Horizon", mode, map, fromCss(read(`@sap-theming/theming-base-content/content/Base/baseLib/${theme}/css_variables.css`)), "@sap-theming/theming-base-content");
});
tryRun("Red Hat PatternFly", () => {
  const p = "@patternfly/patternfly/base/tokens/";
  const map = { page: "--pf-t--global--background--color--secondary--default", surface: "--pf-t--global--background--color--primary--default", hover: "--pf-t--global--background--color--primary--hover", sunken: "--pf-t--global--background--color--tertiary--default", borderSubtle: "--pf-t--global--border--color--subtle", borderStrong: "--pf-t--global--border--color--default", fill: "--pf-t--global--color--brand--default", text: "--pf-t--global--text--color--regular", textMuted: "--pf-t--global--text--color--subtle" };
  record("Red Hat PatternFly", "light", map, fromCss(read(p + "tokens-default.scss", p + "tokens-palette.scss")), "@patternfly/patternfly tokens");
  record("Red Hat PatternFly", "dark", map, fromCss(read(p + "tokens-dark.scss", p + "tokens-palette.scss")), "@patternfly/patternfly tokens");
});
tryRun("Bootstrap", () => {
  const css = read("bootstrap/dist/css/bootstrap.css");
  const darkBlock = css.slice(css.indexOf('[data-bs-theme=dark]')); const root = css.slice(css.indexOf(":root"));
  const map = { page: "--bs-body-bg", surface: "--bs-tertiary-bg", sunken: "--bs-secondary-bg", borderSubtle: "--bs-border-color-translucent", borderStrong: "--bs-border-color", fill: "--bs-primary", text: "--bs-body-color", textMuted: "--bs-secondary-color" };
  record("Bootstrap", "light", map, fromCss(root), "bootstrap 5 CSS variables");
  record("Bootstrap", "dark", map, fromCss(darkBlock + "\n" + root), "bootstrap 5 CSS variables");
});
tryRun("Workday Canvas", () => {
  const map = { page: "--cnvs-sys-color-bg-default", surface: "--cnvs-sys-color-surface-raised", sunken: "--cnvs-sys-color-bg-alt-default", hover: "--cnvs-sys-color-surface-overlay-hover-default", pressed: "--cnvs-sys-color-surface-overlay-pressed-default", borderSubtle: "--cnvs-sys-color-border-divider", borderStrong: "--cnvs-sys-color-border-input-default", fill: "--cnvs-sys-color-bg-primary-default", text: "--cnvs-sys-color-fg-default", textMuted: "--cnvs-sys-color-fg-muted-default" };
  record("Workday Canvas", "light", map, fromCss(read("@workday/canvas-tokens-web/css/system/_variables.css", "@workday/canvas-tokens-web/css/base/_variables.css", "@workday/canvas-tokens-web/css/brand/_variables.css")), "@workday/canvas-tokens-web (light only)");
});
tryRun("GOV.UK", () => {
  const map = { page: "--govuk-body-background-colour", surface: "--govuk-surface-background-colour", hover: "--govuk-hover-colour", borderSubtle: "--govuk-border-colour", borderStrong: "--govuk-input-border-colour", fill: "--govuk-brand-colour", text: "--govuk-text-colour", textMuted: "--govuk-secondary-text-colour" };
  record("GOV.UK", "light", map, fromCss(read("govuk-frontend/dist/govuk/govuk-frontend.min.css")), "govuk-frontend (light only)");
});
tryRun("Australian Government (AGDS)", () => {
  const src = read("@ag.ds-next/react/src/core/goldTheme.ts"); const v = Object.fromEntries([...src.matchAll(/(\w+): '([^']+)'/g)].map((m) => [m[1], m[2]]));
  const map = { page: "lightBackgroundBody", surface: "lightBackgroundShade", sunken: "lightBackgroundBodyAlt", selected: "lightSelectedMuted", borderSubtle: "lightBorderMuted", borderStrong: "lightBorder", fill: "lightForegroundAction", text: "lightForegroundText", textMuted: "lightForegroundMuted" };
  record("Australian Government (AGDS)", "light", map, (k) => v[k], "@ag.ds-next/react gold theme (light; its 'dark' palette is for brand-coloured sections, not dark mode)");
});
tryRun("IBM Carbon", () => {
  const t = require("@carbon/themes");
  const map = { page: "background", surface: "layer01", sunken: "layer02", hover: "layerHover01", pressed: "layerActive01", selected: "layerSelected01", borderSubtle: "borderSubtle01", borderStrong: "borderStrong01", fill: "interactive", text: "textPrimary", textMuted: "textSecondary" };
  for (const [mode, th] of [["light", "white"], ["light (g10)", "g10"], ["dark (g90)", "g90"], ["dark", "g100"]]) record("IBM Carbon", mode, map, (k) => t[th][k], "@carbon/themes");
});
tryRun("Microsoft Fluent 2", () => {
  const t = require("@fluentui/tokens");
  const map = { page: "colorNeutralBackground1", surface: "colorNeutralBackground2", sunken: "colorNeutralBackground3", hover: "colorNeutralBackground1Hover", pressed: "colorNeutralBackground1Pressed", selected: "colorNeutralBackground1Selected", borderSubtle: "colorNeutralStroke2", borderStrong: "colorNeutralStrokeAccessible", fill: "colorBrandBackground", text: "colorNeutralForeground1", textMuted: "colorNeutralForeground2" };
  for (const [mode, th] of [["light", "webLightTheme"], ["dark", "webDarkTheme"]]) record("Microsoft Fluent 2", mode, map, (k) => t[th][k], "@fluentui/tokens web themes");
});
tryRun("Ant Design", () => {
  const { theme } = require("antd");
  const map = { page: "colorBgLayout", surface: "colorBgContainer", sunken: "colorBgElevated", hover: "colorBgTextHover", pressed: "colorBgTextActive", selected: "controlItemBgActive", borderSubtle: "colorBorderSecondary", borderStrong: "colorBorder", fill: "colorPrimary", text: "colorText", textMuted: "colorTextSecondary" };
  record("Ant Design", "light", map, (k) => theme.getDesignToken()[k], "antd 5 design tokens");
  record("Ant Design", "dark", map, (k) => theme.getDesignToken({ algorithm: theme.darkAlgorithm })[k], "antd 5 design tokens, dark algorithm");
});
tryRun("Elastic EUI", () => {
  const map = { page: "euiPageBackgroundColor", surface: "euiColorBackgroundBasePlain", sunken: "euiColorBackgroundBaseSubdued", hover: "euiColorBackgroundBaseInteractiveHover", selected: "euiColorBackgroundBaseInteractiveSelect", borderSubtle: "euiColorBorderBaseSubdued", borderStrong: "euiFormBorderColor", fill: "euiColorBackgroundFilledPrimary", text: "euiColorTextParagraph", textMuted: "euiColorTextSubdued" };
  for (const mode of ["light", "dark"]) { const j = require("./" + nm(`@elastic/eui-theme-borealis/lib/eui_theme_borealis_${mode}.json`)); record("Elastic EUI", mode, map, (k) => j[k], "@elastic/eui-theme-borealis"); }
});
tryRun("Adobe Spectrum", () => {
  const al = require("./" + nm("@adobe/spectrum-tokens/src/color-aliases.json")), pal = require("./" + nm("@adobe/spectrum-tokens/src/color-palette.json")), sem = require("./" + nm("@adobe/spectrum-tokens/src/semantic-color-palette.json"));
  const all = { ...pal, ...sem, ...al };
  const val = (name, mode, d = 0) => { const t = all[name]; if (!t || d > 10) return null; let v = t.sets ? (t.sets[mode] ?? t.sets.light)?.value ?? null : t.value; if (v && typeof v === "object" && v.sets) v = (v.sets[mode] ?? v.sets.light).value; if (typeof v === "string" && v.startsWith("{")) return val(v.slice(1, -1), mode, d + 1); return v; };
  const map = { page: "background-base-color", surface: "background-layer-2-color", sunken: "background-layer-1-color", hover: "gray-100", borderSubtle: "gray-200", borderStrong: "gray-500", fill: "accent-background-color-default", text: "neutral-content-color-default", textMuted: "neutral-subdued-content-color-default" };
  for (const mode of ["light", "dark"]) record("Adobe Spectrum", mode, map, (k) => val(k, mode), "@adobe/spectrum-tokens; hover and borders are palette steps, as Spectrum has no single neutral hover or border alias");
});
tryRun("Material 3", () => {
  // Material 3 roles are defined by tone, and HCT tone is CIE L*, so a grey of the same tone has the same
  // luminance and contrast. Tones from color_spec_2021.js (standard contrast). Hover and pressed are 8% and
  // 10% state layers of on-surface over the surface.
  const grey = (L) => { const y = L > 8 ? ((L + 16) / 116) ** 3 : L * 27 / 24389; const v = y <= 0.0031308 ? 12.92 * y : 1.055 * y ** (1 / 2.4) - 0.055; const h = Math.round(v * 255).toString(16).padStart(2, "0"); return "#" + h + h + h; };
  const tones = { light: { page: 98, surface: 96, sunken: 92, selected: 90, borderSubtle: 80, borderStrong: 50, fill: 40, text: 10, textMuted: 30 }, dark: { page: 6, surface: 10, sunken: 17, selected: 30, borderSubtle: 30, borderStrong: 60, fill: 80, text: 90, textMuted: 80 } };
  for (const mode of ["light", "dark"]) {
    const v = Object.fromEntries(Object.entries(tones[mode]).map(([u, t]) => [u, grey(t)]));
    v.hover = v.text + "14"; v.pressed = v.text + "1A";
    record("Material 3", mode, Object.fromEntries(Object.keys(v).map((k) => [k, k])), (k) => v[k], "Material 3 role tones (color_spec_2021.js), as greys of the same L*; hover and pressed are 8% and 10% state layers");
  }
});
tryRun("Radix", () => {
  const r = require("@radix-ui/colors");
  const steps = { page: 1, surface: 2, sunken: 3, hover: 4, pressed: 5, borderSubtle: 6, borderStrong: 8, text: 12, textMuted: 11 };
  for (const [mode, sfx] of [["light", ""], ["dark", "Dark"]]) {
    const v = Object.fromEntries(Object.entries(steps).map(([u, n]) => [u, r["slate" + sfx]["slate" + n]])); v.fill = r["blue" + sfx].blue9;
    record("Radix", mode, Object.fromEntries(Object.keys(v).map((k) => [k, k])), (k) => v[k], "@radix-ui/colors, using the documented purpose of each step (slate for neutrals, blue 9 for the fill)");
  }
});
tryRun("Chakra UI", () => {
  const tok = read("@chakra-ui/react/dist/esm/theme/tokens/colors.js");
  const base = {}; let fam = null;
  for (const line of tok.split("\n")) { const f = line.match(/^  (\w+): \{\s*$/); if (f) fam = f[1]; const v = line.match(/^\s+(\w+): \{ value: "([^"]+)" \}/); if (v && fam) base[`${fam}.${v[1]}`] = v[2]; const t = line.match(/^  (\w+): \{ value: "([^"]+)" \}/); if (t) base[t[1]] = t[2]; }
  const sem = { page: ["white", "black"], surface: ["gray.50", "gray.950"], sunken: ["gray.100", "gray.900"], hover: ["gray.100", "gray.900"], pressed: ["gray.200", "gray.800"], borderSubtle: ["gray.200", "gray.800"], borderStrong: ["gray.300", "gray.700"], fill: ["gray.900", "white"], text: ["black", "gray.50"], textMuted: ["gray.600", "gray.400"] };
  for (const [mode, i] of [["light", 0], ["dark", 1]]) record("Chakra UI", mode, Object.fromEntries(Object.keys(sem).map((k) => [k, k])), (k) => base[sem[k][i]], "@chakra-ui/react v3 semantic tokens (bg, bg.subtle, bg.muted, bg.emphasized, border, border.emphasized, gray.solid, fg, fg.muted)");
});
tryRun("Apple (iOS)", () => {
  // From the Human Interface Guidelines' Color specifications (system greys and blue), fetched 29 Oct 2026.
  // Roles are approximate: Apple documents the greys' values but not which grey each role uses.
  const v = {
    light: { page: "rgb(255,255,255)", surface: "rgb(242,242,247)", sunken: "rgb(229,229,234)", borderSubtle: "rgb(209,209,214)", borderStrong: "rgb(142,142,147)", fill: "rgb(0,136,255)", text: "rgb(0,0,0)" },
    dark: { page: "rgb(0,0,0)", surface: "rgb(28,28,30)", sunken: "rgb(44,44,46)", borderSubtle: "rgb(58,58,60)", borderStrong: "rgb(142,142,147)", fill: "rgb(0,145,255)", text: "rgb(255,255,255)" },
    "light, high contrast": { page: "rgb(255,255,255)", surface: "rgb(235,235,240)", sunken: "rgb(216,216,220)", borderSubtle: "rgb(188,188,192)", borderStrong: "rgb(108,108,112)", fill: "rgb(30,110,244)", text: "rgb(0,0,0)" },
    "dark, high contrast": { page: "rgb(0,0,0)", surface: "rgb(36,36,38)", sunken: "rgb(54,54,56)", borderSubtle: "rgb(68,68,70)", borderStrong: "rgb(174,174,178)", fill: "rgb(92,184,255)", text: "rgb(255,255,255)" },
  };
  for (const [mode, row] of Object.entries(v)) record("Apple (iOS)", mode, Object.fromEntries(Object.keys(row).map((k) => [k, k])), (k) => row[k], "Apple HIG Color specifications: system greys 6, 5, 4 and gray, and blue; roles approximate");
});
tryRun("MUI (Material UI)", () => {
  const { createTheme } = require("@mui/material/styles");
  for (const mode of ["light", "dark"]) {
    const p = createTheme({ palette: { mode } }).palette;
    const v = { page: p.background.default, surface: p.background.paper, hover: p.action.hover, selected: p.action.selected, pressed: p.action.focus, borderSubtle: p.divider, borderStrong: mode === "light" ? "rgba(0, 0, 0, 0.23)" : "rgba(255, 255, 255, 0.23)", fill: p.primary.main, text: p.text.primary, textMuted: p.text.secondary };
    record("MUI (Material UI)", mode, Object.fromEntries(Object.keys(v).map((k) => [k, k])), (k) => v[k], "@mui/material createTheme defaults; the strong border is the outlined input border MUI hard-codes at 23%; in dark mode, MUI lightens paper by elevation overlays, not measured here");
  }
});
tryRun("shadcn/ui", () => {
  const css = readFileSync("sources/shadcn-globals.css", "utf8");
  const root = css.slice(css.indexOf(":root {")), dark = css.slice(css.indexOf(".dark {"));
  const map = { page: "--background", surface: "--card", sunken: "--muted", hover: "--accent", borderSubtle: "--border", borderStrong: "--input", fill: "--primary", text: "--foreground", textMuted: "--muted-foreground" };
  record("shadcn/ui", "light", map, fromCss(root), "shadcn/ui v4 site theme (apps/v4/app/globals.css on GitHub, main branch, 29 Oct 2026); hover is the accent token used for ghost-button and menu hovers");
  record("shadcn/ui", "dark", map, fromCss(dark), "shadcn/ui v4 site theme");
});
tryRun("Mantine", () => {
  const v = { light: { page: "#fff", surface: "#fff", hover: "#f8f9fa", borderSubtle: "#dee2e6", borderStrong: "#ced4da", fill: "#228be6", text: "#000", textMuted: "#868e96" }, dark: { page: "#242424", surface: "#2e2e2e", hover: "#3b3b3b", borderSubtle: "#424242", borderStrong: "#424242", fill: "#1971c2", text: "#c9c9c9", textMuted: "#828282" } };
  for (const [mode, row] of Object.entries(v)) record("Mantine", mode, Object.fromEntries(Object.keys(row).map((k) => [k, k])), (k) => row[k], "@mantine/core styles.css: body, default, default-hover, gray-3 or dark-4 (borders), default-border, blue-filled, text, dimmed");
});
tryRun("daisyUI", () => {
  const map = { page: "--color-base-100", surface: "--color-base-200", sunken: "--color-base-300", fill: "--color-primary", text: "--color-base-content" };
  for (const mode of ["light", "dark"]) record("daisyUI", mode, map, fromCss(read(`daisyui/theme/${mode}.css`)), "daisyui 5 themes; borders and muted text are made with opacity in components, so not measured");
});
tryRun("Uber Base Web", () => {
  for (const [mode, f, k] of [["light", "light", "LightTheme"], ["dark", "dark", "DarkTheme"]]) {
    const c = require(`./node_modules/baseui/themes/${f}-theme/${f}-theme.js`)[k].colors;
    const map = { page: "backgroundPrimary", surface: "backgroundSecondary", sunken: "backgroundTertiary", hover: "buttonTertiaryHover", pressed: "buttonTertiaryActive", borderSubtle: "borderOpaque", borderStrong: "inputBorder", fill: "buttonPrimaryFill", text: "contentPrimary", textMuted: "contentSecondary" };
    record("Uber Base Web", mode, map, (n) => c[n], "baseui themes; inputs are filled, so their border is nearly invisible");
  }
});
tryRun("Zendesk Garden", () => {
  const z = require("@zendeskgarden/react-theming"); const T = z.DEFAULT_THEME;
  const map = { page: "background.default", surface: "background.subtle", sunken: "background.recessed", borderSubtle: "border.subtle", borderStrong: "border.default", fill: "background.primaryEmphasis", text: "foreground.default", textMuted: "foreground.subtle" };
  for (const mode of ["light", "dark"]) record("Zendesk Garden", mode, map, (variable) => z.getColor({ theme: { ...T, colors: { ...T.colors, base: mode } }, variable }), "@zendeskgarden/react-theming v9 colour variables");
});
tryRun("Salesforce Lightning (SLDS)", () => {
  const map = { page: "--slds-g-color-surface-2", surface: "--slds-g-color-surface-container-1", sunken: "--slds-g-color-surface-container-3", borderSubtle: "--slds-g-color-border-1", borderStrong: "--slds-g-color-border-2", fill: "--slds-g-color-brand-base-50", text: "--slds-g-color-on-surface-3", textMuted: "--slds-g-color-on-surface-1" };
  record("Salesforce Lightning (SLDS)", "light", map, fromCss(read("@salesforce-ux/design-system/assets/styles/salesforce-lightning-design-system.css")), "@salesforce-ux/design-system global styling hooks (light only)");
});
writeFileSync("uses.json", JSON.stringify(out, null, 1));
for (const [s, d] of Object.entries(out)) for (const [m, row] of Object.entries(d.modes)) {
  const miss = Object.entries(row).filter(([, x]) => !x.value).map(([u]) => u);
  console.log(s.padEnd(30), m.padEnd(12), Object.keys(row).length - miss.length, "found", miss.length ? "missing: " + miss.join(",") : "");
}
