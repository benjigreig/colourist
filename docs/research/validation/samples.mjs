/** Test inputs shared by every candidate: one valid project and a set of invalid or hostile ones. */
export const valid = {
  format: "colourist-project", formatVersion: 1, rulesVersion: "1.0.0", engineVersion: "1.0.0",
  name: "Harbour example", target: "AA",
  colours: [
    { id: "harbour", name: "Harbour", group: "brand", value: "#1B548F" },
    { id: "wattle", name: "Wattle", group: "brand", value: "#E8B931" },
    { id: "eucalypt", name: "Eucalypt", group: "brand", value: "#6E9B84" },
    { id: "error", name: "Error", group: "feedback", value: "#C0392B" },
  ],
  overrides: { "ladder.preset": "13", "vividness.brand.ceiling": 0.9, "guidance.short": true },
};
/** The valid project as JSON text, as it would arrive. */
export const validText = JSON.stringify(valid);
/** Each case: a description, the raw JSON text (as it would arrive in a file or link), and whether it should pass. */
export const cases = [
  ["valid project", JSON.stringify(valid), true],
  ["bad hex value", JSON.stringify({ ...valid, colours: [{ ...valid.colours[0], value: "#12345" }] }), false],
  ["missing engine version", JSON.stringify((({ engineVersion, ...r }) => r)(valid)), false],
  ["unknown top-level property", JSON.stringify({ ...valid, extra: 1 }), false],
  ["__proto__ at top level", JSON.stringify(valid).replace("{", '{"__proto__":{"polluted":true},'), false],
  ["__proto__ inside overrides", JSON.stringify(valid).replace('"overrides":{', '"overrides":{"__proto__":{"polluted":true},'), false],
  ["constructor key in a colour", JSON.stringify({ ...valid, colours: [{ ...valid.colours[0], constructor: { prototype: { polluted: true } } }] }), false],
  ["colour with an extra toString key", '{"format":"colourist-project","formatVersion":1,"rulesVersion":"1.0.0","engineVersion":"1.0.0","colours":[{"id":"a","name":"A","group":"brand","value":"#000000","toString":"x"}]}', false],
  ["deeply nested override value (10,000 levels)", JSON.stringify({ ...valid, overrides: { deep: 0 } }).replace('"deep":0', '"deep":' + "[".repeat(10000) + "]".repeat(10000)), false],
  ["too many colours (100,000)", JSON.stringify({ ...valid, colours: Array.from({ length: 100000 }, (_, i) => ({ id: `c${i}`, name: "C", group: "brand", value: "#000000" })) }), false],
  ["very long name (1 MB)", JSON.stringify({ ...valid, name: "x".repeat(1_000_000) }), false],
  ["override with a badly formed name", JSON.stringify({ ...valid, overrides: { "Not A Setting": 1 } }), false],
  ["too many overrides (201)", JSON.stringify({ ...valid, overrides: Object.fromEntries(Array.from({ length: 201 }, (_, i) => [`setting${i}`, 1])) }), false],
  ["wrong type for colours", JSON.stringify({ ...valid, colours: "red" }), false],
];
