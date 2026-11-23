#!/usr/bin/env node
// Start a page from the landing starter: a complete, tested layout with a lit grainient ground, a floating nav,
// a product frame, a bento, steps, a big number, a closing call and a footer, with the motion kit wired in.
//
//   node scripts/scaffold.mjs <folder> [--theme dark|light] [--palette ember] [--shape bowl] [--accent '#e8742c']
//                             [--seed 1] [--grain 0.45]
//
//   theme    dark or light (default dark)
//   palette  one of the built-in grounds (see assets/recipes/mesh.mjs), or use --accent to derive one
//   shape    pools | horizon | bowl | blob | sweep for the hero ground (default: bowl on dark, blob on light)
//
// Everything marked data-todo is placeholder. Replace it with the product's real words and numbers.
// signs.mjs reports every data-todo left on a page, so unfinished copy cannot ship.

import { copyFileSync, cpSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PALETTES, fromAccent, grainient, hexToHsl, hslToHex } from '../assets/recipes/mesh.mjs';
import { isMain, parseArgs } from './lib/args.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

export function themeCss({ dark, palette }) {
  const counter = palette.counter;
  const { h } = hexToHsl(counter);
  const accent = dark ? counter : hslToHex(h, 0.62, 0.4);
  const onAccent = dark ? '#0b0a0f' : '#ffffff';
  const t = dark
    ? { ink: '#f3f1ec', ink2: '#bcb8b0', ink3: '#908c85', line: 'rgba(243,241,236,0.10)', strong: 'rgba(243,241,236,0.22)', surface: `color-mix(in srgb, #ffffff 4%, ${palette.base})` }
    : { ink: '#17150f', ink2: '#3f3a33', ink3: '#58524a', line: 'rgba(23,21,15,0.10)', strong: 'rgba(23,21,15,0.22)', surface: `color-mix(in srgb, #ffffff 62%, ${palette.base})` };
  return `/* Theme: written by scaffold.mjs. Edit the values to make them the product's own. */
:root {
  --bg: ${palette.base};
  --ink: ${t.ink};
  --ink-2: ${t.ink2};
  --ink-3: ${t.ink3};
  --line: ${t.line};
  --line-strong: ${t.strong};
  --surface: ${t.surface};
  --accent: ${accent};
  --on-accent: ${onAccent};
  --radius: 1.75rem;
  color-scheme: ${dark ? 'dark' : 'light'};
}
`;
}

export function scaffold(dest, { theme = 'dark', palette = 'midnight', accent, shape, seed = 1, grain = 0.45 } = {}) {
  const dark = theme === 'dark';
  let pal;
  if (accent) pal = fromAccent(accent, { dark });
  else {
    pal = PALETTES[palette === 'midnight' && !dark ? 'ember' : palette];
    if (!pal) throw new Error(`Unknown palette "${palette}". Use one of ${Object.keys(PALETTES).join(', ')} or --accent '#hex'.`);
    if (Boolean(pal.dark) !== dark) throw new Error(`The ${palette} palette is ${pal.dark ? 'dark' : 'light'}: use --theme ${pal.dark ? 'dark' : 'light'}, or pick another palette.`);
  }
  const heroShape = shape || (dark ? 'bowl' : 'blob');
  const hero = grainient({ palette: pal, shape: heroShape, seed, grain, selector: '.hero .ground', mask: heroShape === 'blob' || heroShape === 'sweep' ? 'none' : 'bottom' });
  const closer = grainient({ palette: pal, shape: dark ? 'horizon' : 'pools', seed: seed + 7, grain, selector: '.closer .ground', mask: 'radial' });

  mkdirSync(dest, { recursive: true });
  const starter = join(root, 'assets', 'starters', 'landing');
  writeFileSync(join(dest, 'index.html'), readFileSync(join(starter, 'index.html'), 'utf8').replace('data-theme="dark"', `data-theme="${theme}"`));
  copyFileSync(join(starter, 'landing.css'), join(dest, 'landing.css'));
  copyFileSync(join(root, 'assets', 'motion', 'motion.css'), join(dest, 'motion.css'));
  copyFileSync(join(root, 'assets', 'motion', 'motion.js'), join(dest, 'motion.js'));
  cpSync(join(root, 'assets', 'fonts'), join(dest, 'fonts'), { recursive: true });
  writeFileSync(join(dest, 'ground.css'), `${themeCss({ dark, palette: pal })}\n/* Hero ground */\n${hero.css}\n\n/* Closing ground */\n${closer.css}\n`);
  const todo = (readFileSync(join(dest, 'index.html'), 'utf8').match(/data-todo/g) || []).length;
  return { dest, todo, palette: pal, problems: [...hero.problems, ...closer.problems], shape: heroShape };
}

if (isMain(import.meta.url)) {
  const { positional, flags } = parseArgs(process.argv.slice(2));
  if (!positional[0]) {
    console.error("Usage: node scripts/scaffold.mjs <folder> [--theme dark|light] [--palette ember] [--shape bowl] [--accent '#e8742c'] [--seed 1] [--grain 0.45]");
    process.exit(2);
  }
  try {
    const result = scaffold(positional[0], {
      theme: flags.theme === 'light' ? 'light' : 'dark',
      palette: typeof flags.palette === 'string' ? flags.palette : undefined,
      accent: typeof flags.accent === 'string' ? flags.accent : undefined,
      shape: typeof flags.shape === 'string' ? flags.shape : undefined,
      seed: flags.seed ? Number(flags.seed) : 1,
      grain: flags.grain ? Number(flags.grain) : 0.45,
    });
    console.log(`Started ${result.dest}  (${flags.theme === 'light' ? 'light' : 'dark'}, ${result.shape} ground)`);
    console.log(`${result.todo} placeholders to replace (every data-todo). signs.mjs lists any left.`);
    for (const p of result.problems) console.log(`warning: ${p}`);
    console.log('\nNext: replace the placeholders with the real content, then run shoot, signs, check and craft on index.html.');
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}
