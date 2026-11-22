import assert from 'node:assert/strict';
import { test } from 'node:test';
import { callout, cornerBrackets, crosshair, frame, overlaySvg, readout, registration, ruler, tag } from './hud.mjs';

test('corner brackets draw four corners inside the box', () => {
  const svg = cornerBrackets({ x: 10, y: 20, w: 100, h: 40, size: 8 });
  assert.equal((svg.match(/M/g) || []).length, 4);
  assert.match(svg, /M18 20H10V28/);
});

test('crosshair and registration are plain shapes', () => {
  assert.match(crosshair({ x: 5, y: 5 }), /^<path/);
  assert.match(registration({ x: 5, y: 5 }), /<circle/);
});

test('a callout has a dot, a leader, a box, and escapes its text', () => {
  const svg = callout({ x: 100, y: 100, label: 'Wing <root>', sub: 'Example reading' });
  assert.match(svg, /<circle/);
  assert.match(svg, /Wing &lt;root>/);
  assert.match(svg, /Example reading/);
  assert.match(svg, /M100 100L/);
});

test('a left callout puts its box to the left of the anchor', () => {
  const svg = callout({ x: 300, y: 100, label: 'Left', side: 'left' });
  const box = Number(svg.match(/<rect x="([\d.-]+)"/)[1]);
  assert.ok(box < 300);
});

test('a ruler marks majors with numbers', () => {
  const svg = ruler({ x: 0, y: 0, length: 100, step: 10, major: 50 });
  assert.equal((svg.match(/<text/g) || []).length, 3);
});

test('a tag pads its number', () => {
  assert.match(tag({ x: 0, y: 0, n: 3 }), /\[03\]/);
});

test('a readout draws one line per row', () => {
  const svg = readout({ x: 0, y: 0, rows: [['ALT', '42 000 ft'], ['SPD', 'M 1.8']], title: 'Example reading' });
  assert.equal((svg.match(/<text/g) || []).length, 3);
});

test('a frame and an overlay are aria-hidden by default', () => {
  assert.match(frame({ x: 0, y: 0, w: 10, h: 10, cut: 3 }), /stroke-dasharray/);
  assert.match(overlaySvg({ width: 10, height: 10, children: [] }), /aria-hidden="true"/);
});
