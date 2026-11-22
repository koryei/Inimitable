#!/usr/bin/env node
// Count the font sizes, weights, radii, colours and spacing values a page really uses.
//
//   node scripts/drift.mjs <url or file> [--width 1440] [--json] [--save before.json]
//   node scripts/drift.mjs <url or file> --against before.json      (prints before -> after)
//
// Run it before the work (step 1) and again after (step 6). The report shows the drift going down.

import { readFileSync, writeFileSync } from 'node:fs';
import { isMain, parseArgs } from './lib/args.mjs';
import { launch, openPage, toUrl } from './lib/chrome.mjs';
import { analyse, compare, format } from './lib/drift-report.mjs';
import { DRIFT } from './lib/probe.mjs';

export async function measure(target, width = 1440) {
  const chrome = await launch();
  try {
    const page = await openPage(chrome.browser, { width, height: width < 700 ? 844 : 900, mobile: width < 700 });
    await page.goto(toUrl(target));
    const raw = await page.evaluate(DRIFT);
    return analyse(raw);
  } finally {
    await chrome.close();
  }
}

if (isMain(import.meta.url)) {
  const { positional, flags } = parseArgs(process.argv.slice(2), { booleans: ['json'] });
  if (!positional[0]) {
    console.error('Usage: node scripts/drift.mjs <url or file> [--width 1440] [--json] [--save file] [--against file]');
    process.exit(2);
  }
  const report = await measure(positional[0], flags.width ? Number(flags.width) : 1440);
  if (flags.save) writeFileSync(flags.save, JSON.stringify(report, null, 2));
  if (flags.against) {
    const before = JSON.parse(readFileSync(flags.against, 'utf8'));
    for (const row of compare(before, report)) console.log(`${row.metric.padEnd(14)} ${String(row.before).padStart(3)} -> ${String(row.after).padStart(3)}`);
  } else if (flags.json) console.log(JSON.stringify(report, null, 2));
  else console.log(format(report));
}
