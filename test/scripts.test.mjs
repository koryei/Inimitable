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
  for (const expected of ['Gradient text', 'Hue-to-hue gradient', 'Coloured glow', 'Emoji in the interface', 'Hype word', 'Unverified claim', 'Heavy heading', 'Looping animation', 'transition: all', 'Exclamation mark', 'Vague button label', 'Vague error message']) {
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
  assert.ok(kinds.has('focus'), 'a button with outline:none and no replacement');
  assert.ok(kinds.has('layout shift'), 'an image with no reserved size');
});

const clean = fileURLToPath(new URL('./fixtures/clean.html', import.meta.url));

test('a clean page passes signs and check', { skip }, async () => {
  assert.deepEqual(await scan(clean), []);
  const results = await check(clean, [390, 1440]);
  for (const r of results) assert.deepEqual(r.problems, [], JSON.stringify(r.problems));
});

test('contrast is read from the rendered pixels, so siblings and pseudo-elements count', { skip }, async () => {
  const [desktop] = await check(fileURLToPath(new URL('./fixtures/sibling-backdrop.html', import.meta.url)), [1440]);
  const contrast = desktop.problems.filter((p) => p.kind === 'contrast');
  assert.equal(contrast.length, 1, JSON.stringify(contrast));
  assert.match(contrast[0].detail, /Yearly/);
});

test('text covered by a fixed bar is not judged against the bar', { skip }, async () => {
  const [desktop] = await check(fileURLToPath(new URL('./fixtures/occluded.html', import.meta.url)), [1440]);
  assert.deepEqual(desktop.problems.filter((p) => p.kind === 'contrast'), []);
});

test('a direction can license named tells with --allow, and nothing else', { skip }, async () => {
  const all = await scan(fixture);
  const licensed = await scan(fixture, 1440, { allow: ['Uppercase tracked label', 'Emoji in the interface'] });
  assert.ok(all.some((f) => f.tell === 'Uppercase tracked label'));
  assert.ok(!licensed.some((f) => f.tell === 'Uppercase tracked label'));
  assert.ok(licensed.some((f) => f.tell === 'Gradient text'), 'unlicensed tells remain');
});
