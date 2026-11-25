#!/usr/bin/env node
// How tight can display type be set before letters touch? Measured in a real browser, from the ink of each glyph.
//
//   node evals/tracking.mjs [--font Geist|"Instrument Serif"] [--weight 400] [--set headlines|numerals] [--css fonts.css] [--json]
//
// For every neighbouring pair of letters in a set of real headlines, this draws the two glyphs at the pair's
// true position (kerning and letter-spacing included) and measures the gap between their ink, in em. A gap at or
// below zero means the letters touch or overlap. It does not say what looks good: it says where the type stops
// being a row of separate letters, so a tracking value can be set from evidence instead of taste.

import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { isMain, parseArgs } from '../scripts/lib/args.mjs';
import { launch, openPage } from '../scripts/lib/chrome.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

export const HEADLINES = [
  'Manage money with confidence everyday',
  'All-in-One CRM for Sales Teams',
  'Turn complex processes into reliable automations',
  'Every clause checked against your own position',
  'Record talks. Stay on track.',
  'Immense millennium minimum Brilliant willow',
];

export const NUMERALS = ['1,284 98% 24h 120K+ 3.2d', '0123456789', '92% 11 100 66 77 88 99', '$56,498.50 4.6% 2026'];

export const TRACKINGS = [0, -0.01, -0.02, -0.03, -0.04, -0.05, -0.055, -0.06, -0.07];

// For each pair: draw the first letter alone and the second alone at their true positions (kerning and tracking
// included), then grow the first letter's ink outward until it meets the second. The growth needed is the clearance.
// Zero means the letters touch. This reads ink, not bounding boxes, so a T overhanging an e is not counted as a collision.
const PROBE = (font, weight, size, headlines, trackings) => `(async () => {
  await document.fonts.load('${weight} ${size}px "${font}"');
  const W = ${size} * 2, H = ${size} * 2;
  const mk = () => { const c = document.createElement('canvas'); c.width = W; c.height = H; return c; };
  const ca = mk(), cb = mk();
  const A = ca.getContext('2d', { willReadFrequently: true }), B = cb.getContext('2d', { willReadFrequently: true });
  const m = document.createElement('canvas').getContext('2d');
  const grow = [0, 1, 2, 3, 4, 6, 8, 11, 15, 20];
  const out = [];
  for (const t of ${JSON.stringify(trackings)}) {
    for (const g of [m, A, B]) { g.font = '${weight} ${size}px "${font}"'; g.letterSpacing = (t * ${size}) + 'px'; g.fontKerning = 'normal'; }
    const gaps = [];
    for (const text of ${JSON.stringify(headlines)}) {
      for (let i = 0; i < text.length - 1; i++) {
        const a = text[i], b = text[i + 1];
        if (!/[\\p{L}\\p{N}]/u.test(a) || !/[\\p{L}\\p{N}]/u.test(b)) continue;
        const xa = m.measureText(text.slice(0, i + 1)).width - m.measureText(a).width;
        const xb = m.measureText(text.slice(0, i + 2)).width - m.measureText(b).width;
        const x0 = ${size} * 0.3;
        B.clearRect(0, 0, W, H); B.fillStyle = '#000'; B.textBaseline = 'alphabetic'; B.fillText(b, x0 + (xb - xa), ${size} * 1.4);
        const bd = B.getImageData(0, 0, W, H).data;
        let found = grow.length;
        for (let gi = 0; gi < grow.length && found === grow.length; gi++) {
          A.clearRect(0, 0, W, H); A.fillStyle = '#000'; A.strokeStyle = '#000'; A.lineJoin = 'round'; A.lineWidth = grow[gi] * 2;
          A.fillText(a, x0, ${size} * 1.4); if (grow[gi]) A.strokeText(a, x0, ${size} * 1.4);
          const ad = A.getImageData(0, 0, W, H).data;
          for (let k = 3; k < ad.length; k += 4) if (ad[k] > 40 && bd[k] > 40) { found = gi; break; }
        }
        gaps.push({ pair: a + b, gap: (found === grow.length ? 22 : grow[found] === 0 ? 0 : grow[found] - 0.5) / ${size} });
      }
    }
    const sorted = gaps.map((g) => g.gap).sort((p, q) => p - q);
    out.push({
      tracking: t,
      pairs: gaps.length,
      touching: gaps.filter((g) => g.gap === 0).length,
      minGap: Number(sorted[0].toFixed(3)),
      p10: Number(sorted[Math.floor(sorted.length * 0.1)].toFixed(3)),
      median: Number(sorted[Math.floor(sorted.length / 2)].toFixed(3)),
      worst: gaps.sort((p, q) => p.gap - q.gap).slice(0, 6).map((g) => g.pair),
    });
  }
  return out;
})()`;

export async function measureTracking({ font = 'Geist', weight = 400, size = 200, headlines = HEADLINES, trackings = TRACKINGS, fontsCss = join(root, 'assets', 'fonts', 'fonts.css') } = {}) {
  const dir = mkdtempSync(join(tmpdir(), 'inimitable-tracking-'));
  const fonts = pathToFileURL(fontsCss).href;
  writeFileSync(join(dir, 'p.html'), `<!doctype html><link rel="stylesheet" href="${fonts}"><body style="font-family:'${font}'">x</body>`);
  const chrome = await launch();
  try {
    const page = await openPage(chrome.browser, { width: 1200, height: 600 });
    await page.goto(pathToFileURL(join(dir, 'p.html')).href, 500);
    return await page.evaluate(PROBE(font, weight, size, headlines, trackings));
  } finally {
    await chrome.close();
  }
}

// The tightest tracking (in em) at which the 10th-percentile gap between neighbouring letters is still at least
// minPx wide when the text is set at this size. Tracking is a property of size: the same -0.055em leaves a 3.7 px
// gap at 132 px and a 1.1 px gap at 40 px, and 1 px gaps blur together on a normal screen.
export function tightestAt(rows, size, minPx = 2) {
  const ok = rows.filter((r) => r.p10 * size >= minPx && r.touching / r.pairs <= 0.02);
  return ok.length ? Math.min(...ok.map((r) => r.tracking)) : 0;
}

if (isMain(import.meta.url)) {
  const { flags } = parseArgs(process.argv.slice(2), { booleans: ['json'] });
  const font = typeof flags.font === 'string' ? flags.font : 'Geist';
  const rows = await measureTracking({ font, weight: flags.weight ? Number(flags.weight) : 400, headlines: flags.set === 'numerals' ? NUMERALS : HEADLINES, ...(typeof flags.css === 'string' ? { fontsCss: flags.css } : {}) });
  if (flags.json) console.log(JSON.stringify(rows, null, 2));
  else {
    console.log(`${font}: gap between neighbouring letters' ink, in em (${rows[0].pairs} pairs)`);
    console.log('tracking   touching   min gap   10th pct   median   closest pairs');
    console.log(`tightest tracking with a 2 px gap at the 10th percentile: ${[24, 32, 40, 48, 64, 80, 96, 128].map((px) => `${px}px ${tightestAt(rows, px)}em`).join(', ')}`);
    for (const r of rows) console.log(`${String(r.tracking).padEnd(10)} ${String(r.touching).padEnd(10)} ${String(r.minGap).padEnd(9)} ${String(r.p10).padEnd(10)} ${String(r.median).padEnd(8)} ${r.worst.join(' ')}`);
  }
}
