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

test('a serif display face plus a sans and a mono is fine; three proportional families are not', () => {
  assert.deepEqual(analyse({ ...base, fontFamilies: { Newsreader: 2, 'Instrument Sans': 12, 'JetBrains Mono': 3 } }).flags, []);
  assert.match(analyse({ ...base, fontFamilies: { Newsreader: 2, 'Instrument Sans': 12, Inter: 3 } }).flags.join(' '), /3 proportional/);
});

test('an accent plus red and green is not hue drift, five hues is', () => {
  const ok = analyse({ ...base, surfaceColors: { '#141415': 3, '#5fbf8f': 1, '#ff6369': 1, '#2b6cb0': 1 } });
  assert.deepEqual(ok.flags.filter((f) => /hues/.test(f)), []);
  const bad = analyse({ ...base, surfaceColors: { '#ff0000': 1, '#00ff00': 1, '#0000ff': 1, '#ffff00': 1, '#ff00ff': 1 } });
  assert.match(bad.flags.join(' '), /colour hues/);
});

test('a real hierarchy at the top does not count against the working scale, but too many display sizes does', () => {
  const sizes = { 12: 3, 14: 6, 16: 8, 20: 2, 28: 2, 56: 1, 96: 1, 160: 1 };
  assert.deepEqual(analyse({ ...base, fontSizes: sizes }).flags.filter((f) => /font sizes|display sizes/.test(f)), []);
  const many = { 12: 1, 14: 1, 16: 1, 18: 1, 20: 1, 24: 1, 28: 1, 32: 1 };
  assert.match(analyse({ ...base, fontSizes: many }).flags.join(' '), /8 working font sizes/);
  const display = { 14: 4, 48: 1, 64: 1, 96: 1, 128: 1, 192: 1 };
  assert.match(analyse({ ...base, fontSizes: display }).flags.join(' '), /5 display sizes/);
});
