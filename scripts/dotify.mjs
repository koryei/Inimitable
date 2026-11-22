#!/usr/bin/env node
// Turn any picture, drawn SVG or HTML into a dithered, dotted, halftone, hex-cell or ASCII image.
//
//   node scripts/dotify.mjs <input> [--mode fs|ordered|stipple|halftone|hex|ascii] [--dots 140] [--cell 6]
//                           [--fill '#e8e6e1'] [--bg '#0f0f10'] [--invert] [--contrast 1.2] [--gamma 1]
//                           [--threshold 0] [--out result.svg]
//
//   input    .png (read directly), or .svg .html .jpg .webp (rendered in Chrome first)
//   --dots   how many dots across (default 140); --cell is each dot's size in the output (default 6)
//   --invert flips light and dark: use it when the subject should be light dots on a dark page
//   --no-trim keeps the empty space around the subject (by default it is cropped away)
//   ascii    writes the characters as text instead of an SVG
//
// This is how a subject becomes a "computational" hero object: one picture, one texture, one or two colours.
// Use only images you have the right to use.

import { readFileSync, writeFileSync } from 'node:fs';
import { basename, extname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { asciiLines, contentBox, crop, downsample, ditherSvg, fieldFromImage, floydSteinberg, halftoneSvg, orderedDither, stipple } from '../assets/recipes/dither.mjs';
import { isMain, parseArgs } from './lib/args.mjs';
import { launch, openPage } from './lib/chrome.mjs';
import { decodePng } from './lib/png.mjs';

async function render(input, width) {
  const ext = extname(input).toLowerCase();
  let url = pathToFileURL(resolve(input)).href;
  if (['.jpg', '.jpeg', '.webp', '.gif', '.avif'].includes(ext)) {
    // Wrap a photo in a page so it fills the width with no margin.
    const html = `<!doctype html><body style="margin:0;background:#fff"><img src="${url}" style="display:block;width:100%">`;
    url = `data:text/html;base64,${Buffer.from(html).toString('base64')}`;
  }
  const chrome = await launch();
  try {
    const page = await openPage(chrome.browser, { width, height: 800, deviceScaleFactor: 1 });
    await page.goto(url, 300);
    const height = Math.min(4000, Math.max(100, Math.ceil(await page.evaluate('Math.max(document.documentElement.scrollHeight, document.body.scrollHeight)'))));
    await page.send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false });
    await new Promise((r) => setTimeout(r, 200));
    return await page.screenshot();
  } finally {
    await chrome.close();
  }
}

export async function dotify(input, options = {}) {
  const { mode = 'fs', dots = 140, cell = 6, fill = '#e8e6e1', bg, invert = false, contrast = 1, gamma = 1, threshold = 0 } = options;
  const png = extname(input).toLowerCase() === '.png' ? readFileSync(input) : await render(input, Math.max(dots * 4, 640));
  const image = decodePng(png);
  let field0 = fieldFromImage(image, { invert: false, contrast, gamma });
  if (options.trim !== false) field0 = crop(field0, contentBox(field0));
  if (invert) field0 = { ...field0, data: field0.data.map((v) => 1 - v) };
  const factor = Math.max(1, Math.floor(field0.width / dots));
  const field = factor > 1 ? downsample(field0, factor) : field0;
  if (mode === 'ascii') return { text: asciiLines(field, { cell: 1, aspect: 2, invert }).join('\n') };
  if (mode === 'halftone' || mode === 'hex') return { svg: halftoneSvg(field, { cell, fill, background: bg, hex: mode === 'hex', maxRadius: cell * 0.5, invert, scale: cell }) };
  const grid = mode === 'ordered' ? orderedDither(field, { threshold }) : mode === 'stipple' ? stipple(field, { seed: 3 }) : floydSteinberg(field, { threshold: 0.5 - threshold });
  // Without --invert the dark parts of the picture become dots; with it the light parts do (light on dark).
  return { svg: ditherSvg(grid, { cell, fill, background: bg, lit: invert ? 1 : 0 }), cols: grid.width, rows: grid.height };
}

if (isMain(import.meta.url)) {
  const { positional, flags } = parseArgs(process.argv.slice(2), { booleans: ['invert', 'no-trim'] });
  if (!positional[0]) {
    console.error("Usage: node scripts/dotify.mjs <input> [--mode fs|ordered|stipple|halftone|hex|ascii] [--dots 140] [--cell 6] [--fill '#e8e6e1'] [--bg '#0f0f10'] [--invert] [--contrast 1.2] [--gamma 1] [--out file]");
    process.exit(2);
  }
  const result = await dotify(positional[0], {
    mode: flags.mode,
    dots: flags.dots ? Number(flags.dots) : undefined,
    cell: flags.cell ? Number(flags.cell) : undefined,
    fill: typeof flags.fill === 'string' ? flags.fill : undefined,
    bg: typeof flags.bg === 'string' ? flags.bg : undefined,
    invert: Boolean(flags.invert),
    trim: !flags['no-trim'],
    contrast: flags.contrast ? Number(flags.contrast) : undefined,
    gamma: flags.gamma ? Number(flags.gamma) : undefined,
    threshold: flags.threshold ? Number(flags.threshold) : undefined,
  });
  const out = flags.out ?? `${basename(positional[0], extname(positional[0]))}.dots.${result.text ? 'txt' : 'svg'}`;
  writeFileSync(out, result.text ?? result.svg);
  console.log(`${out}  ${result.text ? `${result.text.split('\n').length} lines` : `${Math.round(result.svg.length / 1024)} KB`}`);
}
