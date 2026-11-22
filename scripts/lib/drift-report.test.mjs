import assert from 'node:assert/strict';
import { test } from 'node:test';
import { analyse, compare, hueBands } from './drift-report.mjs';

const base = { fontSizes: { 14: 10, 16: 4 }, fontWeights: { 400: 12, 500: 2 }, fontFamilies: { Inter: 14 }, radii: { 8: 3 }, spacing: { 8: 5, 16: 5 }, textColors: { '#ededed': 10 }, surfaceColors: { '#141415': 3 }, borderColors: { '#ededed@8%': 4 }, elements: 20, textElements: 14 };

test('a tidy page has no flags', () => {
  assert.deepEqual(analyse(base).flags, []);
});

test('off-grid spacing, heavy weights and tiny text are flagged', () => {
  const report = analyse({ ...base, fontSizes: { 10: 1, 14: 5 }, fontWeights: { 400: 3, 900: 1 }, spacing: { 8: 2, 13: 5 } });
  const text = report.flags.join(' | ');
  assert.match(text, /smaller than 12/);
  assert.match(text, /900/);
  assert.match(text, /off-grid spacing: 13/);
  assert.ok(report.spacing.onGridShare < 0.5);
});

test('a 2 px step is allowed', () => {
  const report = analyse({ ...base, spacing: { 2: 6, 8: 4 } });
  assert.equal(report.spacing.onGridShare, 1);
  assert.deepEqual(report.flags, []);
});

test('hue bands ignore greys and group by 30 degrees', () => {
  assert.deepEqual(hueBands({ '#808080': 3, '#8b5cf6': 2, '#a78bfa': 1 }), { 240: 3 });
});

test('compare reports before and after per metric', () => {
  const before = analyse({ ...base, fontSizes: { 10: 1, 11: 1, 12: 1, 13: 1, 14: 1, 16: 1, 18: 1, 20: 1 } });
  const after = analyse(base);
  const row = compare(before, after).find((r) => r.metric === 'sizes');
  assert.deepEqual(row, { metric: 'sizes', before: 8, after: 2 });
});
