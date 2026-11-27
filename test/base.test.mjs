// The base starter: craft without layout. Scaffolded in three colourways and driven in a real browser.
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { measureTracking, tightestAt } from '../evals/tracking.mjs';
import { check } from '../scripts/check.mjs';
import { craft } from '../scripts/craft.mjs';
import { scaffoldBase } from '../scripts/scaffold.mjs';
import { scan } from '../scripts/signs.mjs';
import { findChrome, launch, openPage, toUrl } from '../scripts/lib/chrome.mjs';

const skip = findChrome() ? false : 'no Chrome installed';
const folder = (name) => mkdtempSync(join(tmpdir(), `base-${name}-`));
const variants = [
  { name: 'dark', options: {} },
  { name: 'light', options: { theme: 'light' } },
  { name: 'cobalt', options: { palette: 'cobalt' } },
];

test('the base starter ships no layout: no hero, no frame, an empty page.css that is never overwritten', () => {
  const dir = folder('files');
  scaffoldBase(dir);
  const html = readFileSync(join(dir, 'index.html'), 'utf8');
  for (const frame of ['class="hero', 'class="nav', 'class="window', 'class="bento', 'class="steps', 'class="closer']) assert.ok(!html.includes(frame), `${frame} is part of the shared frame`);
  writeFileSync(join(dir, 'page.css'), '.mine {}\n');
  scaffoldBase(dir);
  assert.equal(readFileSync(join(dir, 'page.css'), 'utf8'), '.mine {}\n');
});

test('a flat tone sets the theme, and an unknown palette is refused', () => {
  assert.equal(scaffoldBase(folder('sand'), { palette: 'sand' }).theme, 'light');
  assert.throws(() => scaffoldBase(folder('bad'), { palette: 'nope' }), /Unknown palette/);
});

for (const { name, options } of variants) {
  const dir = folder(name);
  scaffoldBase(dir, options);
  const file = join(dir, 'index.html');

  test(`${name}: the only tell is the unfinished placeholder marker`, { skip }, async () => {
    assert.deepEqual([...new Set((await scan(file)).map((f) => f.tell))], ['Unfinished placeholder']);
  });

  test(`${name}: contrast, targets, names and focus pass at 320, 390, 1440 and 2560`, { skip }, async () => {
    for (const r of await check(file, [320, 390, 1440, 2560])) assert.deepEqual(r.problems, [], `${r.width}px: ${JSON.stringify(r.problems)}`);
  });

  test(`${name}: every control answers the pointer, with a visible change`, { skip }, async () => {
    for (const r of await craft(file, { widths: [390, 1440] })) assert.deepEqual(r.problems, [], `${r.width}px: ${JSON.stringify(r.problems)}`);
  });
}

test('the base type never sets tighter than the measured evidence allows, and nothing overflows', { skip }, async () => {
  const rows = await measureTracking({ font: 'Geist' });
  const dir = folder('type');
  scaffoldBase(dir);
  const chrome = await launch();
  try {
    for (const width of [320, 390, 768, 1024, 1440, 2560]) {
      const page = await openPage(chrome.browser, { width, height: 900, mobile: width < 700 });
      await page.goto(toUrl(join(dir, 'index.html')), 600);
      assert.equal(await page.evaluate('document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1'), true, `${width}px scrolls sideways`);
      for (const [sel, size, em] of await page.evaluate(`['.display', '.h2'].map((sel) => { const s = getComputedStyle(document.querySelector(sel)); const size = parseFloat(s.fontSize); return [sel, size, s.letterSpacing === 'normal' ? 0 : parseFloat(s.letterSpacing) / size]; })`)) {
        const limit = tightestAt(rows, size);
        assert.ok(em >= limit - 0.0051, `${width}px: ${sel} is ${size}px at ${em.toFixed(3)}em; the evidence allows ${limit}em`);
      }
      assert.deepEqual(page.logs, [], `${width}px console errors`);
      await page.close();
    }
  } finally { await chrome.close(); }
});
