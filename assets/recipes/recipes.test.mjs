import assert from 'node:assert/strict';
import { test } from 'node:test';
import { contourPaths, contourSvg, smoothPath, stitch } from './contours.mjs';
import { dotField, fadeRight } from './dots.mjs';
import { rng, valueNoise } from './noise.mjs';
import { blobPath, speckles, stoneStack } from './shapes.mjs';

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
  const nums = a[0].d.match(/-?\d+/g).map(Number);
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

test('stitching joins touching segments into one line', () => {
  const lines = stitch([[[0, 0], [1, 0]], [[1, 0], [2, 1]], [[2, 1], [3, 1]], [[10, 10], [11, 10]]]);
  assert.equal(lines.length, 2);
  assert.equal(lines.find((l) => l.length === 4).length, 4);
  assert.match(smoothPath([[0, 0], [1, 0], [2, 1], [3, 1]]), /^M0 0Q/);
});

test('contours come out as few long lines, not thousands of segments', () => {
  const [first] = contourPaths({ width: 600, height: 400, seed: 4, levels: 6 });
  assert.ok(first.lines < 60, `lines ${first.lines}`);
  assert.ok(first.d.length < 20000, `size ${first.d.length}`);
});

import { PROFILES, radiusAt, shade, vesselSvg } from './revolve.mjs';

test('the radius follows the profile at its control points', () => {
  assert.ok(Math.abs(radiusAt(PROFILES.amphora, 0.5) - 1) < 0.05);
  assert.ok(radiusAt(PROFILES.amphora, 0.86) < radiusAt(PROFILES.amphora, 0.5));
});

test('shade lightens and darkens', () => {
  assert.notEqual(shade('#808080', 0.2), shade('#808080', -0.2));
  assert.ok(parseInt(shade('#808080', 0.2).slice(1, 3), 16) > 0x80);
  assert.ok(parseInt(shade('#808080', -0.2).slice(1, 3), 16) < 0x80);
});

test('a vessel is deterministic, uses one gradient, and is aria-hidden', () => {
  const a = vesselSvg({ seed: 2, id: 'a' });
  assert.equal(a, vesselSvg({ seed: 2, id: 'a' }));
  assert.notEqual(a, vesselSvg({ seed: 3, id: 'a' }));
  assert.equal((a.match(/<linearGradient/g) || []).length, 1);
  assert.match(a, /aria-hidden="true"/);
  assert.doesNotMatch(a, /animate|filter/i);
});

test('a vessel silhouette follows the profile and stays inside its box', () => {
  const svg = vesselSvg({ profile: PROFILES.amphora, height: 300, maxRadius: 100, id: 'z' });
  const view = svg.match(/viewBox="0 0 (\d+) (\d+)"/).map(Number);
  const d = svg.match(/<path d="(M[^"]+)" fill="url/)[1];
  const xs = [...d.matchAll(/[ML](-?\d+\.\d) (-?\d+\.\d)/g)].map((m) => Number(m[1]));
  assert.ok(Math.min(...xs) >= 0 && Math.max(...xs) <= view[1], `${Math.min(...xs)} to ${Math.max(...xs)} in ${view[1]}`);
  assert.ok(Math.max(...xs) - Math.min(...xs) > 150, 'the widest point is about the full width');
  assert.ok(new Set(xs.map((x) => x.toFixed(0))).size > 20, 'the sides curve, they are not straight');
});

test('speckles stay inside the ellipse and are deterministic', () => {
  const a = speckles({ cx: 0, cy: 0, rx: 40, ry: 12, count: 20, seed: 4 });
  assert.deepEqual(a, speckles({ cx: 0, cy: 0, rx: 40, ry: 12, count: 20, seed: 4 }));
  for (const s of a) assert.ok((s.x / 40) ** 2 + (s.y / 12) ** 2 <= 1, JSON.stringify(s));
});

test('a flat base squashes the underside', () => {
  const round = blobPath({ rx: 40, ry: 20, seed: 2, wobble: 0 });
  const flat = blobPath({ rx: 40, ry: 20, seed: 2, wobble: 0, flatBase: 0.5 });
  assert.notEqual(round, flat);
});
