// Topographic contour lines as an SVG, by marching squares over seeded noise.
// Good for: field science, maps, geology, terrain, anything about place and elevation.
//
//   import { contourSvg } from './contours.mjs';
//   const svg = contourSvg({ width: 1440, height: 900, seed: 7, levels: 14 });
//
// Returns a string. Inline it as the background of one region, behind content, at low contrast
// (stroke at 8 to 18% of the text colour), masked at the edges. aria-hidden, no animation.

import { valueNoise } from './noise.mjs';

// Segment table for marching squares: for each of 16 cases, which edges join (0 top, 1 right, 2 bottom, 3 left).
const SEGMENTS = [[], [[3, 2]], [[2, 1]], [[3, 1]], [[0, 1]], [[3, 0], [2, 1]], [[0, 2]], [[3, 0]], [[3, 0]], [[0, 2]], [[0, 1], [3, 2]], [[0, 1]], [[3, 1]], [[2, 1]], [[3, 2]], []];

export function contourPaths({ width = 1440, height = 900, seed = 1, levels = 12, scale = 0.0035, cell = 10, octaves = 3 } = {}) {
  const noise = valueNoise(seed, octaves);
  const cols = Math.ceil(width / cell) + 1;
  const rows = Math.ceil(height / cell) + 1;
  const field = Array.from({ length: rows }, (_, j) => Array.from({ length: cols }, (_, i) => noise(i * cell * scale, j * cell * scale)));
  const paths = [];
  for (let l = 1; l <= levels; l++) {
    const level = l / (levels + 1);
    const d = [];
    for (let j = 0; j < rows - 1; j++) {
      for (let i = 0; i < cols - 1; i++) {
        const tl = field[j][i];
        const tr = field[j][i + 1];
        const br = field[j + 1][i + 1];
        const bl = field[j + 1][i];
        const code = (tl > level ? 8 : 0) | (tr > level ? 4 : 0) | (br > level ? 2 : 0) | (bl > level ? 1 : 0);
        const x = i * cell;
        const y = j * cell;
        const lerp = (a, b) => (level - a) / (b - a);
        const edge = (e) => {
          if (e === 0) return [x + lerp(tl, tr) * cell, y];
          if (e === 1) return [x + cell, y + lerp(tr, br) * cell];
          if (e === 2) return [x + lerp(bl, br) * cell, y + cell];
          return [x, y + lerp(tl, bl) * cell];
        };
        for (const [a, b] of SEGMENTS[code]) {
          const [x1, y1] = edge(a);
          const [x2, y2] = edge(b);
          d.push(`M${x1.toFixed(1)} ${y1.toFixed(1)}L${x2.toFixed(1)} ${y2.toFixed(1)}`);
        }
      }
    }
    if (d.length) paths.push({ level, d: d.join('') });
  }
  return paths;
}

export function contourSvg({ width = 1440, height = 900, stroke = 'currentColor', strokeWidth = 1, opacity = 0.18, emphasiseEvery = 4, ...options } = {}) {
  const paths = contourPaths({ width, height, ...options });
  const body = paths
    .map((p, i) => `<path d="${p.d}" stroke-width="${i % emphasiseEvery === 0 ? strokeWidth * 1.6 : strokeWidth}" opacity="${i % emphasiseEvery === 0 ? 1 : 0.6}"/>`)
    .join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false" fill="none" stroke="${stroke}" stroke-linecap="round" style="opacity:${opacity}">${body}</svg>`;
}
