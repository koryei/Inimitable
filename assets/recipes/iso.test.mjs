import assert from 'node:assert/strict';
import { test } from 'node:test';
import { explodedStack, isoBox, isoCircle, isoGrid, isoPlate, isoPoint } from './iso.mjs';

test('isometric projection moves right-down for x and left-down for y', () => {
  const [x1, y1] = isoPoint(10, 0, 0);
  const [x2, y2] = isoPoint(0, 10, 0);
  assert.ok(x1 > 0 && y1 > 0);
  assert.ok(x2 < 0 && y2 > 0);
  assert.equal(isoPoint(0, 0, 10)[1], -10);
});

test('a box has three faces', () => {
  const svg = isoBox({ w: 50, d: 30, h: 20 });
  assert.equal((svg.match(/<polygon/g) || []).length, 3);
});

test('a plate and a circle draw', () => {
  assert.match(isoPlate({ w: 40, d: 40 }), /<polygon/);
  assert.match(isoCircle({ x: 10, y: 10, r: 5 }), /<ellipse/);
});

test('the grid has a line for each division', () => {
  const svg = isoGrid({ cols: 4, rows: 3 });
  assert.equal((svg.match(/M/g) || []).length, 5 + 4);
});

test('an exploded stack draws every layer and joins them with dashes', () => {
  const svg = explodedStack({ layers: 4 });
  assert.equal((svg.match(/<polygon/g) || []).length, 12);
  assert.equal((svg.match(/stroke-dasharray/g) || []).length, 3);
});
