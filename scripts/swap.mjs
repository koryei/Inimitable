#!/usr/bin/env node
// The swap-the-name test: take the product name off the first screen. Does it still say something only this
// product could say? (references/gate.md, references/direction.md)
//
//   node scripts/swap.mjs <url or file> --nouns "clause,redline,contract" [--name Marrow] [--typographic] [--json]
//
//   --nouns        the nouns of the product's own subject, from the concept's native artifact. Two or more. Words that
//                  fit any product ("platform", "team", "data", "AI") are refused.
//   --name         the product name; it is stripped from the first screen before anything is counted
//   --typographic  the headline is the signature (no artwork on the first screen is needed, but the words must be owned)
//
// What it checks: with the name removed, the first screen (what shows at 1440 x 900) uses at least two of the
// declared nouns, and the artwork (text inside a figure, drawing or product frame, or its aria-label, alt,
// caption) uses at least one. What it cannot check: whether the picture is any good, or whether the nouns are
// the right ones. A pass means the first screen names the product's own things, never "it is distinctive":
// still answer the question yourself in the report. Exit code 1 when it fails.

import { isMain, parseArgs } from './lib/args.mjs';
import { launch, openPage, toUrl } from './lib/chrome.mjs';
import { judge, parseNouns } from './lib/swap.mjs';

// Runs in the page. Collects the first screen's words in three groups: the headline, the artwork, everything else.
// Artwork is a figure, drawing, picture or product frame at least 120 x 80 px that is on the first screen.
const COLLECT = `(() => {
  const H = innerHeight;
  const on = (el) => { const r = el.getBoundingClientRect(); const s = getComputedStyle(el); return r.width > 4 && r.height > 4 && r.top < H - 8 && r.bottom > 0 && s.display !== 'none' && s.visibility !== 'hidden' && parseFloat(s.opacity) > 0; };
  const chrome = 'nav, header.nav, [data-nav], footer, script, style, .ground, [data-ground], .ticker, a.m-btn, button, [role="navigation"]';
  const art = 'figure, svg, canvas, picture, img, video, [role="img"], [data-artwork], .hero-object, .window';
  const words = (el) => {
    const parts = [el.textContent || ''];
    for (const n of [el, ...el.querySelectorAll('*')]) for (const a of ['aria-label', 'alt', 'title']) if (n.getAttribute(a)) parts.push(n.getAttribute(a));
    return parts.join(' ');
  };
  const h1 = document.querySelector('h1');
  const headline = h1 ? h1.textContent : '';
  const big = (el) => { const r = el.getBoundingClientRect(); return r.width >= 120 && r.height >= 80; };
  const found = [...document.querySelectorAll(art)].filter((el) => on(el) && big(el) && !el.closest(chrome));
  const top = found.filter((el) => !found.some((o) => o !== el && o.contains(el)));
  const artwork = top.map(words).join(' ');
  const copyEls = [...document.querySelectorAll('p, h2, h3, li, dd, dt, small, figcaption')].filter((el) => on(el) && !el.closest(chrome) && !el.closest('h1') && !top.some((a) => a.contains(el)));
  const copy = copyEls.map((el) => el.textContent).join(' ');
  return { headline, artwork, copy, hasArtwork: top.length > 0 };
})()`;

export async function swap(target, { nouns, name, typographic = false, width = 1440 } = {}) {
  const chrome = await launch();
  try {
    const page = await openPage(chrome.browser, { width, height: width < 700 ? 844 : 900, mobile: width < 700 });
    await page.goto(toUrl(target), 900);
    const first = await page.evaluate(COLLECT);
    return { width, first, ...judge({ name, nouns, first, typographic }) };
  } finally {
    await chrome.close();
  }
}

export function format(r, name) {
  const lines = [`swap ${r.pass ? 'pass' : 'FAIL'}${name ? `  (${name} removed)` : ''}  ${r.width}px first screen`];
  if (r.usable?.length) lines.push(`  declared: ${r.usable.join(', ')}`);
  if (r.found) lines.push(`  in the headline: ${r.found.headline.join(', ') || 'none'}   in the artwork: ${r.found.artwork.join(', ') || 'none'}   elsewhere: ${r.found.copy.join(', ') || 'none'}`);
  if (r.category?.length) lines.push(`  note: the headline leans on category words (${r.category.join(', ')}); fine if the artwork is owned, weak if it is the only thing`);
  for (const reason of r.reasons) lines.push(`  ${reason}`);
  if (r.pass) lines.push('  Still answer in the report, in one line: what does the first screen say that only this product could say?');
  return lines.join('\n');
}

if (isMain(import.meta.url)) {
  const { positional, flags } = parseArgs(process.argv.slice(2), { booleans: ['json', 'typographic'] });
  if (!positional[0] || typeof flags.nouns !== 'string') {
    console.error('Usage: node scripts/swap.mjs <url or file> --nouns "clause,redline,contract" [--name Marrow] [--typographic] [--json]');
    process.exit(2);
  }
  const name = typeof flags.name === 'string' ? flags.name : undefined;
  const r = await swap(positional[0], { nouns: parseNouns(flags.nouns), name, typographic: Boolean(flags.typographic), width: flags.width ? Number(flags.width) : 1440 });
  console.log(flags.json ? JSON.stringify(r, null, 2) : format(r, name));
  process.exit(r.pass ? 0 : 1);
}
