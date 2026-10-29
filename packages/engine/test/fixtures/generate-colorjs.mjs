/**
 * Writes colorjs-0.7.1.json: reference conversions from Color.js, which is maintained by editors
 * of the CSS colour specifications, to cross-check the engine (CLR-12, D-047).
 *
 * Color.js is not a dependency of colouri.st. Install it somewhere else and pass its path, so it
 * never enters package.json:
 *
 *   npm install --prefix /tmp/colorjs --ignore-scripts colorjs.io@0.7.1
 *   node packages/engine/test/fixtures/generate-colorjs.mjs /tmp/colorjs/node_modules/colorjs.io
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const packageDir = process.argv[2];
if (!packageDir) {
  console.error('Pass the path to an installed colorjs.io package.');
  process.exit(1);
}
const { version } = JSON.parse(readFileSync(join(packageDir, 'package.json'), 'utf8'));
const { default: Color } = await import(pathToFileURL(join(packageDir, 'dist/color.js')).href);

// Every combination of six evenly spaced channel values (216 colours, greys included), plus
// colours from the invented brands in docs/research/colour-model.
const levels = ['00', '33', '66', '99', 'CC', 'FF'];
const hexes = [];
for (const r of levels) for (const g of levels) for (const b of levels) hexes.push(`#${r}${g}${b}`);
hexes.push('#1B548F', '#E4572E', '#17BEBB', '#FFC914', '#76B041', '#F4ACB7', '#9D8189', '#7F7F7F');

const round = (v) => (v === null || Number.isNaN(v) ? null : Number(v.toPrecision(12)));
const coords = (color, space) => color.to(space).coords.map(round);

const colors = hexes.map((hex) => {
  const color = new Color(hex);
  return {
    hex,
    xyz: coords(color, 'xyz-d65'),
    lab: coords(color, 'lab-d65'),
    oklab: coords(color, 'oklab'),
    oklch: coords(color, 'oklch'),
    hsl: coords(color, 'hsl'),
  };
});

// ΔE between neighbours in the list. Color.js's ΔE 2000 works in its own D50 Lab, so it is given
// our D65 Lab coordinates directly; the formula doesn't depend on the white.
const differences = colors.slice(1).map((sample, i) => {
  const reference = colors[i];
  const labA = new Color(
    'lab',
    reference.lab.map((v) => v ?? 0),
  );
  const labB = new Color(
    'lab',
    sample.lab.map((v) => v ?? 0),
  );
  return {
    reference: reference.hex,
    sample: sample.hex,
    deltaE2000: round(labA.deltaE2000(labB)),
    deltaEOk: round(new Color(reference.hex).deltaEOK(new Color(sample.hex))),
  };
});

// One entry per line, so a regenerated file diffs line by line.
const list = (items) => `[\n${items.map((item) => `    ${JSON.stringify(item)}`).join(',\n')}\n  ]`;
const out = join(import.meta.dirname, `colorjs-${version}.json`);
writeFileSync(
  out,
  `{\n  "source": "colorjs.io ${version}",\n  "colors": ${list(colors)},\n  "differences": ${list(differences)}\n}\n`,
);
console.log(`Wrote ${colors.length} colours and ${differences.length} differences to ${out}`);
