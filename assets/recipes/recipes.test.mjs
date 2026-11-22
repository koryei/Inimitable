import assert from 'node:assert/strict';
import { test } from 'node:test';
import { contourPaths, contourSvg } from './contours.mjs';
import { dotField, fadeRight } from './dots.mjs';
import { rng, valueNoise } from './noise.mjs';
import { blobPath, stoneStack } from './shapes.mjs';

test('the same seed gives the same noise and a different seed differs', () => {
  assert.equal(valueNoise(5)(3.2, 4.1), valueNoise(5)(3.2, 4.1));
  assert.notEqual(valueNoise(5)(3.2, 4.1), valueNoise(6)(3.2, 4.1));
  assert.ok(rng(1)() >= 0 && rng(1)() < 1);
});

test('contours are deterministic, have several levels and stay in bounds', () => {
  const a = contourPaths({ width: 300, height: 200, seed: 4, levels: 8 });
  const b = contourPaths({ width: 300, height: 200, seed: 4, levels: 8 });
  assert.deepEqual(a, b);
  assert.ok(a.length >= 5);
  const nums = a[0].d.match(/-?\d+\.\d/g).map(Number);
  assert.ok(Math.min(...nums) >= -1 && Math.max(...nums) <= 311);
});

test('contour svg is aria-hidden and has no gradients or filters', () => {
  const svg = contourSvg({ width: 200, height: 120, seed: 2 });
  assert.match(svg, /aria-hidden="true"/);
  assert.doesNotMatch(svg, /gradient|filter|animate/i);
});

test('a blob is a closed smooth path', () => {
  const d = blobPath({ cx: 10, cy: 10, rx: 40, ry: 20, seed: 3 });
  assert.match(d, /^M[\d. -]+C/);
  assert.ok(d.endsWith('Z'));
});

test('a stone stack gets narrower toward the top', () => {
  const stones = stoneStack({ count: 5, width: 300, seed: 3 });
  assert.equal(stones.length, 5);
  assert.ok(stones[0].w > stones[4].w);
  assert.ok(stones[4].cy < stones[0].cy);
});

test('a dot field drops dots that would be too small to see', () => {
  const svg = dotField({ width: 100, height: 100, step: 10, radius: fadeRight(3) });
  const count = (svg.match(/<circle/g) || []).length;
  assert.ok(count > 10 && count < 100, String(count));
});
