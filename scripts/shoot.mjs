#!/usr/bin/env node
// Render a page at the four standard widths and save screenshots.
//
//   node scripts/shoot.mjs <url or file> [--out shots] [--label before] [--widths 320,390,1440,2560]
//                          [--full] [--dark | --light] [--json]
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
    colorScheme,
  } = options;
  const sizes = widths ? widths.map((w) => STANDARD.find((s) => s.width === w) ?? { width: w, height: Math.round(w * 0.62), mobile: w < 700, deviceScaleFactor: w < 700 ? 2 : 1 }) : STANDARD;
  mkdirSync(out, { recursive: true });
  const chrome = await launch();
  const results = [];
  try {
    for (const size of sizes) {
      const page = await openPage(chrome.browser, { ...size, colorScheme });
      await page.goto(toUrl(target));
      const overflow = await page.evaluate(OVERFLOW);
      const file = join(out, `${label}-${size.width}.png`);
      writeFileSync(file, await page.screenshot({ fullPage: full }));
      results.push({ width: size.width, file, ...overflow, errors: [...page.logs] });
      await page.close();
    }
  } finally {
    await chrome.close();
  }
  return results;
}

if (isMain(import.meta.url)) {
  const { positional, flags } = parseArgs(process.argv.slice(2), { booleans: ['full', 'dark', 'light', 'json'] });
  if (!positional[0]) {
    console.error('Usage: node scripts/shoot.mjs <url or file> [--out dir] [--label name] [--widths 320,390] [--full] [--dark|--light] [--json]');
    process.exit(2);
  }
  const results = await shoot(positional[0], {
    out: flags.out,
    label: flags.label,
    widths: flags.widths ? String(flags.widths).split(',').map(Number) : undefined,
    full: Boolean(flags.full),
    colorScheme: flags.dark ? 'dark' : flags.light ? 'light' : undefined,
  });
  if (flags.json) console.log(JSON.stringify(results, null, 2));
  else {
    for (const r of results) {
      const notes = [];
      if (r.sideways) notes.push(`scrolls sideways (${r.scrollWidth} > ${r.clientWidth}; ${r.wide.join(', ')})`);
      if (r.errors.length) notes.push(`${r.errors.length} console error(s): ${r.errors[0]}`);
      console.log(`${String(r.width).padStart(4)} px  ${r.file}  ${notes.length ? 'WARN ' + notes.join('; ') : 'ok'}`);
    }
  }
  process.exit(results.some((r) => r.sideways || r.errors.length) ? 1 : 0);
}
