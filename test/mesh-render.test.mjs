// Render every shape in a real browser and look at the pixels: the ground must be lit (not flat), grained,
// and leave the calm part of the frame calm enough to put type on.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { SHAPE_NAMES, grainient } from '../assets/recipes/mesh.mjs';
import { findChrome, launch, openPage } from '../scripts/lib/chrome.mjs';
import { decodePng, pixelAt } from '../scripts/lib/png.mjs';

const skip = findChrome() ? false : 'no Chrome installed';

async function render(palette, shape, extra = {}) {
  const { css, palette: p } = grainient({ palette, shape, seed: 5, ...extra });
  // The ground sits on the page colour it fades into, so the frame is the palette's own base.
  const html = `<!doctype html><meta charset="utf-8"><style>html,body{margin:0;height:100%}body{position:relative;background:${p.base}}.frame{position:relative;width:1200px;height:700px;isolation:isolate;background:${p.base}}${css}</style><div class="frame"><div class="ground"></div></div>`;
  const chrome = await launch();
  try {
    const page = await openPage(chrome.browser, { width: 1200, height: 700 });
    await page.goto(`data:text/html;base64,${Buffer.from(html).toString('base64')}`, 200);
    return decodePng(await page.screenshot());
  } finally { await chrome.close(); }
}
const lum = ([r, g, b]) => 0.2126 * r + 0.7152 * g + 0.0722 * b;
function stats(image, step = 40) {
  const px = [];
  for (let y = 10; y < image.height; y += step) for (let x = 10; x < image.width; x += step) px.push(pixelAt(image, x, y));
  const sdOf = (vals) => { const m = vals.reduce((a, b) => a + b, 0) / vals.length; return Math.sqrt(vals.reduce((a, b) => a + (b - m) ** 2, 0) / vals.length); };
  const values = px.map(lum);
  // Variation of colour, not just brightness: a pastel glow on pale paper differs in hue, not in lightness.
  const sd = Math.max(sdOf(px.map((p) => p[0])), sdOf(px.map((p) => p[1])), sdOf(px.map((p) => p[2])));
  return { mean: values.reduce((a, b) => a + b, 0) / values.length, sd };
}

for (const shape of SHAPE_NAMES) {
  test(`the ${shape} ground is lit, not flat, on a light and on a dark palette`, { skip }, async () => {
    const light = stats(await render('ember', shape));
    const dark = stats(await render('dusk', shape));
    assert.ok(light.sd > 6, `light ${shape}: sd ${light.sd.toFixed(1)}`);
    assert.ok(dark.sd > 6, `dark ${shape}: sd ${dark.sd.toFixed(1)}`);
    assert.ok(light.mean > 150, `a light ground stays light, mean ${light.mean.toFixed(0)}`);
    assert.ok(dark.mean < 110, `a dark ground stays dark, mean ${dark.mean.toFixed(0)}`);
  });
}

test('grain is present: neighbouring pixels differ, but only a little', { skip }, async () => {
  const image = await render('ember', 'pools', { grain: 0.5 });
  let diff = 0, n = 0;
  for (let y = 300; y < 320; y++) for (let x = 500; x < 560; x++) { diff += Math.abs(lum(pixelAt(image, x, y)) - lum(pixelAt(image, x + 1, y))); n++; }
  const mean = diff / n;
  assert.ok(mean > 0.8, `grain should be there, mean neighbour difference ${mean.toFixed(2)}`);
  assert.ok(mean < 14, `grain should not read as a pattern, mean neighbour difference ${mean.toFixed(2)}`);
});

test('the bowl leaves the lower half calm for type, the horizon leaves the upper half calm', { skip }, async () => {
  const bowl = await render('midnight', 'bowl');
  const horizon = await render('midnight', 'horizon');
  const band = (img, y0, y1) => { let s = 0, n = 0; for (let y = y0; y < y1; y += 20) for (let x = 100; x < 1100; x += 40) { s += lum(pixelAt(img, x, y)); n++; } return s / n; };
  assert.ok(band(bowl, 520, 690) < band(bowl, 20, 190), 'bowl: bottom darker than top');
  assert.ok(band(horizon, 20, 190) < band(horizon, 520, 690), 'horizon: top darker than bottom');
});
