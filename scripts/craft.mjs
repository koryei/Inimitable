#!/usr/bin/env node
// Craft checks: does every control answer the pointer, and does motion stay cheap and stoppable?
//
//   node scripts/craft.mjs <url or file> [--widths 390,1440] [--shots dir] [--json]
//
// Hover is tested the only way that means anything: a real mouse move over the control, then a diff of
// its computed style and its children's. A control whose hover changes nothing is reported, because a
// page where nothing answers the pointer reads as a picture of a page.
//
// Also reported: transitions on layout properties (they force a reflow every frame), a missing
// prefers-reduced-motion block, and looping animations that keep running when motion is reduced.
//
// Exit code 1 on any problem.

import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { isMain, parseArgs } from './lib/args.mjs';
import { launch, openPage, toUrl } from './lib/chrome.mjs';

// What a hover is allowed to change. Anything outside this list is not a hover state, it is a layout jump.
const WATCHED = [
  'color', 'background-color', 'background-image', 'border-color', 'border-width', 'box-shadow',
  'transform', 'translate', 'scale', 'opacity', 'filter', 'outline-color', 'outline-width',
  'text-decoration-color', 'text-decoration-thickness', 'letter-spacing', 'clip-path', 'fill', 'stroke',
];

// Properties that cost a reflow when animated. Transform and opacity are the cheap ones; these are not.
const LAYOUT = [
  'width', 'height', 'top', 'right', 'bottom', 'left', 'inset', 'margin', 'margin-top', 'margin-right',
  'margin-bottom', 'margin-left', 'padding', 'padding-top', 'padding-right', 'padding-bottom',
  'padding-left', 'font-size', 'line-height', 'gap', 'row-gap', 'column-gap', 'border-width', 'flex-basis',
];

const CONTROLS = `(() => {
  const sel = 'a[href], button, input:not([type=hidden]), select, textarea, summary, [tabindex]:not([tabindex="-1"]), [role="button"], [role="tab"], [role="link"]';
  const name = (el) => (el.getAttribute('aria-label') || el.textContent || el.value || el.getAttribute('placeholder') || '').trim().replace(/\\s+/g, ' ').slice(0, 48);
  const where = (el) => el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (typeof el.className === 'string' && el.className.trim() ? '.' + el.className.trim().split(/\\s+/)[0] : '');
  return [...document.querySelectorAll(sel)]
    .filter((el) => {
      const r = el.getBoundingClientRect();
      const s = getComputedStyle(el);
      return r.width > 0 && r.height > 0 && r.bottom > 0 && s.visibility !== 'hidden' && s.display !== 'none' && Number(s.opacity) > 0;
    })
    .map((el, i) => {
      el.setAttribute('data-craft', String(i));
      return { i, where: where(el), label: name(el), tag: el.tagName.toLowerCase() };
    });
})()`;

// A fingerprint of the control and everything inside it, so a hover that only moves a child still counts.
const fingerprint = (i) => `(() => {
  const el = document.querySelector('[data-craft="${i}"]');
  if (!el) return null;
  const props = ${JSON.stringify(WATCHED)};
  // Pseudo-elements count: an underline drawn with ::after, or a mark whose hole closes, is a real hover state.
  const read = (node, pseudo) => props.map((p) => getComputedStyle(node, pseudo).getPropertyValue(p)).join('|');
  const readAll = (node) => [read(node), read(node, '::before'), read(node, '::after')].join('~');
  const nodes = [el, ...el.querySelectorAll('*')].slice(0, 40);
  // The geometric centre can miss: an inline element whose box is wider than its text has empty space in the
  // middle. Try the centre, then points along the box, then the text itself, and keep the first that lands.
  const r = el.getBoundingClientRect();
  const candidates = [[0.5, 0.5], [0.25, 0.5], [0.75, 0.5], [0.5, 0.25], [0.5, 0.75]];
  const range = document.createRange();
  range.selectNodeContents(el);
  const text = range.getBoundingClientRect();
  if (text.width && text.height) candidates.push([(text.left + text.width / 2 - r.left) / r.width, (text.top + text.height / 2 - r.top) / r.height]);
  let point = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  for (const [fx, fy] of candidates) {
    const px = r.left + r.width * fx;
    const py = r.top + r.height * fy;
    const hit = document.elementFromPoint(px, py);
    if (hit && (hit === el || el.contains(hit))) { point = { x: px, y: py }; break; }
  }
  return { rect: r.toJSON(), point, print: nodes.map(readAll).join('\\n') };
})()`;

const STATIC = `(() => {
  const layout = ${JSON.stringify(LAYOUT)};
  const bad = [];
  const seen = new Set();
  for (const el of document.querySelectorAll('body *')) {
    const s = getComputedStyle(el);
    const props = s.transitionProperty.split(',').map((p) => p.trim());
    const hit = props.filter((p) => layout.includes(p));
    if (!hit.length) continue;
    const where = el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (typeof el.className === 'string' && el.className.trim() ? '.' + el.className.trim().split(/\\s+/)[0] : '');
    const key = where + hit.join();
    if (seen.has(key)) continue;
    seen.add(key);
    bad.push({ where, detail: 'transitions ' + hit.join(', ') + ', which reflows every frame; use transform or opacity' });
  }
  let reduced = false;
  const walk = (rules) => {
    for (const rule of rules) {
      if (rule.conditionText && /prefers-reduced-motion/.test(rule.conditionText)) reduced = true;
      if (rule.cssRules) walk(rule.cssRules);
    }
  };
  for (const sheet of document.styleSheets) {
    try { walk(sheet.cssRules); } catch {}
  }
  return { layout: bad, reduced };
})()`;

