// The flat and framed grounds, the card hero and the duotone print, scaffolded and driven in a real browser.
// Each combination has to pass every check the lit starter passes: tells, contrast, targets, the pointer, overflow,
// reveals, reduced motion. A flat colour hides nothing, so contrast is read from the rendered pixels at four widths.
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync } from 'node:fs';
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
  { name: 'flat cobalt, card hero', options: { ground: 'flat', palette: 'cobalt', hero: 'card', seed: 2 } },
  { name: 'flat mint, split hero with a column print', options: { ground: 'flat', palette: 'mint', art: 'column', seed: 3 } },
  { name: 'frame sand, card hero', options: { ground: 'frame', palette: 'sand', hero: 'card' } },
  { name: 'frame cobalt, split hero with a strata print', options: { ground: 'frame', palette: 'cobalt', art: 'strata' } },
];

for (const { name, options } of variants) {
  const dir = mkdtempSync(join(tmpdir(), 'ground-'));
  const result = scaffold(dir, options);
  const file = join(dir, 'index.html');

  test(`${name}: the scaffold writes a theme that follows the colour, and the only tell is the placeholder marker`, { skip }, async () => {
    assert.deepEqual(result.problems, []);
    assert.ok(result.todo > 40, `${result.todo} placeholders`);
    assert.equal(result.theme, { cobalt: 'dark', mint: 'light', sand: 'light' }[options.palette]);
    assert.deepEqual([...new Set((await scan(file)).map((f) => f.tell))], ['Unfinished placeholder']);
  });

  test(`${name}: contrast, targets, names and focus pass at 320, 390, 1440 and 2560`, { skip }, async () => {
    for (const r of await check(file, [320, 390, 1440, 2560])) assert.deepEqual(r.problems, [], `${r.width}px: ${JSON.stringify(r.problems)}`);
  });

  test(`${name}: every control answers the pointer, with a visible change`, { skip }, async () => {
    for (const r of await craft(file, { widths: [390, 1440] })) assert.deepEqual(r.problems, [], `${r.width}px: ${JSON.stringify(r.problems)}`);
  });

  test(`${name}: nothing overflows, no console errors, every reveal fires, reduced motion shows everything`, { skip }, async () => {
    const chrome = await launch();
    try {
      for (const width of [320, 1440, 2560]) {
        const page = await openPage(chrome.browser, { width, height: width < 700 ? 800 : 900, mobile: width < 700 });
        await page.goto(toUrl(file), 1200);
        assert.equal(await page.evaluate('document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1'), true, `${width}px scrolls sideways`);
        const total = await page.evaluate('document.documentElement.scrollHeight');
        for (let y = 0; y <= total; y += 600) { await page.evaluate(`window.scrollTo(0, ${y})`); await wait(80); }
        await wait(1500);
        assert.equal(await page.evaluate("[...document.querySelectorAll('[data-reveal]')].filter((e) => !e.classList.contains('in')).length"), 0, `${width}px: every reveal fired`);
        assert.deepEqual(page.logs, [], `${width}px console errors: ${page.logs.join('; ')}`);
        await page.close();
      }
      const reduced = await openPage(chrome.browser, { width: 1440, height: 900, reducedMotion: true });
      await reduced.goto(toUrl(file), 400);
      assert.equal(await reduced.evaluate("[...document.querySelectorAll('[data-reveal], [data-enter], .m-line > span')].filter((e) => Number(getComputedStyle(e).opacity) < 1).length"), 0);
      assert.equal(await reduced.evaluate("document.getAnimations().filter((a) => a.playState === 'running' && a.effect.getTiming().iterations === Infinity).length"), 0);
    } finally { await chrome.close(); }
  });
}

