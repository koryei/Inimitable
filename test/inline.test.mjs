import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { inlineCss, inlineHtml, inlineJs } from '../scripts/inline.mjs';
import { scaffold } from '../scripts/scaffold.mjs';
import { findChrome, launch, openPage, toUrl } from '../scripts/lib/chrome.mjs';

const skip = findChrome() ? false : 'no Chrome installed';
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

test('a closing script tag inside a script can never end the page early', () => {
  assert.equal(inlineJs('a = "</script>"; b = "</SCRIPT>"'), 'a = "<\\/script>"; b = "<\\/script>"'.replace('<\\/script>"; b = "<\\/script>', '<\\/script>"; b = "<\\/SCRIPT>'));
  assert.doesNotMatch(inlineJs('x = "<!-- y"'), /<!--/);
});

test('css url() files become data URIs, remote urls are reported', () => {
  const dir = mkdtempSync(join(tmpdir(), 'inline-css-'));
  writeFileSync(join(dir, 'a.woff2'), Buffer.from([0x77, 0x4f, 0x46, 0x32]));
  const remote = [];
  const out = inlineCss('@font-face{src:url("a.woff2")} .x{background:url(https://cdn.test/x.png)}', dir, remote);
  assert.match(out, /url\("data:font\/woff2;base64,d09GMg=="\)/);
  assert.deepEqual(remote, ['https://cdn.test/x.png']);
});

test('a scaffolded page becomes one file with nothing left to fetch', () => {
  const dir = mkdtempSync(join(tmpdir(), 'inline-page-'));
  scaffold(dir, { theme: 'dark', palette: 'midnight' });
  const { html, remote } = inlineHtml(readFileSync(join(dir, 'index.html'), 'utf8'), dir);
  assert.deepEqual(remote, []);
  assert.doesNotMatch(html, /<link[^>]+stylesheet/);
  assert.doesNotMatch(html, /<script[^>]+src=/);
  assert.match(html, /data:font\/woff2;base64,/);
  assert.equal((html.match(/<\/script>/g) || []).length, 2);
});

test('the single file still works: fonts load, reveals fire, counters finish, no console errors, no network', { skip }, async () => {
  const dir = mkdtempSync(join(tmpdir(), 'inline-run-'));
  scaffold(dir, { theme: 'dark', palette: 'midnight' });
  const { html } = inlineHtml(readFileSync(join(dir, 'index.html'), 'utf8'), dir);
  const alone = mkdtempSync(join(tmpdir(), 'inline-alone-'));
  const file = join(alone, 'page.html');
  writeFileSync(file, html);
  const chrome = await launch();
  try {
    const page = await openPage(chrome.browser, { width: 1440, height: 900 });
    await page.goto(toUrl(file), 1500);
    assert.equal(await page.evaluate("document.fonts.check('400 16px Geist')"), true);
    const total = await page.evaluate('document.documentElement.scrollHeight');
    for (let y = 0; y <= total; y += 500) { await page.evaluate(`window.scrollTo(0, ${y})`); await wait(80); }
    await page.evaluate('window.scrollTo(0, document.documentElement.scrollHeight)');
    await wait(1800);
    assert.equal(await page.evaluate("[...document.querySelectorAll('[data-reveal]')].filter((e) => !e.classList.contains('in')).length"), 0);
    assert.equal(await page.evaluate("document.querySelector('[data-count]').textContent"), '120K+');
    assert.deepEqual(page.logs, []);
    const external = await page.evaluate("performance.getEntriesByType('resource').map((e) => e.name).filter((n) => !n.startsWith('data:'))");
    assert.deepEqual(external, [], 'nothing was fetched');
  } finally { await chrome.close(); }
});
