#!/usr/bin/env node
// The frame check: is this page's skeleton its own, and does its material run through it?
// (references/direction.md, references/gate.md)
//
//   node scripts/frame.mjs <page> [<other page> ...] [--no-starter] [--no-device] [--threshold 0.75] [--json]
//
//   --no-starter  do not compare with the landing starter (when the brief asked for the standard page)
//   --no-device   do not require a material (Operate, Read and Terminal screens)
//   --threshold   how alike two skeletons may be before they count as one frame (0 to 1)
//
// It reads each page at 1440 px and records its skeleton: the nav's shape, how the headline sits against the artwork,
// what holds the first screen, the order of the section kinds, the button shape, the headline family and the ground.
// It fails when two of the given pages share a frame, when a page is the landing starter's frame, or when no element
// marked data-device is on the first screen and in two more sections.
//
// What it cannot do: see whether a page is good, memorable or ownable. Two pages can differ in every trait it reads
// and still feel alike, and the section kinds are guessed from structure. A pass means "not the same skeleton".

import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, join } from 'node:path';
import { isMain, parseArgs } from './lib/args.mjs';
import { launch, openPage, toUrl } from './lib/chrome.mjs';
import { SAME_FRAME, judgeDevice, judgeFrames } from './lib/frame.mjs';
import { scaffold } from './scaffold.mjs';

