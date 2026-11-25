// The blind-judging mask: the product name is gone from the rendered page, wherever it was, and text can be blurred.
import assert from 'node:assert/strict';
import { existsSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { MASK, maskedShots } from '../evals/mask.mjs';
import { findChrome, launch, openPage, toUrl } from '../scripts/lib/chrome.mjs';

const skip = findChrome() ? false : 'no Chrome installed';
const fixture = fileURLToPath(new URL('./fixtures/swap-owned.html', import.meta.url));

test('the name is masked in text, labels, alt text and the title, in any case', { skip }, async () => {
  const chrome = await launch();
  try {
    const page = await openPage(chrome.browser, { width: 900, height: 600 });
    await page.goto(toUrl(fixture), 300);
    await page.evaluate("document.body.insertAdjacentHTML('beforeend', '<img alt=\"MARROW logo\" width=10 height=10><p title=\"marrow tip\">Marrow&rsquo;s page</p>'); document.title = 'Marrow: contracts'");
    const masked = await page.evaluate(MASK('Marrow', false));
    assert.ok(masked >= 4, `${masked} mentions masked`);
    const left = await page.evaluate("(document.documentElement.innerHTML.match(/marrow/gi) || []).length");
    assert.equal(left, 0, 'the name is nowhere in the page');
    assert.match(await page.evaluate('document.title'), /^▒{6}: contracts$/);
  } finally { await chrome.close(); }
});

test('blurring wraps the words and leaves the pictures alone', { skip }, async () => {
  const chrome = await launch();
  try {
    const page = await openPage(chrome.browser, { width: 900, height: 600 });
    await page.goto(toUrl(fixture), 300);
    await page.evaluate(MASK('Marrow', true));
    assert.ok((await page.evaluate("document.querySelectorAll('[data-blur]').length")) >= 2);
    assert.equal(await page.evaluate("document.querySelectorAll('svg [data-blur]').length"), 0, 'svg text is blurred by css, not wrapped');
    assert.match(await page.evaluate("getComputedStyle(document.querySelector('[data-blur]')).filter"), /blur/);
  } finally { await chrome.close(); }
});

test('maskedShots writes three desktop screens and one phone screen', { skip }, async () => {
  const out = mkdtempSync(join(tmpdir(), 'mask-'));
  const files = await maskedShots(fixture, { name: 'Marrow', out, label: 'P1' });
  assert.equal(files.length, 4);
  for (const f of files) assert.ok(existsSync(f), f);
});
