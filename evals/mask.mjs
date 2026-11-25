#!/usr/bin/env node
// Screenshots of a page with the product name masked, for a judge who must not know which product it is.
//
//   node evals/mask.mjs <file or url> --name Marrow --out dir --label P1 [--blur-text] [--scroll 900]
//
// Writes <label>-1440-s1.png (the first screen), -s2.png and -s3.png (the next two screens down) and <label>-390-s1.png
// (the first screen on a phone). Every occurrence of the name in the page's text, labels, alt text and title is replaced
// with a block of the same width in characters (whole words only, so "Tern" does not eat "pattern"). With --blur-text, all text is blurred as well, so the judge sees
// only composition, ground, colour and artwork: what a page looks like when its words are taken away.

import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { isMain, parseArgs } from '../scripts/lib/args.mjs';
import { launch, openPage, toUrl } from '../scripts/lib/chrome.mjs';

export const MASK = (name, blur) => `(() => {
  const re = new RegExp('\\\\b' + ${JSON.stringify(name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))} + '\\\\b', 'gi');
  const block = (m) => '\\u2592'.repeat(m.length);
  let masked = 0;
  const walker = document.createTreeWalker(document.documentElement, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  for (const n of nodes) {
    if (n.parentElement && /^(SCRIPT|STYLE)$/.test(n.parentElement.tagName)) continue;
    if (re.test(n.nodeValue)) { re.lastIndex = 0; n.nodeValue = n.nodeValue.replace(re, (m) => { masked++; return block(m); }); }
    re.lastIndex = 0;
  }
  for (const el of document.querySelectorAll('[aria-label], [alt], [title], [placeholder]')) for (const a of ['aria-label', 'alt', 'title', 'placeholder']) { const v = el.getAttribute(a); if (v && re.test(v)) { el.setAttribute(a, v.replace(re, block)); masked++; } re.lastIndex = 0; }
  document.title = document.title.replace(re, block);
  if (${blur ? 'true' : 'false'}) {
    const style = document.createElement('style');
    style.textContent = '[data-blur] { filter: blur(0.32em); } svg text, svg tspan { filter: blur(3px); }';
    document.head.appendChild(style);
    const again = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const list = [];
    while (again.nextNode()) list.push(again.currentNode);
    for (const n of list) {
      const p = n.parentElement;
      if (!n.nodeValue.trim() || !p || /^(SCRIPT|STYLE|TEXT|TSPAN|TITLE)$/i.test(p.tagName) || p.closest('svg')) continue;
      const s = document.createElement('span');
      s.setAttribute('data-blur', '');
      n.replaceWith(s);
      s.appendChild(n);
    }
  }
  return masked;
})()`;

export async function maskedShots(target, { name, out, label, blur = false } = {}) {
  mkdirSync(out, { recursive: true });
  const chrome = await launch();
  const files = [];
  try {
    for (const [width, height, mobile] of [[1440, 900, false], [390, 844, true]]) {
      const page = await openPage(chrome.browser, { width, height, mobile, deviceScaleFactor: mobile ? 2 : 1 });
      await page.goto(toUrl(target), 2600);
      const masked = await page.evaluate(MASK(name, blur));
      // Let every reveal fire the way it would for a person scrolling, then come back to the top.
      const total = await page.evaluate('document.documentElement.scrollHeight');
      for (let y = 0; y <= total; y += 500) { await page.evaluate(`window.scrollTo(0, ${y})`); await new Promise((r) => setTimeout(r, 110)); }
      await new Promise((r) => setTimeout(r, 1200));
      const screens = mobile ? 1 : 3;
      for (let i = 0; i < screens; i++) {
        await page.evaluate(`window.scrollTo(0, ${i * height})`);
        await new Promise((r) => setTimeout(r, 700));
        const file = join(out, `${label}-${width}-s${i + 1}.png`);
        writeFileSync(file, await page.screenshot());
        files.push(file);
      }
      files.masked = (files.masked || 0) + masked;
      await page.close();
    }
  } finally {
    await chrome.close();
  }
  return files;
}

if (isMain(import.meta.url)) {
  const { positional, flags } = parseArgs(process.argv.slice(2), { booleans: ['blur-text'] });
  if (!positional[0] || typeof flags.name !== 'string' || typeof flags.out !== 'string' || typeof flags.label !== 'string') {
    console.error('Usage: node evals/mask.mjs <file or url> --name Marrow --out dir --label P1 [--blur-text]');
    process.exit(2);
  }
  const files = await maskedShots(positional[0], { name: flags.name, out: flags.out, label: flags.label, blur: Boolean(flags['blur-text']) });
  console.log(`${files.length} images, ${files.masked} mentions of "${flags.name}" masked`);
  for (const f of files) console.log(f);
}
