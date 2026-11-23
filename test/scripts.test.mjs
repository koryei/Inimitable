// Integration tests: run the scripts against the fixture in a real browser. Skipped without Chrome.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { check } from '../scripts/check.mjs';
import { craft } from '../scripts/craft.mjs';
import { measure } from '../scripts/drift.mjs';
import { findChrome, launch, openPage, toUrl } from '../scripts/lib/chrome.mjs';
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

test('a slow colour transition does not leave the text visible in the backdrop sample', { skip }, async () => {
  const [desktop] = await check(fileURLToPath(new URL('./fixtures/transition-text.html', import.meta.url)), [1440]);
  assert.deepEqual(desktop.problems.filter((p) => p.kind === 'contrast'), []);
});

test('text that is mid-way through an entrance animation is judged at its end state', { skip }, async () => {
  const [desktop] = await check(fileURLToPath(new URL('./fixtures/fade-in.html', import.meta.url)), [1440]);
  assert.deepEqual(desktop.problems.filter((p) => p.kind === 'contrast'), []);
});

test('craft finds a control that ignores the pointer, a reflowing transition and a loop that will not stop', { skip }, async () => {
  const [desktop] = await craft(fileURLToPath(new URL('./fixtures/craftless.html', import.meta.url)), { widths: [1440] });
  const kinds = new Set(desktop.problems.map((p) => p.kind));
  assert.ok(kinds.has('silent hover'), 'a button with no hover rule');
  assert.ok(kinds.has('layout transition'), 'a transition on padding');
  assert.ok(kinds.has('reduced motion'), 'an infinite animation that ignores the setting');
  const silent = desktop.problems.filter((p) => p.kind === 'silent hover').map((p) => p.where);
  assert.ok(!silent.includes('a.underlined'), 'a hover that only moves a pseudo-element still counts');
});

test('a clean page passes craft', { skip }, async () => {
  const [desktop] = await craft(clean, { widths: [1440] });
  assert.deepEqual(desktop.problems, []);
});

test('craft catches a hover that changes a style but not a pixel', { skip }, async () => {
  const [desktop] = await craft(fileURLToPath(new URL('./fixtures/hidden-hover.html', import.meta.url)), { widths: [1440] });
  const unseen = desktop.problems.filter((p) => p.kind === 'invisible hover').map((p) => p.where);
  assert.deepEqual(unseen, ['a.hidden'], 'the outline colour moves but the outline style is none, so nothing is painted');
});

test('an icon beside the text is not treated as the text backdrop', { skip }, async () => {
  const [desktop] = await check(fileURLToPath(new URL('./fixtures/icon-in-link.html', import.meta.url)), [1440]);
  assert.deepEqual(desktop.problems.filter((p) => p.kind === 'contrast'), []);
});

test('a copyright sign is not an emoji, and an audited ground is not a hue gradient', { skip }, async () => {
  const found = await scan(fileURLToPath(new URL('./fixtures/ground-and-copyright.html', import.meta.url)));
  assert.deepEqual(found.map((f) => f.tell), []);
});

test('placeholder markers are reported until they are replaced', { skip }, async () => {
  const found = await scan(fileURLToPath(new URL('./fixtures/ground-and-copyright.html', import.meta.url)).replace('ground-and-copyright', 'placeholder-left'));
  assert.ok(found.some((f) => f.tell === 'Unfinished placeholder'));
});

test('decorative aria-hidden text is exempt from contrast, real faint text is not', { skip }, async () => {
  const [a] = await check(fileURLToPath(new URL('./fixtures/decorative-text.html', import.meta.url)), [1440]);
  assert.deepEqual(a.problems.filter((p) => p.kind === 'contrast'), []);
  const [b] = await check(fileURLToPath(new URL('./fixtures/faint-real-text.html', import.meta.url)), [1440]);
  assert.ok(b.problems.some((p) => p.kind === 'contrast'));
});

test('craft does not report controls hidden inside a closed menu', { skip }, async () => {
  const [desktop] = await craft(fileURLToPath(new URL('./fixtures/closed-menu.html', import.meta.url)), { widths: [1440] });
  const silent = desktop.problems.filter((p) => /Hidden link/.test(p.detail || p.where || ''));
  assert.deepEqual(silent, []);
  assert.equal(desktop.problems.length, 0, JSON.stringify(desktop.problems));
});

test('a pill badge above the headline and a gradient logo tile are tells', { skip }, async () => {
  const found = await scan(fileURLToPath(new URL('./fixtures/badge-and-tile.html', import.meta.url)));
  const kinds = new Set(found.map((f) => f.tell));
  assert.ok(kinds.has('Pill badge above the headline'), [...kinds].join(', '));
  assert.ok(kinds.has('Gradient logo tile'), [...kinds].join(', '));
});

test('the browser driver evaluates a function as well as a string', { skip }, async () => {
  const chrome = await launch();
  try {
    const page = await openPage(chrome.browser, { width: 800, height: 600 });
    await page.goto(toUrl(fileURLToPath(new URL('./fixtures/clean.html', import.meta.url))), 100);
    assert.equal(await page.evaluate(() => document.querySelectorAll('h1').length), 1);
    assert.equal(await page.evaluate((a, b) => a + b, 2, 3), 5);
  } finally { await chrome.close(); }
});
