// The base starter: craft without layout. Scaffolded in three colourways and driven in a real browser.
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { measureTracking, tightestAt } from '../evals/tracking.mjs';
import { check } from '../scripts/check.mjs';
import { craft } from '../scripts/craft.mjs';
import { VOICES, scaffoldBase } from '../scripts/scaffold.mjs';
import { measure } from '../scripts/drift.mjs';
import { scan } from '../scripts/signs.mjs';
import { findChrome, launch, openPage, toUrl } from '../scripts/lib/chrome.mjs';

const skip = findChrome() ? false : 'no Chrome installed';
const folder = (name) => mkdtempSync(join(tmpdir(), `base-${name}-`));
const plain = { voice: 'sans', weight: 400 };
const variants = [
  { name: 'dark', options: { voice: 'sans', weight: 800 } },
  { name: 'light', options: { theme: 'light', voice: 'serif', weight: 400 } },
  { name: 'cobalt', options: { palette: 'cobalt', voice: 'condensed', weight: 900 } },
];

test('the base starter ships no layout: no hero, no frame, an empty page.css that is never overwritten', () => {
  const dir = folder('files');
  scaffoldBase(dir, plain);
  const html = readFileSync(join(dir, 'index.html'), 'utf8');
  for (const frame of ['class="hero', 'class="nav', 'class="window', 'class="bento', 'class="steps', 'class="closer']) assert.ok(!html.includes(frame), `${frame} is part of the shared frame`);
  writeFileSync(join(dir, 'page.css'), '.mine {}\n');
  scaffoldBase(dir, plain);
  assert.equal(readFileSync(join(dir, 'page.css'), 'utf8'), '.mine {}\n');
});

test('a flat tone sets the theme, and an unknown palette is refused', () => {
  assert.equal(scaffoldBase(folder('sand'), { ...plain, palette: 'sand' }).theme, 'light');
  assert.throws(() => scaffoldBase(folder('bad'), { ...plain, palette: 'nope' }), /Unknown palette/);
});

test('the accent asked for is the accent written, with readable text on it, and a faint one is reported', () => {
  const dir = folder('accent');
  const strong = scaffoldBase(dir, { ...plain, theme: 'light', accent: '#b0271c' });
  const css = readFileSync(join(dir, 'theme.css'), 'utf8');
  assert.match(css, /--accent: #b0271c;/);
  assert.match(css, /--on-accent: #ffffff;/);
  assert.deepEqual(strong.problems, []);
  assert.match(scaffoldBase(folder('faint'), { ...plain, theme: 'light', accent: '#ffd43b' }).problems[0], /too faint/);
  assert.throws(() => scaffoldBase(folder('short'), { ...plain, accent: 'red' }), /hex/);
});

test('the base sets no layout a page has to fight: its two blocks carry no specificity', () => {
  const css = readFileSync(new URL('../assets/starters/base/base.css', import.meta.url), 'utf8');
  assert.match(css, /:where\(\.first, \.last\)/);
  assert.ok(!/justify-items/.test(css));
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

test('the face and weight have no default, and an impossible one is refused', () => {
  assert.throws(() => scaffoldBase(folder('none')), /--voice is/);
  assert.throws(() => scaffoldBase(folder('noweight'), { voice: 'serif' }), /--weight for serif/);
  assert.throws(() => scaffoldBase(folder('heavy'), { voice: 'grotesk', weight: 900 }), /200 to 800/);
});

test('the base carries no house furniture: no arrow, no mono captions, no dimmed second line', () => {
  const dir = folder('furniture');
  scaffoldBase(dir, plain);
  const page = readFileSync(join(dir, 'index.html'), 'utf8');
  const css = readFileSync(join(dir, 'base.css'), 'utf8');
  assert.ok(!page.includes('m-arrow') && !page.includes(' dim'));
  assert.ok(!css.includes('var(--mono)'));
  assert.match(page, /data-mode="persuade"/);
});

test('a persuading page may use a heavy headline and tracked capitals; a working screen may not', { skip }, async () => {
  const loud = fileURLToPath(new URL('./fixtures/loud-persuade.html', import.meta.url));
  assert.deepEqual(await scan(loud), []);
  assert.ok(!(await measure(loud)).flags.some((f) => /heavy/.test(f)));
  const working = join(folder('working'), 'p.html');
  writeFileSync(working, readFileSync(loud, 'utf8').replace(' data-mode="persuade"', ''));
  assert.deepEqual([...new Set((await scan(working)).map((f) => f.tell))].sort(), ['Heavy heading', 'Uppercase tracked label']);
  assert.ok((await measure(working)).flags.some((f) => /heavy/.test(f)));
});

for (const voice of Object.keys(VOICES)) {
  const { family, weights: [low, high], files } = VOICES[voice];
  for (const weight of [...new Set([Math.max(low, 400), Math.min(high, 900)])]) {
    test(`${voice} ${weight}: the face loads, and no size is set tighter than its measured evidence allows`, { skip }, async () => {
      const css = fileURLToPath(new URL(files.length ? '../assets/voices/voices.css' : '../assets/fonts/fonts.css', import.meta.url));
      const rows = await measureTracking({ font: family, weight, fontsCss: css });
      const dir = folder(`${voice}-${weight}`);
      scaffoldBase(dir, { voice, weight });
      const chrome = await launch();
      try {
        for (const width of [320, 390, 768, 1024, 1440, 2560]) {
          const page = await openPage(chrome.browser, { width, height: 900, mobile: width < 700 });
          await page.goto(toUrl(join(dir, 'index.html')), 600);
          assert.equal(await page.evaluate('document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1'), true, `${width}px scrolls sideways`);
          assert.equal(await page.evaluate(`document.fonts.check('${weight} 40px "${family}"')`), true, `${family} loaded`);
          for (const [sel, size, em] of await page.evaluate(`['.display', '.h2'].map((sel) => { const s = getComputedStyle(document.querySelector(sel)); const size = parseFloat(s.fontSize); return [sel, size, s.letterSpacing === 'normal' ? 0 : parseFloat(s.letterSpacing) / size]; })`)) {
            // Newsreader's own letters sit closer than the 2 px rule at every tracking, so it is held to "never tighter than zero".
            const limit = voice === 'serif' ? 0 : tightestAt(rows, size);
            assert.ok(em >= limit - 0.0051, `${width}px: ${sel} is ${size}px at ${em.toFixed(3)}em; the evidence allows ${limit}em`);
          }
          const gaps = await page.evaluate("[...document.querySelectorAll('.first > * + *, .last > * + *')].map((el) => el.getBoundingClientRect().top - el.previousElementSibling.getBoundingClientRect().bottom)");
          assert.ok(gaps.length >= 3 && gaps.every((g) => g >= 16), `${width}px: stacked blocks keep their space (${gaps.map(Math.round)})`);
          assert.deepEqual(page.logs, [], `${width}px console errors`);
          await page.close();
        }
      } finally { await chrome.close(); }
    });
  }
}