test('a flat ground is a flat colour: the hero shows one tone, with grain and nothing lit', { skip }, async () => {
  const dir = mkdtempSync(join(tmpdir(), 'ground-flat-'));
  scaffold(dir, { ground: 'flat', palette: 'sand' });
  const css = readFileSync(join(dir, 'ground.css'), 'utf8');
  assert.doesNotMatch(css, /radial-gradient|conic-gradient/, 'no light in a flat ground');
  assert.match(css, /--bg: #e8dfca/);
  assert.match(css, /feTurbulence/, 'a little grain, so it is not dead');
  assert.equal(readFileSync(join(dir, 'index.html'), 'utf8').match(/data-theme="(\w+)"/)[1], 'light');
});

test('the card hero is cropped by the bottom of the first screen, and a phone drops the chips and the diagram', { skip }, async () => {
  const dir = mkdtempSync(join(tmpdir(), 'ground-card-'));
  scaffold(dir, { ground: 'flat', palette: 'cobalt', hero: 'card' });
  const chrome = await launch();
  try {
    const desktop = await openPage(chrome.browser, { width: 1440, height: 900 });
    await desktop.goto(toUrl(join(dir, 'index.html')), 1500);
    const m = await desktop.evaluate(`(() => { const h = document.querySelector('.hero').getBoundingClientRect(); const w = document.querySelector('.hero-card .window').getBoundingClientRect(); const d = document.querySelector('.hero-card .diagram'); return { heroBottom: h.bottom, windowBottom: w.bottom, windowTop: w.top, vh: innerHeight, chips: [...document.querySelectorAll('.chip')].filter((c) => getComputedStyle(c).display !== 'none').length, diagram: getComputedStyle(d).display }; })()`);
    assert.ok(m.heroBottom <= m.vh, 'the hero is one screen tall');
    assert.ok(m.windowBottom > m.heroBottom + 20, 'the card runs past the bottom of the hero and is cropped');
    assert.ok(m.windowTop < m.vh - 150, 'a good part of the card shows in the first screen');
    assert.equal(m.chips, 2);
    assert.notEqual(m.diagram, 'none');
    const phone = await openPage(chrome.browser, { width: 390, height: 844, mobile: true });
    await phone.goto(toUrl(join(dir, 'index.html')), 1200);
    const p = await phone.evaluate("({ chips: [...document.querySelectorAll('.chip')].filter((c) => getComputedStyle(c).display !== 'none').length, diagram: getComputedStyle(document.querySelector('.hero-card .diagram')).display })");
    assert.deepEqual(p, { chips: 0, diagram: 'none' });
  } finally { await chrome.close(); }
});

test('the card hero replaces the product section and every link still lands', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'ground-links-'));
  scaffold(dir, { hero: 'card' });
  const html = readFileSync(join(dir, 'index.html'), 'utf8');
  assert.doesNotMatch(html, /id="product"|href="#product"|<!--card-->|<!--stats-->|<!--diagram-->|<!--chips-->/);
  const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]));
  for (const [, target] of html.matchAll(/href="#([^"]+)"/g)) assert.ok(ids.has(target), `#${target} has nothing to land on`);
});

test('the split hero keeps its stats and drops the card; the stack hero has neither', () => {
  for (const hero of ['stack', 'split']) {
    const html = readFileSync(join(scaffoldTo({ hero }), 'index.html'), 'utf8');
    assert.match(html, /class="stats"/);
    assert.doesNotMatch(html, /hero-card|<!--card-->|<!--stats-->/);
  }
});

test('the options refuse nonsense in plain words', () => {
  assert.throws(() => scaffold(mkdtempSync(join(tmpdir(), 'g-')), { ground: 'glow' }), /lit, flat or frame/);
  assert.throws(() => scaffold(mkdtempSync(join(tmpdir(), 'g-')), { hero: 'wide' }), /stack, split or card/);
  assert.throws(() => scaffold(mkdtempSync(join(tmpdir(), 'g-')), { art: 'unicorn' }), /column, vase, sphere, drape, strata/);
  assert.throws(() => scaffold(mkdtempSync(join(tmpdir(), 'g-')), { art: 'column', hero: 'card' }), /split hero/);
  assert.throws(() => scaffold(mkdtempSync(join(tmpdir(), 'g-')), { ground: 'flat', palette: 'plum' }), /cobalt, mint, sand/);
});

test('a lit ground still scaffolds exactly as before: the same files, a grainient, no flat css', () => {
  const dir = scaffoldTo({ theme: 'dark', palette: 'midnight' });
  const css = readFileSync(join(dir, 'ground.css'), 'utf8');
  assert.match(css, /radial-gradient/);
  assert.doesNotMatch(css, /--panel/);
  assert.doesNotMatch(readFileSync(join(dir, 'index.html'), 'utf8'), /is-frame|has-card|is-art/);
});

test('a print stands in for the object only when asked, and it carries no text of its own to fake a claim', () => {
  const html = readFileSync(join(scaffoldTo({ art: 'drape', ground: 'flat' }), 'index.html'), 'utf8');
  assert.match(html, /class="hero-object is-art"/);
  assert.match(html, /var\(--bg\)/);
  assert.doesNotMatch(html.match(/<figure class="hero-object is-art"[\s\S]*?<\/figure>/)[0], /<text/);
  assert.match(html.match(/<figure class="hero-object is-art"[\s\S]*?<\/figure>/)[0], /data-todo/, 'the caption still says to replace it');
});

function scaffoldTo(options) {
  const dir = mkdtempSync(join(tmpdir(), 'ground-x-'));
  scaffold(dir, options);
  return dir;
}
