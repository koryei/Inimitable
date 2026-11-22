// Find what is really behind each piece of text by looking at the rendered pixels.
//
// The page is scrolled screenful by screenful; in each, all text is made transparent, the viewport is
// photographed, and pixels are read from inside every text element's box. Whatever drew the background
// (an ancestor, a sibling, a pseudo-element, a gradient, an image) is in the picture, so nothing can hide.

import { decodePng, pixelAt } from './png.mjs';

const HIDE = `(() => {
  const style = document.createElement('style');
  style.id = '__inim_hide';
  style.textContent = '*, *::before, *::after { color: transparent !important; -webkit-text-fill-color: transparent !important; text-shadow: none !important; caret-color: transparent !important; transition: none !important; } svg text, svg tspan { fill: transparent !important; } ::placeholder { color: transparent !important; } html { scroll-behavior: auto !important; }';
  document.head.appendChild(style);
})()`;

const UNHIDE = "(() => { document.getElementById('__inim_hide')?.remove(); })()";

// For every text element in view: grid points inside its box that are not covered by something else
// (a sticky header, a fixed bar, a modal). Covered points would sample the cover, not the backdrop.
const POINTS = `(() => [...document.querySelectorAll('[data-inim-i]')].map((el) => {
  const r = el.getBoundingClientRect();
  if (r.width <= 1 || r.height <= 1 || r.bottom <= 0 || r.top >= innerHeight || r.right <= 0 || r.left >= innerWidth) return null;
  const cols = Math.max(1, Math.min(4, Math.floor(r.width / 24)));
  const rows = Math.max(1, Math.min(2, Math.floor(r.height / 12)));
  const points = [];
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      const x = r.left + (r.width * (i + 0.5)) / cols;
      const y = r.top + (r.height * (j + 0.5)) / rows;
      if (x < 0 || y < 0 || x >= innerWidth || y >= innerHeight) continue;
      const top = document.elementFromPoint(x, y);
      if (top && (el.contains(top) || top.contains(el))) points.push([x, y]);
    }
  }
  return points.length ? { idx: Number(el.getAttribute('data-inim-i')), points } : null;
}).filter(Boolean))()`;

// Returns Map(idx -> array of [r, g, b] backdrop samples). The page must render at device scale factor 1.
export async function sampleBackdrops(page, { maxSlices = 14 } = {}) {
  const height = await page.evaluate('innerHeight');
  const total = await page.evaluate('document.documentElement.scrollHeight');
  const samples = new Map();
  await page.evaluate(HIDE);
  try {
    for (let y = 0, n = 0; y < total && n < maxSlices; y += height, n++) {
      await page.evaluate(`window.scrollTo({ top: ${y}, behavior: 'instant' })`);
      await new Promise((r) => setTimeout(r, 160));
      await page.evaluate('new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))');
      const found = await page.evaluate(POINTS);
      if (!found.length) continue;
      const image = decodePng(await page.screenshot());
      for (const item of found) {
        if (samples.has(item.idx) && samples.get(item.idx).length >= 9) continue;
        samples.set(item.idx, [...(samples.get(item.idx) || []), ...item.points.map(([x, y]) => pixelAt(image, x, y))]);
      }
    }
  } finally {
    await page.evaluate(UNHIDE);
    await page.evaluate('window.scrollTo({ top: 0, behavior: "instant" })');
  }
  return samples;
}
