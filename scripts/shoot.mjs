#!/usr/bin/env node
// Render a page at the four standard widths and save screenshots.
//
//   node scripts/shoot.mjs <url or file> [--out shots] [--label before] [--widths 320,390,1440,2560]
//                          [--full | --slices] [--dark | --light] [--wait 1500] [--eval 'js'] [--json]
//
//   --wait ms     settle time after load, for entrance animations and drawn charts (default 400)
//   --eval js     run this JavaScript in the page after load and before the shot, to set a state
//                 (click a tab, open a menu). It may be async: --eval "(async () => { ... })()"
//   --slices      instead of one image per width, save one image per screenful while scrolling,
//                 so scroll-triggered content shows and tall pages stay legible
//   --full        one tall image of the whole page (very tall pages are capped at 16,000 px)
//
// Prints one line per width: file, whether the page scrolls sideways, and console errors.
// Exit code 1 when any width scrolls sideways or logs an error, so it can gate a run.

import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { isMain, parseArgs } from './lib/args.mjs';
import { launch, openPage, toUrl } from './lib/chrome.mjs';

// Standard sizes: small phone, phone, desktop, big screen.
export const STANDARD = [
  { width: 320, height: 640, mobile: true, deviceScaleFactor: 2 },
  { width: 390, height: 844, mobile: true, deviceScaleFactor: 2 },
  { width: 1440, height: 900, mobile: false, deviceScaleFactor: 1 },
  { width: 2560, height: 1440, mobile: false, deviceScaleFactor: 1 },
];

const OVERFLOW = `(() => {
  const root = document.documentElement;
  const wide = [];
  for (const el of document.querySelectorAll('body *')) {
    const r = el.getBoundingClientRect();
    if (r.width && r.right > root.clientWidth + 1) {
      wide.push((el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\\s+/)[0] : '')));
      if (wide.length >= 5) break;
    }
  }
  return { scrollWidth: root.scrollWidth, clientWidth: root.clientWidth, sideways: root.scrollWidth > root.clientWidth + 1, wide };
})()`;

export async function shoot(target, options = {}) {
  const {
    out = 'shots',
    label = 'shot',
    widths,
    full = false,
    slices = false,
    wait = 400,
    evalJs,
    colorScheme,
  } = options;
  const sizes = widths ? widths.map((w) => STANDARD.find((s) => s.width === w) ?? { width: w, height: Math.round(w * 0.62), mobile: w < 700, deviceScaleFactor: w < 700 ? 2 : 1 }) : STANDARD;
  mkdirSync(out, { recursive: true });
  const chrome = await launch();
  const results = [];
  try {
    for (const size of sizes) {
      const page = await openPage(chrome.browser, { ...size, colorScheme });
      await page.goto(toUrl(target), wait);
      if (evalJs) {
        await page.evaluate(evalJs);
        await new Promise((r) => setTimeout(r, Math.min(wait, 1500)));
      }
      const overflow = await page.evaluate(OVERFLOW);
      const file = join(out, `${label}-${size.width}.png`);
      const extra = [];
      if (slices) {
        const total = await page.evaluate('document.documentElement.scrollHeight');
        const step = size.height;
        for (let y = 0, n = 1; y < total && n <= 12; y += step, n++) {
          await page.evaluate(`window.scrollTo(0, ${y})`);
          await new Promise((r) => setTimeout(r, 350));
          const sliceFile = join(out, `${label}-${size.width}-${String(n).padStart(2, '0')}.png`);
          writeFileSync(sliceFile, await page.screenshot());
          extra.push(sliceFile);
        }
        await page.evaluate('window.scrollTo(0, 0)');
      } else writeFileSync(file, await page.screenshot({ fullPage: full }));
      results.push({ width: size.width, file: slices ? extra[0] : file, slices: extra, ...overflow, errors: [...page.logs] });
      await page.close();
    }
  } finally {
    await chrome.close();
  }
  return results;
}

if (isMain(import.meta.url)) {
  const { positional, flags } = parseArgs(process.argv.slice(2), { booleans: ['full', 'slices', 'dark', 'light', 'json'] });
  if (!positional[0]) {
    console.error('Usage: node scripts/shoot.mjs <url or file> [--out dir] [--label name] [--widths 320,390] [--full|--slices] [--wait ms] [--eval js] [--dark|--light] [--json]');
    process.exit(2);
  }
  const results = await shoot(positional[0], {
    out: flags.out,
    label: flags.label,
    widths: flags.widths ? String(flags.widths).split(',').map(Number) : undefined,
    full: Boolean(flags.full),
    slices: Boolean(flags.slices),
    wait: flags.wait ? Number(flags.wait) : 400,
    evalJs: typeof flags.eval === 'string' ? flags.eval : undefined,
    colorScheme: flags.dark ? 'dark' : flags.light ? 'light' : undefined,
  });
  if (flags.json) console.log(JSON.stringify(results, null, 2));
  else {
    for (const r of results) {
      const notes = [];
      if (r.sideways) notes.push(`scrolls sideways (${r.scrollWidth} > ${r.clientWidth}; ${r.wide.join(', ')})`);
      if (r.errors.length) notes.push(`${r.errors.length} console error(s): ${r.errors[0]}`);
      console.log(`${String(r.width).padStart(4)} px  ${r.slices?.length ? `${r.slices.length} slices from ${r.file}` : r.file}  ${notes.length ? 'WARN ' + notes.join('; ') : 'ok'}`);
    }
  }
  process.exit(results.some((r) => r.sideways || r.errors.length) ? 1 : 0);
}
