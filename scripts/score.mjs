#!/usr/bin/env node
// Score one page with every measuring script and print one number.
//
//   node scripts/score.mjs <url or file> [--json] [--out dir --label name]   (--out also saves screenshots)
//
// Runs signs (tells), check (contrast, targets, names, focus, layout shift), drift and shoot (overflow).

import { isMain, parseArgs } from './lib/args.mjs';
import { score } from './lib/score.mjs';
import { check } from './check.mjs';
import { measure } from './drift.mjs';
import { scan } from './signs.mjs';
import { shoot } from './shoot.mjs';

export async function scorePage(target, { out, label = 'page' } = {}) {
  const tells = await scan(target);
  const checks = await check(target, [390, 1440]);
  const drift = await measure(target);
  const shots = await shoot(target, { out: out ?? '/tmp/inimitable-score', label, widths: [320, 390, 1440, 2560] });
  return { ...score({ tells, checks, drift, shoot: shots }), shots: shots.map((s) => s.file) };
}

if (isMain(import.meta.url)) {
  const { positional, flags } = parseArgs(process.argv.slice(2), { booleans: ['json'] });
  if (!positional[0]) {
    console.error('Usage: node scripts/score.mjs <url or file> [--json] [--out dir --label name]');
    process.exit(2);
  }
  const result = await scorePage(positional[0], { out: flags.out, label: flags.label });
  if (flags.json) console.log(JSON.stringify(result, null, 2));
  else {
    const b = result.breakdown;
    console.log(`score ${result.score}/100  tells ${b.tellKinds} kinds (${b.tellInstances})  problems ${b.checkProblems}  drift flags ${b.driftFlags}${b.sideways ? '  SCROLLS SIDEWAYS' : ''}${b.consoleErrors ? '  CONSOLE ERRORS' : ''}`);
    for (const t of result.tellList) console.log(`  tell: ${t}`);
    for (const c of result.checkList) console.log(`  problem: ${c}`);
    for (const d of result.driftList) console.log(`  drift: ${d}`);
  }
}
