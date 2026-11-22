#!/usr/bin/env node
// Find machine-made tells in a rendered page (see references/anti-slop.md).
//
//   node scripts/signs.mjs <url or file> [--width 1440] [--allow 'Tell one,Tell two'] [--json]
//
//   --allow  tells the project's committed direction licenses on purpose (for example 'Uppercase tracked label'
//            for an instrument-style direction). Name them in the report. Never allow a tell just to pass.
//
// Exit code 1 when any tell is found, so it can gate a run. Mark elements the project's own brand
// requires with data-brand to skip them, and mark genuinely live elements with data-live.

import { isMain, parseArgs } from './lib/args.mjs';
import { launch, openPage, toUrl } from './lib/chrome.mjs';
import { SIGNS } from './lib/probe.mjs';

export async function scan(target, width = 1440, { allow = [] } = {}) {
  const chrome = await launch();
  try {
    const page = await openPage(chrome.browser, { width, height: width < 700 ? 844 : 900, mobile: width < 700 });
    await page.goto(toUrl(target));
    const found = await page.evaluate(SIGNS);
    const licensed = new Set(allow.map((a) => a.trim().toLowerCase()));
    return found.filter((f) => !licensed.has(f.tell.toLowerCase()));
  } finally {
    await chrome.close();
  }
}

export function group(findings) {
  const by = new Map();
  for (const f of findings) {
    if (!by.has(f.tell)) by.set(f.tell, []);
    by.get(f.tell).push(f);
  }
  return by;
}

export function format(findings) {
  if (!findings.length) return 'No tells found.';
  const lines = [];
  for (const [tell, items] of group(findings)) {
    lines.push(`${tell} (${items.length})`);
    for (const item of items.slice(0, 4)) lines.push(`  ${item.where}  ${item.detail}`);
    if (items.length > 4) lines.push(`  and ${items.length - 4} more`);
  }
  return lines.join('\n');
}

if (isMain(import.meta.url)) {
  const { positional, flags } = parseArgs(process.argv.slice(2), { booleans: ['json'] });
  if (!positional[0]) {
    console.error('Usage: node scripts/signs.mjs <url or file> [--width 1440] [--allow "Tell one,Tell two"] [--json]');
    process.exit(2);
  }
  const allow = typeof flags.allow === 'string' ? flags.allow.split(',') : [];
  const findings = await scan(positional[0], flags.width ? Number(flags.width) : 1440, { allow });
  console.log(flags.json ? JSON.stringify(findings, null, 2) : format(findings));
  process.exit(findings.length ? 1 : 0);
}
