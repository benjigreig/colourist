// Loaded under a strict content security policy (no 'unsafe-eval'). Imports one candidate and validates two inputs.
const name = new URLSearchParams(location.search).get("c");
const violations = [];
document.addEventListener("securitypolicyviolation", (e) => violations.push(`${e.violatedDirective}: ${e.blockedURI}`));
try {
  const samples = await (await fetch("/csp/samples.json")).json();
  const mod = await import(`/dist/${name}.js`);
  const good = await mod.validate(samples.valid);
  const bad = await mod.validate(samples.badHex);
  window.result = { loaded: true, validAccepted: good.ok, badRejected: !bad.ok, violations };
} catch (e) { window.result = { loaded: false, error: String(e && e.message || e).slice(0, 200), violations }; }
