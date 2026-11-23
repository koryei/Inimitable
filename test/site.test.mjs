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
  for (const [, key, value] of html.matchAll(/data-measure="([a-z]+)">(\d+)</g)) found[key] = Number(value);
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
  await tab.evaluate('new Promise((done) => { const tick = () => { const el = document.querySelector("[data-measure][data-measured]"); if (el) return done(); setTimeout(tick, 50); }; tick(); })');
  const out = await tab.evaluate(`(() => {
    const found = {};
    for (const el of document.querySelectorAll('[data-measure]')) found[el.dataset.measure] = Number(el.dataset.measured);
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

// A section headed "Short answers" that shows five closed rows has answered nothing. One answer is open in
// the markup, and the height animation must not collapse it: the closed state is a zero-height box, so a
// mistake there hides the only answer on the page.
test('the questions section shows an answer before it is clicked', { skip }, async () => {
  execFileSync(process.execPath, [join(root, 'site', 'build.mjs')], { stdio: 'ignore' });

  const chrome = await launch();
  try {
    const tab = await openPage(chrome.browser, { width: 1440, height: 900 });
    await tab.goto(toUrl(page));
    const shown = await tab.evaluate(`(() => [...document.querySelectorAll('.faq details[open]')].map((d) => {
      const p = d.querySelector('p');
      return { words: p.textContent.trim().split(/\\s+/).length, height: Math.round(p.getBoundingClientRect().height) };
    }))()`);
    await tab.close();
    assert.ok(shown.length >= 1, 'every answer is closed, so the section answers nothing');
    assert.ok(shown[0].words > 5, 'the open answer is empty');
    assert.ok(shown[0].height > 20, 'the open answer is rendered at no height');
  } finally {
    await chrome.close();
  }
});

// The nav is a map, not a message, and on a phone it is one control. Below the split the links fold into a
// panel behind a Menu button. Without it the bar shows a logo and a button and every section on the page is
// unreachable except by scrolling, which is the one thing a map is for.
test('the phone gets a menu that reaches every section', { skip }, async () => {
  execFileSync(process.execPath, [join(root, 'site', 'build.mjs')], { stdio: 'ignore' });

  const chrome = await launch();
  try {
    const tab = await openPage(chrome.browser, { width: 390, height: 844, mobile: true, deviceScaleFactor: 1 });
    await tab.goto(toUrl(page));

    const state = () => tab.evaluate(`(() => {
      const menu = document.querySelector('[data-menu]');
      if (!menu) return { missing: true };
      const panel = menu.querySelector('ul');
      return {
        missing: false,
        open: menu.open,
        // checkVisibility sees through a closed <details>, whose content still has a layout box.
        panelShown: panel.checkVisibility({ contentVisibilityAuto: true, visibilityProperty: true }),
        focused: document.activeElement === menu.querySelector('summary'),
        targets: [...panel.querySelectorAll('a[href^="#"]')].map((a) => a.getAttribute('href')),
      };
    })()`);
    await new Promise((r) => setTimeout(r, 600));
    const before = await state();
    assert.equal(before.missing, false, 'the phone has no menu control, so the sections are unreachable');
    assert.equal(before.open, false, 'the menu is open before it is touched');
    assert.equal(before.panelShown, false, 'the panel is visible before the menu is opened');
    assert.ok(before.targets.length >= 5, 'the panel does not carry the section links');

    // Every link in the panel has to land somewhere.
    const landed = await tab.evaluate(`(() => ${JSON.stringify(before.targets)}.map((href) => Boolean(document.querySelector(href))))()`);
    assert.deepEqual(landed, before.targets.map(() => true), 'a menu link points at a section that does not exist');

    await tab.evaluate(`document.querySelector('[data-menu] summary').click()`);
    await new Promise((r) => setTimeout(r, 150));
    const opened = await state();
    assert.equal(opened.open, true, 'the summary does not open the menu');
    assert.equal(opened.panelShown, true, 'the panel stays hidden after the menu is opened');

    await tab.evaluate(`document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))`);
    const closed = await state();
    assert.equal(closed.open, false, 'Escape does not close the menu');
    assert.equal(closed.focused, true, 'Escape closes the menu but drops the reader somewhere else');

    await tab.close();
  } finally {
    await chrome.close();
  }
});
