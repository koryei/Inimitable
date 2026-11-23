#!/usr/bin/env node
// How a page FEELS, measured: the things the mechanical score cannot see.
//
//   node evals/feel.mjs <url or file> [--json]
//
// Reports, in a real browser:
//   entrance   how many elements are mid-animation shortly after load and have settled a second later
//   scroll     how many elements change (opacity or position) as the page is scrolled through
//   hover      how many controls there are, and how many visibly answer a real pointer (pixel diff, via craft.mjs)
//   loops      continuous animations running, and whether they stop under reduced motion
//   ground     how much the first screen varies in colour (a lit ground, not a flat fill), and whether it has grain
//   type       distinct display sizes and the ratio between the largest and the body size
//   fonts      families actually in use
//
// A page can pass every other check and still score 0 here: that is a page that is correct and dead.

import { isMain, parseArgs } from '../scripts/lib/args.mjs';
import { launch, openPage, toUrl } from '../scripts/lib/chrome.mjs';
import { decodePng, pixelAt } from '../scripts/lib/png.mjs';
import { craft } from '../scripts/craft.mjs';

const SNAP = `(() => [...document.querySelectorAll('body *')].map((el) => { const s = getComputedStyle(el); const r = el.getBoundingClientRect(); return [s.opacity, s.transform, Math.round(r.top + scrollY), Math.round(r.height)].join('|'); }))()`;

export async function feel(target) {
  const chrome = await launch();
  const out = {};
  try {
    const page = await openPage(chrome.browser, { width: 1440, height: 900 });
    await page.goto(toUrl(target), 0);
    await new Promise((r) => setTimeout(r, 90));
    const early = await page.evaluate(SNAP);
    await new Promise((r) => setTimeout(r, 1700));
    const settled = await page.evaluate(SNAP);
    out.entrance = early.reduce((n, v, i) => n + (v.split('|').slice(0, 2).join() !== (settled[i] || '').split('|').slice(0, 2).join() ? 1 : 0), 0);

    // Scroll through like a person, then see what moved.
    const before = await page.evaluate(SNAP);
    const total = await page.evaluate('document.documentElement.scrollHeight');
    for (let y = 0; y <= total; y += 400) { await page.evaluate(`window.scrollTo(0, ${y})`); await new Promise((r) => setTimeout(r, 130)); }
    await page.evaluate('window.scrollTo(0, document.documentElement.scrollHeight)');
    await new Promise((r) => setTimeout(r, 1500));
    await page.evaluate('window.scrollTo(0, 0)');
    await new Promise((r) => setTimeout(r, 400));
    const after = await page.evaluate(SNAP);
    out.scroll = before.reduce((n, v, i) => { const [o1, t1] = v.split('|'); const [o2, t2] = (after[i] || '').split('|'); return n + (o1 !== o2 || t1 !== t2 ? 1 : 0); }, 0);

    out.loops = await page.evaluate("document.getAnimations().filter((a) => a.playState === 'running' && a.effect && a.effect.getTiming().iterations === Infinity).length");

    // Ground: variation of colour in the first screen, and fine-grained noise.
    await page.goto(toUrl(target), 2200);
    const shot = decodePng(await page.screenshot());
    const px = [];
    for (let y = 20; y < shot.height; y += 36) for (let x = 20; x < shot.width; x += 48) px.push(pixelAt(shot, x, y));
    // Trimmed: drop the brightest and darkest tenth, so text and borders do not pass for a lit ground.
    const sd = (all) => { const vals = [...all].sort((a, b) => a - b); const cut = Math.floor(vals.length * 0.1); const v = vals.slice(cut, vals.length - cut); const m = v.reduce((a, b) => a + b, 0) / v.length; return Math.sqrt(v.reduce((a, b) => a + (b - m) ** 2, 0) / v.length); };
    out.groundVariation = Math.round(Math.max(sd(px.map((p) => p[0])), sd(px.map((p) => p[1])), sd(px.map((p) => p[2]))));
    let diff = 0, n = 0;
    for (let y = 400; y < 420; y++) for (let x = 600; x < 700; x++) { const a = pixelAt(shot, x, y); const b = pixelAt(shot, x + 1, y); diff += Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]); n++; }
    out.grain = Number((diff / n / 3).toFixed(2));

    const type = await page.evaluate(`(() => { const sizes = new Map(); const fams = new Set(); for (const el of document.querySelectorAll('body *')) { if (![...el.childNodes].some((c) => c.nodeType === 3 && c.nodeValue.trim())) continue; const s = getComputedStyle(el); const r = el.getBoundingClientRect(); if (!r.width) continue; sizes.set(Math.round(parseFloat(s.fontSize)), 1); fams.add(s.fontFamily.split(',')[0].replace(/["']/g, '').trim()); } const list = [...sizes.keys()].sort((a, b) => a - b); const body = parseFloat(getComputedStyle(document.body).fontSize); return { largest: list[list.length - 1], body, steps: list.length, fams: [...fams] }; })()`);
    out.type = { largest: type.largest, ratio: Number((type.largest / type.body).toFixed(1)), distinctSizes: type.steps };
    out.fonts = type.fams;
    await page.close();

    const reduced = await openPage(chrome.browser, { width: 1440, height: 900, reducedMotion: true });
    await reduced.goto(toUrl(target), 600);
    out.loopsReduced = await reduced.evaluate("document.getAnimations().filter((a) => a.playState === 'running' && a.effect && a.effect.getTiming().iterations === Infinity).length");
    await reduced.close();
  } finally {
    await chrome.close();
  }
  const [desktop] = await craft(target, { widths: [1440] });
  out.controls = desktop.controls;
  out.silent = desktop.problems.filter((p) => p.kind === 'silent hover' || p.kind === 'invisible hover').length;
  out.answering = out.controls - out.silent;
  out.answerShare = out.controls ? Number((out.answering / out.controls).toFixed(2)) : 0;
  // One number, deliberately blunt: does it move in, move on scroll, answer the pointer, and sit on a lit ground?
  const points = [
    Math.min(25, out.entrance * 2.5),
    Math.min(25, out.scroll * 1.2),
    Math.round(20 * out.answerShare),
    Math.min(15, out.groundVariation * 1.5),
    out.type.ratio >= 5 ? 5 : Math.round(out.type.ratio),
    out.grain >= 1 ? 10 : 0,
  ];
  out.score = Math.round(points.reduce((a, b) => a + b, 0));
  out.points = { entrance: points[0], scroll: points[1], hover: points[2], ground: points[3], type: points[4], grain: points[5] };
  return out;
}

if (isMain(import.meta.url)) {
  const { positional, flags } = parseArgs(process.argv.slice(2), { booleans: ['json'] });
  if (!positional[0]) { console.error('Usage: node evals/feel.mjs <url or file> [--json]'); process.exit(2); }
  const r = await feel(positional[0]);
  if (flags.json) console.log(JSON.stringify(r, null, 2));
  else {
    console.log(`feel ${r.score}/100   entrance ${r.entrance} elements   scroll ${r.scroll} elements   hover ${r.answering}/${r.controls} controls   ground variation ${r.groundVariation}   grain ${r.grain}   type ratio ${r.type.ratio}x (${r.type.largest}px)   loops ${r.loops} (${r.loopsReduced} under reduced motion)`);
    console.log(`fonts: ${r.fonts.join(', ')}`);
  }
}
