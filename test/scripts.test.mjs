// Integration tests: run the scripts against the fixture in a real browser. Skipped without Chrome.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { check } from '../scripts/check.mjs';
import { measure } from '../scripts/drift.mjs';
import { findChrome } from '../scripts/lib/chrome.mjs';
import { scan } from '../scripts/signs.mjs';

const fixture = fileURLToPath(new URL('./fixtures/sloppy.html', import.meta.url));
const skip = findChrome() ? false : 'no Chrome installed';

test('signs finds the tells planted in the fixture', { skip }, async () => {
  const found = await scan(fixture);
  const tells = new Set(found.map((f) => f.tell));
  for (const expected of ['Gradient text', 'Hue-to-hue gradient', 'Coloured glow', 'Emoji in the interface', 'Hype word', 'Unverified claim', 'Heavy heading', 'Looping animation', 'transition: all', 'Exclamation mark']) {
    assert.ok(tells.has(expected), `missing: ${expected}`);
  }
});

test('drift flags heavy weights, tiny text and off-grid spacing', { skip }, async () => {
  const report = await measure(fixture);
  assert.ok(report.flags.some((f) => /900/.test(f)));
  assert.ok(report.flags.some((f) => /smaller than 12/.test(f)));
  assert.ok(report.spacing.onGridShare < 0.5);
});

test('check finds low contrast, a small target and sideways scroll on a phone', { skip }, async () => {
  const [phone] = await check(fixture, [390]);
  const kinds = new Set(phone.problems.map((p) => p.kind));
  assert.ok(kinds.has('contrast'));
  assert.ok(kinds.has('touch target'));
  assert.ok(kinds.has('layout'));
});

const clean = fileURLToPath(new URL('./fixtures/clean.html', import.meta.url));

test('a clean page passes signs and check', { skip }, async () => {
  assert.deepEqual(await scan(clean), []);
  const results = await check(clean, [390, 1440]);
  for (const r of results) assert.deepEqual(r.problems, [], JSON.stringify(r.problems));
});
