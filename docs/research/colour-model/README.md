# Colour model comparison (CLR-4)

Analysis behind [ADR 0001](../../adr/0001-colour-model.md). This folder is research, not product code: it uses third-party libraries (Color.js and Material Color Utilities) only to compare models, and nothing here is imported by the engine.

## Files

- `compare.mjs`: builds the same ladder for three invented brands in five model variants and measures contrast by step distance, hue drift, gamut clipping and source fidelity. Writes `results.json`.
- `render.mjs`: renders `results.json` as a grey-chromed comparison sheet (`compare.html`).
- `results.json`: the measured results and every generated hex value.
- `pastel.png`, `saturated.png`, `close-hues.png`: the comparison sheets as images.

## Running it

```bash
cd docs/research/colour-model
npm init -y
npm install colorjs.io@0.5.2 @material/material-color-utilities@0.3.0
node compare.mjs
node render.mjs
```

Brand colours are invented for testing and don't belong to any real organisation.
