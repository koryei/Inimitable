#!/usr/bin/env node
// Run a terminal program at a fixed size and capture what the screen shows, as text and as an image.
//
//   node scripts/term-shot.mjs [--cols 80] [--rows 30] [--label name] [--out shots]
//                              [--no-color] [--keys 'text\n'] [--wait 1500] [--timeout 15000] -- <command> [args]
//
// The command runs in a real pseudo-terminal (via python3), so colours, spinners and cursor
// movement behave as they do for a person. Writes <label>-<cols>.txt, .html and .png.
// Exit code 1 when any line had to wrap at the chosen width.

import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { isMain, parseArgs } from './lib/args.mjs';
import { launch, openPage, toUrl } from './lib/chrome.mjs';
import { Terminal } from './lib/vt.mjs';

const HELPER = fileURLToPath(new URL('./lib/pty-run.py', import.meta.url));

export function runInTerminal(command, { cols = 80, rows = 30, noColor = false, keys = '', wait = 1500, timeout = 15000 } = {}) {
  return new Promise((resolve) => {
    const term = new Terminal(cols, rows);
    const env = { ...process.env, TERM: 'xterm-256color', COLUMNS: String(cols), LINES: String(rows) };
    if (noColor) {
      env.NO_COLOR = '1';
      delete env.FORCE_COLOR;
    } else {
      delete env.NO_COLOR;
      env.FORCE_COLOR = '1';
    }
    const child = spawn('python3', [HELPER, String(cols), String(rows), String(timeout), String(wait), keys, '--', ...command], { env, stdio: ['ignore', 'pipe', 'pipe'] });
    let failed = '';
    child.stdout.on('data', (d) => term.write(d));
    child.stderr.on('data', (d) => { failed += d; });
    child.on('error', (e) => resolve({ term, code: 127, timedOut: false, error: `python3 is needed to open a terminal: ${e.message}` }));
    child.on('exit', (code) => resolve({ term, code, timedOut: code === 124, error: failed.trim() || undefined }));
  });
}

if (isMain(import.meta.url)) {
  const sep = process.argv.indexOf('--');
  const own = sep === -1 ? process.argv.slice(2) : process.argv.slice(2, sep);
  const command = sep === -1 ? [] : process.argv.slice(sep + 1);
  const { flags } = parseArgs(own, { booleans: ['no-color'] });
  if (!command.length) {
    console.error('Usage: node scripts/term-shot.mjs [--cols 80] [--rows 30] [--label name] [--out dir] [--no-color] [--keys text] [--wait ms] -- <command> [args]');
    process.exit(2);
  }
  const cols = Number(flags.cols ?? 80);
  const out = flags.out ?? 'shots';
  const label = flags.label ?? 'term';
  mkdirSync(out, { recursive: true });
  const { term, code, timedOut, error } = await runInTerminal(command, {
    cols,
    rows: Number(flags.rows ?? 30),
    noColor: Boolean(flags['no-color']),
    keys: typeof flags.keys === 'string' ? flags.keys : '',
    wait: Number(flags.wait ?? 1500),
    timeout: Number(flags.timeout ?? 15000),
  });
  const base = join(out, `${label}-${cols}${flags['no-color'] ? '-nocolor' : ''}`);
  writeFileSync(`${base}.txt`, `${term.text()}\n`);
  writeFileSync(`${base}.html`, term.html());
  let png = null;
  try {
    const chrome = await launch();
    try {
      const lines = term.rowsAll().length;
      const page = await openPage(chrome.browser, { width: Math.ceil(cols * 8.7 + 40), height: Math.max(120, Math.ceil(lines * 18.2 + 40)), deviceScaleFactor: 2 });
      await page.goto(toUrl(`${base}.html`), 200);
      writeFileSync(`${base}.png`, await page.screenshot());
      png = `${base}.png`;
    } finally {
      await chrome.close();
    }
  } catch (error) {
    console.error(`No image: ${error.message}`);
  }
  if (error) console.error(error);
  const colours = Object.keys(term.colours()).length;
  console.log(`${base}.txt${png ? `  ${png}` : ''}`);
  console.log(`exit ${code}${timedOut ? ' (timed out)' : ''}; ${term.rowsAll().length} lines; ${colours} colour(s) used; ${term.wrapped} line(s) wrapped at ${cols} columns`);
  process.exit(term.wrapped ? 1 : 0);
}
