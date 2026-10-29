# Framework spike (CLR-5)

Evidence behind [ADR 0003](../../adr/0003-front-end-framework.md). The same two stages of the guided flow, brand colours (US-01) and choosing a ladder (US-02), built twice: once in **Svelte 5** and once in **Preact with signals**. This folder is research, not product code.

## What's shared and what isn't

| Folder | Layer | Shared? |
|---|---|---|
| `core/` | State, logic and colour maths, in plain TypeScript | Yes, both apps import it unchanged |
| `styles/` | The visual layer (CSS) | Yes, both apps use the same file |
| `svelte/` | The Svelte view layer and build | Svelte only |
| `preact/` | The Preact view layer and build | Preact only |

Keeping the core and styles shared means the comparison is about the framework alone (D-010). The 11-step and 15-step ladders in `core/config.ts` are placeholders; the real presets are decided in CLR-13.

## Running it

```bash
cd docs/research/framework
npm install
npm run check:core   # confirms the scales follow the step-counting rule
npm run build        # builds svelte/dist and preact/dist
node measure.mjs     # axe, keyboard, focus, timing and screenshots; writes results.json
```

`measure.mjs` uses Playwright, which needs to be installed separately (`npm install -D playwright` and `npx playwright install chromium`).

## Files

- `desk-research/`: the health measures for all six candidates, and the scripts that gathered them
- `results.json`: the measured results for both apps
- `screenshot-svelte.png`, `screenshot-preact.png`: both apps with the example brand at 1280 pixels wide
- `screenshot-svelte-320.png`, `screenshot-preact-320.png`: the same at 320 pixels wide

The example brand is invented and doesn't belong to any real organisation.
