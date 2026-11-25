// Display tracking is a property of size. These tests measure real letter gaps in Chrome (evals/tracking.mjs) and
// hold the landing starter to that evidence at every width, so the starter and the guidance cannot drift apart.
import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { measureTracking, tightestAt, NUMERALS } from '../evals/tracking.mjs';
import { findChrome, launch, openPage, toUrl } from '../scripts/lib/chrome.mjs';
import { scaffold } from '../scripts/scaffold.mjs';

const skip = findChrome() ? false : 'no Chrome installed';

test('tightening shrinks the gaps, and Geist tolerates more of it than Instrument Serif', { skip }, async () => {
  const sans = await measureTracking({ font: 'Geist', trackings: [0, -0.03, -0.06] });
  const serif = await measureTracking({ font: 'Instrument Serif', trackings: [0, -0.03, -0.06] });
  for (const rows of [sans, serif]) {
    assert.ok(rows[0].median > rows[1].median && rows[1].median > rows[2].median, 'the median gap falls as tracking tightens');
    assert.ok(rows[0].touching <= rows[2].touching);
  }
  assert.equal(sans[0].touching, 0, 'Geist at zero tracking has no touching pairs in these headlines');
  assert.ok(serif[2].touching > sans[2].touching * 5, 'at -0.06em the serif collides far more than the sans');
});

test('tightestAt is size-aware: more room, tighter tracking', { skip }, async () => {
  const rows = await measureTracking({ font: 'Geist' });
  assert.equal(tightestAt(rows, 20), 0);
  assert.ok(tightestAt(rows, 64) <= tightestAt(rows, 40));
  assert.ok(tightestAt(rows, 128) <= tightestAt(rows, 64));
  assert.ok(tightestAt(rows, 128) <= -0.05);
});

test('the landing starter never sets type tighter than the measured evidence allows, at any width', { skip }, async () => {
  const sans = await measureTracking({ font: 'Geist' });
  const numerals = await measureTracking({ font: 'Geist', headlines: NUMERALS });
  const chrome = await launch();
  try {
    for (const [variant, options] of [['stack', { theme: 'dark', palette: 'midnight' }], ['split', { theme: 'dark', palette: 'midnight', hero: 'split' }], ['card', { ground: 'flat', palette: 'cobalt', hero: 'card' }]]) {
    const dir = mkdtempSync(join(tmpdir(), `tracking-${variant}-`));
    scaffold(dir, options);
    for (const width of [320, 390, 768, 1024, 1440, 2560]) {
      const page = await openPage(chrome.browser, { width, height: 900, mobile: width < 700 });
      await page.goto(toUrl(join(dir, 'index.html')), 600);
      const measured = await page.evaluate(`['.display', '.h2', '.stats dd', '.cell h3', '.kpi strong', '.step h3'].filter((sel) => document.querySelector(sel)).map((sel) => { const el = document.querySelector(sel); const s = getComputedStyle(el); const size = parseFloat(s.fontSize); return [sel, size, s.letterSpacing === 'normal' ? 0 : parseFloat(s.letterSpacing) / size]; })`);
      for (const [sel, size, em] of measured) {
        const rows = /dd|strong/.test(sel) ? numerals : sans;
        const limit = tightestAt(rows, size);
        assert.ok(em >= limit - 0.0051, `${variant} ${width}px: ${sel} is ${size}px at ${em.toFixed(3)}em; the evidence allows ${limit}em`);
      }
      await page.close();
    }
    }
  } finally { await chrome.close(); }
});
