import assert from 'node:assert/strict';
import { test } from 'node:test';
import { asciiLines, bayer, contentBox, crop, downsample, ditherPath, ditherSvg, fieldFromImage, floydSteinberg, halftoneSvg, lit, orderedDither, stipple } from './dither.mjs';
import { bars, disc, gradient, makeField, mul, terrain } from './fields.mjs';

const flat = (v, w = 16, h = 16) => makeField(w, h, () => v);

test('bayer matrices have every threshold once', () => {
  const m = bayer(4).flat().sort((a, b) => a - b);
  assert.deepEqual(m, Array.from({ length: 16 }, (_, i) => i));
});

test('dithering reproduces overall brightness', () => {
  for (const v of [0.25, 0.5, 0.75]) {
    assert.ok(Math.abs(lit(orderedDither(flat(v, 32, 32))) - v) < 0.06, `ordered ${v}`);
    assert.ok(Math.abs(lit(floydSteinberg(flat(v, 32, 32))) - v) < 0.06, `fs ${v}`);
    assert.ok(Math.abs(lit(stipple(flat(v, 64, 64), { seed: 2 })) - v) < 0.06, `stipple ${v}`);
  }
});

test('black stays empty and white stays full', () => {
  assert.equal(lit(orderedDither(flat(0))), 0);
  assert.equal(lit(orderedDither(flat(1))), 1);
});

test('stipple is deterministic for a seed', () => {
  const f = gradient(24, 24);
  assert.deepEqual(stipple(f, { seed: 3 }).data, stipple(f, { seed: 3 }).data);
  assert.notDeepEqual(stipple(f, { seed: 3 }).data, stipple(f, { seed: 4 }).data);
});

test('a lit run becomes one rectangle, not one per cell', () => {
  const d = ditherPath({ width: 6, height: 2, data: Uint8Array.from([1, 1, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0]) }, { cell: 4 });
  assert.equal((d.match(/M/g) || []).length, 2);
  assert.match(d, /^M0 0h12v4h-12z/);
});

test('the svg is aria-hidden unless it has a label', () => {
  const g = orderedDither(disc(20, 20));
  assert.match(ditherSvg(g), /aria-hidden="true"/);
  assert.match(ditherSvg(g, { label: 'A jet' }), /role="img"/);
});

test('an image becomes a field and downsamples', () => {
  const image = { width: 4, height: 4, data: new Uint8Array(4 * 4 * 4).fill(255) };
  const f = fieldFromImage(image);
  assert.equal(f.data[0], 1);
  assert.equal(downsample(f, 2).width, 2);
  assert.ok(fieldFromImage(image, { invert: true }).data[0] < 1e-6);
});

test('halftone makes bigger dots where it is darker', () => {
  const svg = halftoneSvg(gradient(60, 60, { from: 0, to: 1, angle: 0 }), { cell: 6 });
  const radii = [...svg.matchAll(/cx="([\d.]+)" cy="[\d.]+" r="([\d.]+)"/g)].map((m) => [Number(m[1]), Number(m[2])]);
  const left = radii.filter(([x]) => x < 15).map(([, r]) => r);
  const right = radii.filter(([x]) => x > 45).map(([, r]) => r);
  assert.ok(Math.max(...left) > Math.max(...right));
});

test('ascii maps dark to dense characters', () => {
  const lines = asciiLines(flat(0, 32, 32), { cell: 8 });
  assert.ok(lines.length > 0);
  assert.match(lines[0], /^@+$/);
  assert.match(asciiLines(flat(1, 32, 32), { cell: 8 })[0], /^ +$/);
});

test('fields are in 0..1 and combine', () => {
  const t = terrain(20, 20, { seed: 2 });
  assert.ok(t.data.every((v) => v >= 0 && v <= 1));
  assert.ok(mul(disc(20, 20), t).data.every((v) => v >= 0 && v <= 1));
  assert.equal(bars(10, 10, [1, 0, 1]).data[9 * 10], 1);
});

test('the content box finds the subject and crop cuts it out', () => {
  const f = makeField(20, 20, (_u, _v, x, y) => (x >= 5 && x < 12 && y >= 8 && y < 15 ? 0 : 1));
  const box = contentBox(f, { margin: 0 });
  assert.deepEqual(box, { x: 5, y: 8, w: 7, h: 7 });
  const c = crop(f, box);
  assert.equal(c.width, 7);
  assert.ok(c.data.every((v) => v === 0));
});

import { graticule, sphere } from './fields.mjs';

test('a sphere is lit on the side facing the light and empty outside', () => {
  const s = sphere(80, 80, { r: 0.4, light: [-1, 0, 0.3] });
  assert.equal(s.data[0], 0); // a corner is outside the sphere
  assert.ok(s.data[40 * 80 + 24] > s.data[40 * 80 + 56], 'the left of the sphere is brighter than the right');
});

test('a graticule draws thin lines inside the sphere only', () => {
  const g = graticule(80, 80, { r: 0.4 });
  assert.equal(g.data[0], 0);
  const lit = g.data.reduce((a, b) => a + b, 0);
  assert.ok(lit > 20 && lit < 1500, String(lit));
});
