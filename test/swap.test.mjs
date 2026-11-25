// The swap-the-name test: a pure judge (no browser) and the script against two fixtures.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { swap } from '../scripts/swap.mjs';
import { findChrome } from '../scripts/lib/chrome.mjs';
import { GENERIC_NOUNS, judge, nounsIn, parseNouns, withoutName } from '../scripts/lib/swap.mjs';

const skip = findChrome() ? false : 'no Chrome installed';
const fixture = (name) => fileURLToPath(new URL(`./fixtures/${name}`, import.meta.url));

test('nouns are matched as whole words, a plural counts, a part of a longer word does not', () => {
  assert.deepEqual(nounsIn('Every clause, every redlines', ['clause', 'redline', 'line']), ['clause', 'redline']);
  assert.deepEqual(nounsIn('Underlined text', ['line']), []);
  assert.deepEqual(parseNouns('Clause, redline;  Core sample'), ['clause', 'redline', 'core sample']);
});

test('the product name is removed before anything is counted', () => {
  assert.equal(withoutName('Marrow reads a clause', 'Marrow'), 'reads a clause');
  assert.deepEqual(nounsIn(withoutName('Marrow Marrow', 'marrow'), ['marrow']), []);
});

test('declared nouns that fit any product are refused, and too few nouns fails', () => {
  const first = { headline: 'x', artwork: 'x', copy: 'x', hasArtwork: true };
  const generic = judge({ nouns: ['platform', 'team', 'data'], first });
  assert.equal(generic.pass, false);
  assert.deepEqual(generic.refused, ['platform', 'team', 'data']);
  assert.equal(judge({ nouns: ['clause'], first }).pass, false);
  assert.ok(GENERIC_NOUNS.includes('ai'));
});

test('a page with no artwork fails unless the headline is the signature', () => {
  const first = { headline: 'Every clause checked', artwork: '', copy: 'A redline for each', hasArtwork: false };
  const nouns = ['clause', 'redline'];
  assert.equal(judge({ nouns, first }).pass, false);
  assert.equal(judge({ nouns, first, typographic: true }).pass, true);
});

test('artwork that never mentions the product fails even when the headline does', () => {
  const first = { headline: 'Every clause and redline', artwork: 'chart with bars', copy: '', hasArtwork: true };
  const r = judge({ nouns: ['clause', 'redline'], first });
  assert.equal(r.pass, false);
  assert.match(r.reasons.join(' '), /artwork/);
});

test('a generic first screen fails and an owned one passes, in a real browser', { skip }, async () => {
  const bad = await swap(fixture('swap-generic.html'), { nouns: ['clause', 'redline'], name: 'Marrow' });
  assert.equal(bad.pass, false);
  assert.ok(bad.category.length >= 2, `category words: ${bad.category}`);
  const good = await swap(fixture('swap-owned.html'), { nouns: ['clause', 'redline', 'contract'], name: 'Marrow' });
  assert.equal(good.pass, true, JSON.stringify(good.reasons));
  assert.ok(good.found.artwork.includes('clause'));
});

test('the starter hero fails until its object is replaced', { skip }, async () => {
  const { mkdtempSync } = await import('node:fs');
  const { tmpdir } = await import('node:os');
  const { join } = await import('node:path');
  const { scaffold } = await import('../scripts/scaffold.mjs');
  const dir = mkdtempSync(join(tmpdir(), 'swap-starter-'));
  scaffold(dir, { theme: 'dark', palette: 'midnight' });
  const r = await swap(join(dir, 'index.html'), { nouns: ['clause', 'redline'] });
  assert.equal(r.pass, false, 'a stack hero with only a ground has no artwork');
});

test('the card hero passes once its card and chips are about the product, and not before', { skip }, async () => {
  const { mkdtempSync, readFileSync, writeFileSync } = await import('node:fs');
  const { tmpdir } = await import('node:os');
  const { join } = await import('node:path');
  const { scaffold } = await import('../scripts/scaffold.mjs');
  const dir = mkdtempSync(join(tmpdir(), 'swap-card-'));
  scaffold(dir, { ground: 'flat', palette: 'cobalt', hero: 'card' });
  const file = join(dir, 'index.html');
  const nouns = ['clause', 'redline', 'contract'];
  assert.equal((await swap(file, { nouns })).pass, false, 'placeholders name nothing');
  const html = readFileSync(file, 'utf8')
    .replace("Example: the product's main screen, cropped at the fold. Replace with the real screen.", 'Example: clause 4.2 of a contract marked against the standard, with a suggested redline')
    .replace('What it does,', 'Every clause checked,')
    .replace('One true detail', 'Redline suggested');
  writeFileSync(file, html);
  const r = await swap(file, { nouns, name: 'Marrow' });
  assert.equal(r.pass, true, JSON.stringify(r.reasons));
  assert.ok(r.found.headline.includes('clause') && r.found.artwork.includes('redline'));
});

test('a product picture built from plain HTML counts as artwork, and a bare text hero still does not', { skip }, async () => {
  const built = await swap(fixture('swap-html-artwork.html'), { nouns: ['clause', 'redline', 'contract'] });
  assert.equal(built.pass, true, JSON.stringify(built.reasons));
  assert.ok(built.found.artwork.includes('redline'));
  const bare = await swap(fixture('swap-generic.html'), { nouns: ['clause', 'redline'] });
  assert.equal(bare.pass, false);
});
