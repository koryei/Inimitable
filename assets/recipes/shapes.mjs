// Organic shapes from a seed: smooth closed blobs and stacks of stones, for objects and illustration.
// Good for: a product's world drawn as an object (a cairn, pebbles, leaves, clouds, a hill), not decoration.
//
//   import { blobPath, stoneStack } from './shapes.mjs';
//
// Colour the result from the project's ramp in tonal layers (a base tone, a lighter top face, a darker
// underside), never with hue-to-hue gradients or glows.

import { rng } from './noise.mjs';

// A closed, smooth path through `points` random-radius points around an ellipse (Catmull-Rom to Bezier).
export function blobPath({ cx = 0, cy = 0, rx = 50, ry = 30, points = 9, wobble = 0.12, seed = 1, flatBase = 1 } = {}) {
  const rand = rng(seed);
  const pts = Array.from({ length: points }, (_, i) => {
    const a = (i / points) * Math.PI * 2;
    const k = 1 + (rand() - 0.5) * 2 * wobble;
    const sin = Math.sin(a);
    // flatBase below 1 squashes the lower half, so a stone sits on a flatter underside
    return [cx + Math.cos(a) * rx * k, cy + sin * ry * k * (sin > 0 ? flatBase : 1)];
  });
  const n = pts.length;
  const p = (i) => pts[(i + n) % n];
  let d = `M${p(0)[0].toFixed(1)} ${p(0)[1].toFixed(1)}`;
  for (let i = 0; i < n; i++) {
    const p0 = p(i - 1);
    const p1 = p(i);
    const p2 = p(i + 1);
    const p3 = p(i + 2);
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return `${d}Z`;
}

// A stack of stones, largest at the bottom, each slightly offset. Returns [{ d, top, shade, w, h }] bottom to top.
// Draw each stone with `d` in a base tone, then a lighter highlight clipped to the top, then a soft shade underneath.
export function stoneStack({ count = 5, width = 260, seed = 3, centerX = 0, baseY = 0 } = {}) {
  const rand = rng(seed);
  const stones = [];
  let y = baseY;
  for (let i = 0; i < count; i++) {
    const t = i / Math.max(1, count - 1);
    const w = width * (1 - t * 0.68) * (0.92 + rand() * 0.14);
    const h = w * (0.26 + rand() * 0.06);
    const x = centerX + (rand() - 0.5) * width * 0.06;
    y -= h * 0.82;
    stones.push({ d: blobPath({ cx: x, cy: y, rx: w / 2, ry: h / 2, points: 10, wobble: 0.07, seed: seed * 31 + i, flatBase: 0.62 }), cx: x, cy: y, w, h });
  }
  return stones;
}

// Small speckles (lichen, grit, flecks) scattered inside a stone's ellipse. Returns [{ x, y, r }].
// Draw them as tiny circles in a slightly darker or lighter tone of the stone, at 20 to 45% opacity.
export function speckles({ cx, cy, rx, ry, count = 12, seed = 1, maxR = 2.2 }) {
  const rand = rng(seed);
  return Array.from({ length: count }, () => {
    const a = rand() * Math.PI * 2;
    const d = Math.sqrt(rand()) * 0.78;
    return { x: cx + Math.cos(a) * rx * d, y: cy + Math.sin(a) * ry * d, r: 0.5 + rand() * maxR };
  });
}
