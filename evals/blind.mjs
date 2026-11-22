#!/usr/bin/env node
// Prepare blind side-by-side images for judging a round.
//
//   node evals/blind.mjs <round folder> [--out folder]
//
// The round folder holds one subfolder per brief, each with baseline.html and skilled.html.
// For every brief this renders both files at 390 and 1440 px, flips a coin for which one is "A",
// and writes A-1440.png, B-1440.png, A-390.png, B-390.png plus key.json (the answer, kept apart).
// Judge A against B with the rubric in README.md, then open key.json.

import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { isMain, parseArgs } from '../scripts/lib/args.mjs';
import { shoot } from '../scripts/shoot.mjs';

export async function prepare(round, out) {
  const key = {};
  for (const brief of readdirSync(round).filter((d) => existsSync(join(round, d, 'baseline.html')) && existsSync(join(round, d, 'skilled.html')))) {
    const aIsSkilled = Math.random() < 0.5;
    const files = { A: join(round, brief, aIsSkilled ? 'skilled.html' : 'baseline.html'), B: join(round, brief, aIsSkilled ? 'baseline.html' : 'skilled.html') };
    const dir = join(out, brief);
    mkdirSync(dir, { recursive: true });
    for (const side of ['A', 'B']) await shoot(files[side], { out: dir, label: side, widths: [390, 1440] });
    key[brief] = { A: aIsSkilled ? 'skilled' : 'baseline', B: aIsSkilled ? 'baseline' : 'skilled' };
  }
  writeFileSync(join(out, 'key.json'), JSON.stringify(key, null, 2));
  return key;
}

if (isMain(import.meta.url)) {
  const { positional, flags } = parseArgs(process.argv.slice(2));
  if (!positional[0]) {
    console.error('Usage: node evals/blind.mjs <round folder> [--out folder]');
    process.exit(2);
  }
  const out = flags.out ?? join(positional[0], 'blind');
  const key = await prepare(positional[0], out);
  console.log(`Prepared ${Object.keys(key).length} briefs in ${out}. Judge A against B first; key.json has the answer.`);
}
