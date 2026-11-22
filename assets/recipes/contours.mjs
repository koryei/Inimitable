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

// Join the loose segments of one level into continuous polylines, matching endpoints.
export function stitch(segments, tolerance = 0.05) {
  const key = (p) => `${Math.round(p[0] / tolerance)},${Math.round(p[1] / tolerance)}`;
  const ends = new Map();
  segments.forEach((seg, i) => {
    for (const p of seg) {
      const k = key(p);
      if (!ends.has(k)) ends.set(k, []);
      ends.get(k).push(i);
    }
  });
  const used = new Array(segments.length).fill(false);
  const lines = [];
  const next = (point, from) => (ends.get(key(point)) || []).find((i) => i !== from && !used[i]);
  segments.forEach((seg, start) => {
    if (used[start]) return;
    used[start] = true;
    const line = [seg[0], seg[1]];
    // extend forward, then backward
    for (const direction of [1, 0]) {
      for (;;) {
        const tip = direction ? line[line.length - 1] : line[0];
        const i = next(tip, -1);
        if (i === undefined) break;
        used[i] = true;
        const [a, b] = segments[i];
        const other = key(a) === key(tip) ? b : a;
        if (direction) line.push(other);
        else line.unshift(other);
      }
    }
    lines.push(line);
  });
  return lines;
}

// A polyline as a smooth SVG path: quadratic curves through the segment midpoints.
export function smoothPath(line, decimals = 0) {
  const f = (n) => n.toFixed(decimals);
  if (line.length < 3) return `M${f(line[0][0])} ${f(line[0][1])}L${f(line[line.length - 1][0])} ${f(line[line.length - 1][1])}`;
  const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  let d = `M${f(line[0][0])} ${f(line[0][1])}`;
  for (let i = 1; i < line.length - 1; i++) {
    const m = mid(line[i], line[i + 1]);
    d += `Q${f(line[i][0])} ${f(line[i][1])} ${f(m[0])} ${f(m[1])}`;
  }
  const last = line[line.length - 1];
  return `${d}L${f(last[0])} ${f(last[1])}`;
}

export function contourPaths({ width = 1440, height = 900, seed = 1, levels = 12, scale = 0.0035, cell = 16, octaves = 3, decimals = 0 } = {}) {
  const noise = valueNoise(seed, octaves);
  const cols = Math.ceil(width / cell) + 1;
  const rows = Math.ceil(height / cell) + 1;
  const field = Array.from({ length: rows }, (_, j) => Array.from({ length: cols }, (_, i) => noise(i * cell * scale, j * cell * scale)));
  const paths = [];
  for (let l = 1; l <= levels; l++) {
    const level = l / (levels + 1);
    const segs = [];
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
          segs.push([edge(a), edge(b)]);
        }
      }
    }
    if (segs.length) {
      const lines = stitch(segs);
      paths.push({ level, lines: lines.length, d: lines.map((l) => smoothPath(l, decimals)).join('') });
    }
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
