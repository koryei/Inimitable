// The site prints a receipt of what it actually uses: font sizes, text colours, radii, spacing values.
// The numbers are authored in the markup so they are right without JavaScript, and site.js recounts them on
// load with the same probe drift.mjs runs. This test keeps all three honest: the markup, the page, and the
// tool the receipt tells you to run.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { findChrome, launch, openPage, toUrl } from '../scripts/lib/chrome.mjs';
import { measure } from '../scripts/drift.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const skip = findChrome() ? false : 'no Chrome installed';
const page = join(root, 'site', 'dist', 'index.html');

function authored() {
  const html = readFileSync(join(root, 'site', 'index.html'), 'utf8');
  const found = {};
  for (const [, key, value] of html.matchAll(/data-count="([a-z]+)">(\d+)</g)) found[key] = Number(value);
  return found;
}

// What drift.mjs reports, in the receipt's four names.
function fromDrift(report) {
  return {
    sizes: report.fontSizes.length,
    colours: report.colours.text.length,
    radii: report.radii.length,
    spacing: report.spacing.distinct,
  };
}

async function measuredAt(chrome, width) {
  const mobile = width < 700;
  const tab = await openPage(chrome.browser, { width, height: mobile ? 844 : 900, mobile, deviceScaleFactor: 1 });
  await tab.goto(toUrl(page));
  // site.js recounts after the fonts land, so wait for the measured values rather than a fixed delay.
  await tab.evaluate('new Promise((done) => { const tick = () => { const el = document.querySelector("[data-count][data-measured]"); if (el) return done(); setTimeout(tick, 50); }; tick(); })');
  const out = await tab.evaluate(`(() => {
    const found = {};
    for (const el of document.querySelectorAll('[data-count]')) found[el.dataset.count] = Number(el.dataset.measured);
    return found;
  })()`);
  await tab.close();
  return out;
}

test('the receipt in the markup matches what the page actually uses', { skip }, async () => {
  execFileSync(process.execPath, [join(root, 'site', 'build.mjs')], { stdio: 'ignore' });

  const chrome = await launch();
  try {
    const measured = await measuredAt(chrome, 1440);
    const claimed = authored();
    assert.deepEqual(Object.keys(claimed).sort(), ['colours', 'radii', 'sizes', 'spacing'], 'the receipt lost a count');
    assert.deepEqual(claimed, measured, 'the receipt is stale: update the numbers in site/index.html');
  } finally {
    await chrome.close();
  }
});

test('the receipt agrees with drift.mjs at every width', { skip }, async () => {
  execFileSync(process.execPath, [join(root, 'site', 'build.mjs')], { stdio: 'ignore' });

  const chrome = await launch();
  try {
    for (const width of [390, 1440]) {
      const shown = await measuredAt(chrome, width);
      const tool = fromDrift(await measure(page, width));
      assert.deepEqual(shown, tool, `at ${width}px the page counts itself differently from drift.mjs`);
    }
  } finally {
    await chrome.close();
  }
});