const COLLECT = `(() => {
  const W = innerWidth, H = innerHeight;
  const style = (el) => getComputedStyle(el);
  const rect = (el) => { const r = el.getBoundingClientRect(); return { x: r.left, y: r.top + scrollY, w: r.width, h: r.height }; };
  const shown = (el) => { const r = el.getBoundingClientRect(); const s = style(el); return r.width > 2 && r.height > 2 && s.display !== 'none' && s.visibility !== 'hidden'; };
  const alpha = (v) => { const m = v.match(/[\\d.]+/g) || []; return v === 'transparent' ? 0 : m.length > 3 ? Number(m[3]) : 1; };
  const painted = (el) => { const s = style(el); return alpha(s.backgroundColor) > 0.04 || s.backgroundImage !== 'none' || (parseFloat(s.borderTopWidth) > 0 && alpha(s.borderTopColor) > 0.04) || s.boxShadow !== 'none'; };

  const h1 = document.querySelector('h1');
  const hr = h1 ? rect(h1) : { x: 0, y: 0, w: W, h: 100 };

  // Nav: the first header or nav near the top.
  const navEl = [...document.querySelectorAll('header, nav, [data-nav]')].find((el) => shown(el) && rect(el).y < 200 && !el.closest('footer'));
  let nav = 'none';
  if (navEl) {
    const boxes = [navEl, ...navEl.querySelectorAll('*')].filter((el) => shown(el) && rect(el).w > 280 && painted(el));
    const box = boxes[0];
    const outer = rect(navEl);
    if (outer.h > H * 0.6 && outer.w < W * 0.35) nav = 'side';
    else if (box && rect(box).w < W * 0.92 && parseFloat(style(box).borderTopLeftRadius) >= 8) nav = parseFloat(style(box).borderTopLeftRadius) >= rect(box).h / 2 - 1 ? 'floating-pill' : 'floating-box';
    else if (box) nav = 'bar';
    else nav = 'plain';
  }

  // Artwork: the largest drawing, picture or framed block on the first screen that is not the headline's wrapper.
  const arts = [...document.querySelectorAll('figure, svg, canvas, img, picture, video, [role="img"], [data-artwork], body *')].filter((el) => {
    if (!shown(el) || el.contains(h1) || (h1 && h1.contains(el)) || el.closest('nav, footer, [data-nav]')) return false;
    const r = rect(el);
    if (r.y > H - 60 || r.w < 240 || r.h < 160) return false;
    if (/^(FIGURE|SVG|CANVAS|IMG|PICTURE|VIDEO)$/i.test(el.tagName) || el.matches('[role="img"], [data-artwork]')) return !(el.getAttribute('aria-hidden') === 'true' && r.w > W * 0.9);
    return painted(el) && r.w < W * 0.9;
  });
  const art = arts.sort((a, b) => rect(b).w * rect(b).h - rect(a).w * rect(a).h)[0];
  let composition = 'type only';
  if (art) {
    const r = rect(art);
    const sideBySide = (r.x >= hr.x + hr.w * 0.6 || r.x + r.w <= hr.x + hr.w * 0.4) && r.y < hr.y + hr.h + 200;
    composition = sideBySide ? 'art beside' : r.y >= hr.y + hr.h - 8 ? 'art below' : r.y + r.h <= hr.y + 8 ? 'art above' : 'art behind';
  }

  // Alignment of the headline text.
  const centred = h1 && (style(h1).textAlign === 'center' || (Math.abs(hr.x + hr.w / 2 - W / 2) < 24 && hr.w < W * 0.8));
  const align = centred ? 'centred' : hr.x + hr.w / 2 > W * 0.6 ? 'right' : 'left';

  // What holds the first screen: a painted panel set in from the edges, a full-bleed field, or nothing.
  let container = 'open';
  for (let el = h1?.parentElement; el && el !== document.body; el = el.parentElement) {
    const r = rect(el);
    const layers = [el, ...el.children];
    const field = layers.find((n) => painted(n) && rect(n).w >= W * 0.9 && rect(n).h >= H * 0.5);
    if (!field) continue;
    const radius = Math.max(parseFloat(style(el).borderTopLeftRadius), parseFloat(style(field).borderTopLeftRadius));
    container = r.x >= 4 && radius >= 12 ? 'inset panel' : 'full bleed';
    break;
  }

  const button = [...document.querySelectorAll('a, button')].find((el) => shown(el) && !el.closest('nav, header, footer') && painted(el) && rect(el).h >= 32 && rect(el).h < 90 && rect(el).w >= 80);
  const radius = button ? parseFloat(style(button).borderTopLeftRadius) : 0;
  const buttonShape = !button ? 'none' : radius >= rect(button).h / 2 - 1 ? 'pill' : radius >= 4 ? 'rounded' : 'square';

  const family = h1 ? style(h1.querySelector('span') || h1).fontFamily.toLowerCase() : '';
  const headlineFont = /mono|courier|menlo|consol/.test(family) ? 'mono' : /sans|grotesk|inter|geist|helvetica|arial|system-ui/.test(family) ? 'sans' : /serif|georgia|times|garamond/.test(family) ? 'serif' : 'sans';

  const bg = (style(document.body).backgroundColor.match(/[\\d.]+/g) || [255, 255, 255]).map(Number);
  const clear = alpha(style(document.body).backgroundColor) === 0;
  const [r0, g0, b0] = clear ? [255, 255, 255] : bg;
  const light = (0.2126 * r0 + 0.7152 * g0 + 0.0722 * b0) / 255;
  const chroma = Math.max(r0, g0, b0) - Math.min(r0, g0, b0);
  const ground = chroma > 60 ? 'colour' : light < 0.35 ? 'dark' : chroma > 12 ? 'tinted' : 'light';

  // Sections: walk down from main until a level has several tall blocks.
  const tall = (el) => shown(el) && rect(el).h >= 80 && rect(el).w >= W * 0.4 && !['fixed', 'absolute'].includes(style(el).position) && !/^(SCRIPT|STYLE|HEADER|NAV|FOOTER)$/.test(el.tagName);
  let level = document.querySelector('main') || document.body;
  let blocks = [...level.children].filter(tall);
  while (blocks.length === 1 && blocks[0].children.length) { level = blocks[0]; blocks = [...level.children].filter(tall); }
  if (level !== document.body && document.querySelector('main')) {
    const outside = [...document.body.children].filter((el) => tall(el) && el.tagName !== 'MAIN' && !el.contains(level));
    blocks = [...blocks, ...outside].sort((a, b) => rect(a).y - rect(b).y);
  }

  const kind = (block) => {
    const all = [...block.querySelectorAll('*')].filter(shown);
    if (block.querySelector('table')) return 'table';
    const groups = [block, ...all].map((p) => [...p.children].filter((c) => shown(c) && c.querySelector('h3, h4, strong, b') && rect(c).w >= 140)).filter((g) => g.length >= 3);
    const group = groups.sort((a, b) => b.length - a.length)[0];
    if (group) {
      const numbered = group.filter((c) => c.closest('ol') || /^\\s*0?[1-9]\\b/.test(c.textContent)).length >= 3;
      if (numbered) return 'steps';
      return group.filter(painted).length >= 3 ? 'cards' : 'columns';
    }
    const text = (block.innerText || '').trim();
    if (all.some((el) => parseFloat(style(el).fontSize) >= 72 && /^[£$€]?[\\d.,]+[%KkMm+]?$/.test((el.textContent || '').trim()))) return 'big number';
    const action = block.querySelector('h2') && block.querySelector('a, button') && text.length < 320;
    if (action) return [block, ...all].some((el) => painted(el) && rect(el).w >= W * 0.6 && rect(el).w < W - 4 && parseFloat(style(el).borderTopLeftRadius) >= 12) ? 'closing panel' : 'closing line';
    if (rect(block).h < 200) return 'band';
    if (all.some((el) => rect(el).w >= 240 && rect(el).h >= 160 && (/^(svg|canvas|img|figure)$/i.test(el.tagName) || el.matches('[role="img"]')))) return 'picture';
    return /[£$€]\\s?\\d/.test(text) ? 'price' : 'text';
  };
  const rest = blocks.filter((b) => !(h1 && b.contains(h1)));
  const sequence = rest.map(kind);

  // The material: where each data-device name is visible.
  const devices = {};
  const pageH = document.documentElement.scrollHeight;
  for (const el of document.querySelectorAll('[data-device]')) {
    if (!shown(el)) continue;
    const name = el.getAttribute('data-device') || 'device';
    const r = rect(el);
    const fixed = style(el).position === 'fixed' && r.h >= H * 0.6;
    const entry = (devices[name] ||= { sections: new Set(), coverage: 0 });
    entry.coverage = Math.max(entry.coverage, fixed ? 1 : Math.min(1, r.h / pageH));
    if (r.y < H) entry.sections.add(0);
    blocks.forEach((b, i) => { const br = rect(b); if (!(h1 && b.contains(h1)) && r.y < br.y + br.h - 8 && r.y + r.h > br.y + 8) entry.sections.add(i + 1); });
    const foot = document.querySelector('footer');
    if (foot && r.y + r.h > rect(foot).y + 8) entry.sections.add(blocks.length + 1);
  }

  return {
    traits: { nav, composition, align, container, sequence, button: buttonShape, headlineFont, ground },
    devices: Object.fromEntries(Object.entries(devices).map(([k, v]) => [k, { sections: [...v.sections], coverage: Math.round(v.coverage * 100) / 100 }])),
  };
})()`;

