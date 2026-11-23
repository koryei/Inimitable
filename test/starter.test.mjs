// The landing starter, scaffolded and driven in a real browser. If this passes, an agent starting from it
// begins with a page that loads, scrolls, reveals, counts, answers the pointer and passes every check.
import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { check } from '../scripts/check.mjs';
import { craft } from '../scripts/craft.mjs';
import { scaffold } from '../scripts/scaffold.mjs';
import { scan } from '../scripts/signs.mjs';
import { findChrome, launch, openPage, toUrl } from '../scripts/lib/chrome.mjs';

const skip = findChrome() ? false : 'no Chrome installed';
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const variants = [
  { name: 'dark', options: { theme: 'dark', palette: 'midnight' } },
  { name: 'light', options: { theme: 'light', palette: 'ember', accent: '#d0532a' } },
  { name: 'split', options: { theme: 'dark', palette: 'dusk', hero: 'split' } },
];

for (const { name, options } of variants) {
  const dir = mkdtempSync(join(tmpdir(), `starter-${name}-`));
  const result = scaffold(dir, options);
  const file = join(dir, 'index.html');

  test(`${name}: the scaffold writes every file and a ground that passes its own audit`, () => {
    assert.deepEqual(result.problems, []);
    assert.ok(result.todo > 40, `${result.todo} placeholders to replace`);
  });

  test(`${name}: the only tell is the unfinished placeholder marker`, { skip }, async () => {
    const found = await scan(file);
    const kinds = new Set(found.map((f) => f.tell));
    assert.deepEqual([...kinds], ['Unfinished placeholder']);
    assert.deepEqual((await scan(file)).filter((f) => f.tell !== 'Unfinished placeholder'), []);
  });

  test(`${name}: contrast, targets, names and focus pass at 320, 390, 1440 and 2560`, { skip }, async () => {
    for (const r of await check(file, [320, 390, 1440, 2560])) assert.deepEqual(r.problems, [], `${r.width}px: ${JSON.stringify(r.problems)}`);
  });

  test(`${name}: every control answers the pointer, with a visible change`, { skip }, async () => {
    for (const r of await craft(file, { widths: [390, 1440] })) assert.deepEqual(r.problems, [], `${r.width}px: ${JSON.stringify(r.problems)}`);
  });

  test(`${name}: fonts load, nothing overflows, no console errors, reveals and counters complete`, { skip }, async () => {
    const chrome = await launch();
    try {
      for (const width of [320, 390, 1440, 2560]) {
        const page = await openPage(chrome.browser, { width, height: width < 700 ? 800 : 900, mobile: width < 700 });
        await page.goto(toUrl(file), 1200);
        const fonts = await page.evaluate("document.fonts.check('400 16px Geist') && document.fonts.check('400 16px \"Instrument Serif\"')");
        assert.equal(fonts, true, `${width}px: Geist and Instrument Serif loaded`);
        assert.equal(await page.evaluate('document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1'), true, `${width}px scrolls sideways`);
        // Scroll the whole page the way a person would.
        const total = await page.evaluate('document.documentElement.scrollHeight');
        for (let y = 0; y <= total; y += 500) { await page.evaluate(`window.scrollTo(0, ${y})`); await wait(90); }
        await page.evaluate('window.scrollTo(0, document.documentElement.scrollHeight)');
        await wait(1800);
        const hidden = await page.evaluate("[...document.querySelectorAll('[data-reveal]')].filter((e) => !e.classList.contains('in')).length");
        assert.equal(hidden, 0, `${width}px: every reveal fired`);
        const counts = await page.evaluate("[...document.querySelectorAll('[data-count]')].map((e) => [e.textContent, e.dataset.count, e.dataset.suffix || ''])");
        for (const [text, target, suffix] of counts) assert.equal(text, `${Number(target).toLocaleString('en-GB')}${suffix}`, `${width}px: counter ended on its real number`);
        assert.deepEqual(page.logs, [], `${width}px console errors: ${page.logs.join('; ')}`);
        await page.close();
      }
    } finally { await chrome.close(); }
  });

  test(`${name}: the nav settles on scroll, the phone menu opens and reaches every section`, { skip }, async () => {
    const chrome = await launch();
    try {
      const desktop = await openPage(chrome.browser, { width: 1440, height: 900 });
      await desktop.goto(toUrl(file), 800);
      await desktop.evaluate('window.scrollTo(0, 600)');
      await wait(400);
      assert.equal(await desktop.evaluate("document.querySelector('[data-nav]').classList.contains('is-stuck')"), true);
      const phone = await openPage(chrome.browser, { width: 390, height: 844, mobile: true });
      await phone.goto(toUrl(file), 800);
      assert.equal(await phone.evaluate("getComputedStyle(document.querySelector('.links')).display"), 'none');
      await phone.evaluate("document.querySelector('.nav-menu summary').click()");
      await wait(200);
      const reach = await phone.evaluate("[...document.querySelectorAll('.nav-menu a')].map((a) => a.getAttribute('href')).every((h) => document.querySelector(h))");
      assert.equal(reach, true, 'every menu link points at a section that exists');
    } finally { await chrome.close(); }
  });

  test(`${name}: with reduced motion nothing waits to appear and nothing loops`, { skip }, async () => {
    const chrome = await launch();
    try {
      const page = await openPage(chrome.browser, { width: 1440, height: 900, reducedMotion: true });
      await page.goto(toUrl(file), 400);
      const invisible = await page.evaluate("[...document.querySelectorAll('[data-reveal], [data-enter], .m-line > span')].filter((e) => Number(getComputedStyle(e).opacity) < 1).length");
      assert.equal(invisible, 0);
      assert.equal(await page.evaluate("document.getAnimations().filter((a) => a.playState === 'running' && a.effect.getTiming().iterations === Infinity).length"), 0);
    } finally { await chrome.close(); }
  });
}

// --minimal: a short brief with few facts keeps the hero, the steps, the closing call and the footer.
{
  const dir = mkdtempSync(join(tmpdir(), 'starter-minimal-'));
  const result = scaffold(dir, { theme: 'light', palette: 'ember', minimal: true });
  const full = scaffold(mkdtempSync(join(tmpdir(), 'starter-full-')), { theme: 'light', palette: 'ember' });
  const file = join(dir, 'index.html');

  test('minimal: the optional sections and their links are gone, and the markers with them', async () => {
    const { readFileSync } = await import('node:fs');
    const html = readFileSync(file, 'utf8');
    assert.ok(result.todo < full.todo, `${result.todo} placeholders against ${full.todo}`);
    assert.doesNotMatch(html, /optional:/);
    for (const id of ['product', 'features']) {
      assert.doesNotMatch(html, new RegExp(`id="${id}"`));
      assert.doesNotMatch(html, new RegExp(`href="#${id}"`));
    }
    // Every in-page link still lands on something.
    const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]));
    for (const [, target] of html.matchAll(/href="#([^"]+)"/g)) assert.ok(ids.has(target), `#${target} has nothing to land on`);
  });

  test('minimal: the page passes the same checks as the full one', { skip }, async () => {
    const kinds = new Set((await scan(file)).map((f) => f.tell));
    assert.deepEqual([...kinds], ['Unfinished placeholder']);
    for (const r of await check(file, [320, 1440])) assert.deepEqual(r.problems, [], `${r.width}px: ${JSON.stringify(r.problems)}`);
    for (const r of await craft(file, { widths: [390, 1440] })) assert.deepEqual(r.problems, [], `${r.width}px: ${JSON.stringify(r.problems)}`);
  });
}
