// Find what is really behind each piece of text by looking at the rendered pixels.
//
// The page is scrolled screenful by screenful; in each, all text is made transparent, the viewport is
// photographed, and pixels are read from inside every text element's box. Whatever drew the background
// (an ancestor, a sibling, a pseudo-element, a gradient, an image) is in the picture, so nothing can hide.

import { decodePng, pixelAt } from './png.mjs';

const HIDE = `(() => {
  const style = document.createElement('style');
  style.id = '__inim_hide';
  style.textContent = '*, *::before, *::after { color: transparent !important; -webkit-text-fill-color: transparent !important; text-shadow: none !important; caret-color: transparent !important; } svg text, svg tspan { fill: transparent !important; } ::placeholder { color: transparent !important; } html { scroll-behavior: auto !important; }';
  document.head.appendChild(style);
})()`;

const UNHIDE = "(() => { document.getElementById('__inim_hide')?.remove(); })()";

const RECTS = `(() => [...document.querySelectorAll('[data-inim-i]')].map((el) => {
  const r = el.getBoundingClientRect();
  return { idx: Number(el.getAttribute('data-inim-i')), x: r.left, y: r.top, w: r.width, h: r.height };
}).filter((r) => r.w > 1 && r.h > 1 && r.y + r.h > 0 && r.y < innerHeight && r.x + r.w > 0 && r.x < innerWidth))()`;

// Returns Map(idx -> array of [r, g, b] backdrop samples). The page must render at device scale factor 1.
export async function sampleBackdrops(page, { maxSlices = 14 } = {}) {
  const height = await page.evaluate('innerHeight');
  const total = await page.evaluate('document.documentElement.scrollHeight');
  const samples = new Map();
  await page.evaluate(HIDE);
  try {
    for (let y = 0, n = 0; y < total && n < maxSlices; y += height, n++) {
      await page.evaluate(`window.scrollTo({ top: ${y}, behavior: 'instant' })`);
      await new Promise((r) => setTimeout(r, 120));
      const rects = await page.evaluate(RECTS);
      if (!rects.length) continue;
      const image = decodePng(await page.screenshot());
      for (const r of rects) {
        if (samples.has(r.idx) && samples.get(r.idx).length >= 9) continue;
        const points = [];
        const cols = Math.max(1, Math.min(4, Math.floor(r.w / 24)));
        const rows = Math.max(1, Math.min(2, Math.floor(r.h / 12)));
        for (let i = 0; i < cols; i++) {
          for (let j = 0; j < rows; j++) {
            const px = r.x + (r.w * (i + 0.5)) / cols;
            const py = r.y + (r.h * (j + 0.5)) / rows;
            if (px >= 0 && py >= 0 && px < image.width && py < image.height) points.push(pixelAt(image, px, py));
          }
        }
        if (points.length) samples.set(r.idx, [...(samples.get(r.idx) || []), ...points]);
      }
    }
  } finally {
    await page.evaluate(UNHIDE);
    await page.evaluate('window.scrollTo({ top: 0, behavior: "instant" })');
  }
  return samples;
}