// The honest reduced-motion test: turn the setting on and see what still moves. Reading the stylesheet is not
// enough, because a file:// page hides its rules from the script and a rule can exist without covering anything.
const REDUCED_RUNNING = `(() => {
  const running = [];
  const seen = new Set();
  for (const el of document.querySelectorAll('body *')) {
    const s = getComputedStyle(el);
    const name = s.animationName;
    const dur = parseFloat(s.animationDuration) || 0;
    if (!name || name === 'none' || dur <= 0.05) continue;
    const where = el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (typeof el.className === 'string' && el.className.trim() ? '.' + el.className.trim().split(/\\s+/)[0] : '');
    if (seen.has(where)) continue;
    seen.add(where);
    running.push(where + ' (' + name + ', ' + dur + 's)');
  }
  return running;
})()`;

// Under reduced motion, a looping animation must be off, not merely slower.
const LOOPS_STOPPED = `(() => {
  const running = [];
  for (const el of document.querySelectorAll('[data-loop]')) {
    const s = getComputedStyle(el);
    const name = s.animationName;
    const dur = parseFloat(s.animationDuration) || 0;
    if (name && name !== 'none' && dur > 0.05) {
      running.push(el.tagName.toLowerCase() + (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\\s+/)[0] : '') + ' (' + name + ')');
    }
  }
  return running;
})()`;

export async function craft(target, { widths = [390, 1440], shots } = {}) {
  const chrome = await launch();
  const results = [];
  try {
    for (const width of widths) {
      const page = await openPage(chrome.browser, { width, height: width < 700 ? 844 : 900, mobile: width < 700, deviceScaleFactor: 1 });
      await page.goto(toUrl(target), 900);
      await page.evaluate('document.getAnimations().forEach((a) => { try { a.finish(); } catch {} })');
      await new Promise((r) => setTimeout(r, 150));

      const problems = [];
      const static_ = await page.evaluate(STATIC);
      for (const b of static_.layout) problems.push({ kind: 'layout transition', where: b.where, detail: b.detail });

      const controls = await page.evaluate(CONTROLS);
      const silent = [];
      for (const c of controls) {
        // Park the control in the middle of the viewport, then move the real pointer onto it.
        await page.evaluate(`(() => {
          const el = document.querySelector('[data-craft="${c.i}"]');
          if (el) el.scrollIntoView({ block: 'center', behavior: 'instant' });
        })()`);
        await new Promise((r) => setTimeout(r, 120));
        const before = await page.evaluate(fingerprint(c.i));
        if (!before) continue;
        const x = Math.round(before.point.x);
        const y = Math.round(before.point.y);
        await page.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y, buttons: 0 });
        await new Promise((r) => setTimeout(r, 420));
        const after = await page.evaluate(fingerprint(c.i));
        await page.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 1, y: 1, buttons: 0 });
        await new Promise((r) => setTimeout(r, 120));
        if (after && after.print === before.print) silent.push(c);

        if (shots) {
          mkdirSync(shots, { recursive: true });
          const pad = 14;
          const clip = {
            x: Math.max(0, before.rect.x - pad),
            y: Math.max(0, before.rect.y - pad),
            width: Math.min(width, before.rect.width + pad * 2),
            height: before.rect.height + pad * 2,
            scale: 2,
          };
          const slug = `${String(c.i).padStart(2, '0')}-${c.where.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '')}`;
          writeFileSync(join(shots, `${width}-${slug}-rest.png`), await page.screenshot({ clip }));
          await page.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y, buttons: 0 });
          await new Promise((r) => setTimeout(r, 420));
          writeFileSync(join(shots, `${width}-${slug}-hover.png`), await page.screenshot({ clip }));
          await page.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 1, y: 1, buttons: 0 });
        }
      }
      for (const c of silent) {
        problems.push({ kind: 'silent hover', where: c.where, detail: `hovering changes nothing${c.label ? ` ("${c.label}")` : ''}` });
      }

      // Reduced motion: the same page with the setting on. Anything still moving is a problem, and so is a
      // loop that keeps restarting.
      await page.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
      await new Promise((r) => setTimeout(r, 250));
      const stillMoving = await page.evaluate(REDUCED_RUNNING);
      for (const r of stillMoving) problems.push({ kind: 'reduced motion', where: r, detail: 'still animates when motion is reduced' });
      const loops = await page.evaluate(LOOPS_STOPPED);
      for (const r of loops) problems.push({ kind: 'reduced motion', where: r, detail: 'looping animation keeps running when motion is reduced' });

      results.push({ width, controls: controls.length, problems });
      await page.close();
    }
  } finally {
    await chrome.close();
  }
  return results;
}

if (isMain(import.meta.url)) {
  const { positional, flags } = parseArgs(process.argv.slice(2), { booleans: ['json'] });
  if (!positional[0]) {
    console.error('Usage: node scripts/craft.mjs <url or file> [--widths 390,1440] [--shots dir] [--json]');
    process.exit(2);
  }
  const results = await craft(positional[0], {
    widths: flags.widths ? String(flags.widths).split(',').map(Number) : undefined,
    shots: typeof flags.shots === 'string' ? flags.shots : undefined,
  });
  if (flags.json) console.log(JSON.stringify(results, null, 2));
  else {
    for (const r of results) {
      if (!r.problems.length) {
        console.log(`${r.width} px  ${r.controls} controls, every one answers the pointer. ok`);
        continue;
      }
      console.log(`${r.width} px  ${r.controls} controls, ${r.problems.length} problem(s):`);
      for (const p of r.problems) console.log(`  ${p.kind}: ${p.where} — ${p.detail}`);
    }
  }
  process.exit(results.some((r) => r.problems.length) ? 1 : 0);
}