async function read(browser, target) {
  const page = await openPage(browser, { width: 1440, height: 900, reducedMotion: true });
  try {
    await page.goto(toUrl(target), 900);
    return await page.evaluate(COLLECT);
  } finally {
    await page.close();
  }
}

const STARTERS = [['stack', {}], ['split', { hero: 'split' }], ['card', { ground: 'flat', palette: 'cobalt', hero: 'card' }], ['minimal split', { ground: 'flat', palette: 'sand', hero: 'split', minimal: true }]];

export async function frame(targets, { starter = true, device = true, threshold = SAME_FRAME } = {}) {
  const chrome = await launch();
  const temp = mkdtempSync(join(tmpdir(), 'frame-'));
  try {
    const pages = [];
    for (const target of targets) {
      const found = await read(chrome.browser, target);
      pages.push({ label: target, traits: found.traits, device: judgeDevice(found.devices) });
    }
    const starters = [];
    if (starter) for (const [label, options] of STARTERS) {
      const dir = join(temp, label.replace(' ', '-'));
      scaffold(dir, options);
      starters.push({ label, traits: (await read(chrome.browser, join(dir, 'index.html'))).traits });
    }
    const frames = judgeFrames(pages, starters, threshold);
    const pass = !frames.same.length && !frames.unchanged.length && (!device || pages.every((p) => p.device.pass));
    return { pass, pages, device, ...frames };
  } finally {
    await chrome.close();
    rmSync(temp, { recursive: true, force: true });
  }
}

export function format(r) {
  const short = (label) => basename(label);
  const lines = [`frame ${r.pass ? 'pass' : 'FAIL'}  (same frame at ${r.threshold} or more)`];
  for (const page of r.pages) {
    const t = page.traits;
    lines.push(`\n${short(page.label)}`);
    lines.push(`  nav ${t.nav} | ${t.align} headline, ${t.composition} | ${t.container} | ${t.button} buttons | ${t.headlineFont} | ${t.ground} ground`);
    lines.push(`  sections: ${t.sequence.join(' > ') || 'none after the first screen'}`);
    const s = r.starter.find((x) => x.page === page.label);
    if (s) lines.push(`  closest starter frame: ${s.starter} ${s.score}${s.score >= r.threshold ? `  SHARED FRAME (${s.shared.join('; ')})` : ''}`);
    if (r.device) lines.push(page.device.pass ? `  material: ${page.device.found.filter((d) => d.pass).map((d) => `${d.name} (${d.runsThrough ? 'runs down the page' : `${d.sections} sections`})`).join(', ')}` : `  material FAIL: ${page.device.reason}`);
  }
  for (const p of r.pairs) lines.push(`\n${short(p.a)} and ${short(p.b)}: ${p.score}${p.score >= r.threshold ? `  SAME FRAME (${p.shared.join('; ')})` : ''}`);
  if (!r.pass) lines.push('\nChange the skeleton, not only the artwork: take the layout from the shape of the artifact (references/direction.md).');
  return lines.join('\n');
}

if (isMain(import.meta.url)) {
  const { positional, flags } = parseArgs(process.argv.slice(2), { booleans: ['no-starter', 'no-device', 'json'] });
  if (!positional.length) {
    console.error('Usage: node scripts/frame.mjs <page> [<other page> ...] [--no-starter] [--no-device] [--threshold 0.75] [--json]');
    process.exit(2);
  }
  try {
    const result = await frame(positional, { starter: !flags['no-starter'], device: !flags['no-device'], threshold: flags.threshold ? Number(flags.threshold) : SAME_FRAME });
    console.log(flags.json ? JSON.stringify(result, null, 2) : format(result));
    process.exit(result.pass ? 0 : 1);
  } catch (error) {
    console.error(error.message);
    process.exit(2);
  }
}
