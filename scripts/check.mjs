#!/usr/bin/env node
// Measured accessibility and quality checks: contrast, touch targets, small text, names, document basics.
//
//   node scripts/check.mjs <url or file> [--widths 390,1440] [--json]
//
// Touch targets need 44 px under 700 px wide and 24 px above (WCAG 2.2). Exit code 1 on any problem.

import { isMain, parseArgs } from './lib/args.mjs';
import { format, judge } from './lib/check-report.mjs';
import { launch, openPage, toUrl } from './lib/chrome.mjs';
import { sampleBackdrops } from './lib/backdrop.mjs';
import { CHECK } from './lib/probe.mjs';

export async function check(target, widths = [390, 1440]) {
  const chrome = await launch();
  const results = [];
  try {
    for (const width of widths) {
      const page = await openPage(chrome.browser, { width, height: width < 700 ? 844 : 900, mobile: width < 700, deviceScaleFactor: 1 });
      await page.goto(toUrl(target));
      // Let entrance animations and transitions reach their end state, or text measured mid-fade looks low in contrast.
      await page.evaluate("document.getAnimations().forEach((a) => { try { a.finish(); } catch {} })");
      await new Promise((resolve) => setTimeout(resolve, 150));
      const raw = await page.evaluate(CHECK);
      try {
        // A page that scrolls sideways is scaled to fit by mobile browsers, so screenshot pixels no longer line up with
        // the page. That problem is reported on its own; do not add false contrast flags on top of it.
        if (raw.sideways) throw new Error('the page scrolls sideways');
        const samples = await sampleBackdrops(page);
        for (const t of raw.text) t.samples = samples.get(t.idx);
      } catch (error) {
        if (!raw.sideways) console.error(`Could not sample rendered backgrounds (${error.message}); using element-based backgrounds.`);
      }
      results.push({ width, ...judge(raw, { width }) });
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
    console.error('Usage: node scripts/check.mjs <url or file> [--widths 390,1440] [--json]');
    process.exit(2);
  }
  const results = await check(positional[0], flags.widths ? String(flags.widths).split(',').map(Number) : undefined);
  if (flags.json) console.log(JSON.stringify(results, null, 2));
  else console.log(results.map((r) => format(r, r.width)).join('\n\n'));
  process.exit(results.some((r) => r.problems.length) ? 1 : 0);
}
