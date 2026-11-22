// Turned objects as SVG: pottery, glass, lathe work, bottles, lamps, columns. A profile curve is
// revolved into a silhouette, lit from one side with one hue shifting light to dark, and cut with
// fine rings like a thrown pot. Drawn, not rendered: a few paths and two gradients.
//
//   import { vesselSvg, PROFILES } from './revolve.mjs';
//   vesselSvg({ profile: PROFILES.amphora, height: 360, base: '#7a5a4a', rings: 38, seed: 2 });
//
// The profile is [[t, r]...]: t runs 0 (foot) to 1 (lip), r is the radius as a fraction of the widest point.
// Several vessels drawn to one scale side by side, with a ruler, make an honest portfolio picture.

import { rng } from './noise.mjs';

export const PROFILES = {
  amphora: [[0, 0.34], [0.06, 0.5], [0.3, 0.9], [0.5, 1], [0.7, 0.72], [0.86, 0.34], [0.95, 0.4], [1, 0.46]],
  bowl: [[0, 0.5], [0.08, 0.62], [0.4, 0.92], [0.8, 1], [1, 0.98]],
  cup: [[0, 0.62], [0.1, 0.74], [0.6, 0.94], [1, 1]],
  jar: [[0, 0.7], [0.1, 0.85], [0.45, 1], [0.8, 0.86], [0.9, 0.6], [1, 0.62]],
  bottle: [[0, 0.8], [0.04, 0.9], [0.5, 1], [0.7, 0.8], [0.86, 0.24], [0.96, 0.22], [1, 0.3]],
};

export function shade(hex, amount) {
  const n = parseInt(hex.slice(1), 16);
  const f = (v) => Math.max(0, Math.min(255, Math.round(amount >= 0 ? v + (255 - v) * amount : v * (1 + amount))));
  return `#${[(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => f(v).toString(16).padStart(2, '0')).join('')}`;
}

// Smooth radius at height t, by Catmull-Rom through the profile points.
export function radiusAt(profile, t) {
  const pts = profile;
  let i = 0;
  while (i < pts.length - 2 && t > pts[i + 1][0]) i++;
  const p0 = pts[Math.max(0, i - 1)];
  const p1 = pts[i];
  const p2 = pts[i + 1];
  const p3 = pts[Math.min(pts.length - 1, i + 2)];
  const u = Math.max(0, Math.min(1, (t - p1[0]) / (p2[0] - p1[0] || 1)));
  const u2 = u * u;
  const u3 = u2 * u;
  return 0.5 * (2 * p1[1] + (-p0[1] + p2[1]) * u + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * u2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * u3);
}

export function vesselSvg({ profile = PROFILES.amphora, height = 360, maxRadius = 110, base = '#7a5a4a', rings = 34, lightFrom = 'left', seed = 1, id = 'v', openness = 0.13 } = {}) {
  const rand = rng(seed);
  const pad = 14;
  const cx = maxRadius + pad;
  const footY = height + pad;
  const topY = pad;
  const yOf = (t) => footY - t * height;
  const steps = 48;
  const left = [];
  const right = [];
  for (let k = 0; k <= steps; k++) {
    const t = k / steps;
    const r = Math.max(0.02, radiusAt(profile, t)) * maxRadius;
    left.push([cx - r, yOf(t)]);
    right.push([cx + r, yOf(t)]);
  }
  const rBottom = radiusAt(profile, 0) * maxRadius;
  const rTop = radiusAt(profile, 1) * maxRadius;
  const eTop = rTop * openness;
  const eBottom = rBottom * openness;
  const f = (n) => n.toFixed(1);
  const line = (pts) => pts.map((p) => `L${f(p[0])} ${f(p[1])}`).join('');
  const silhouette = `M${f(left[0][0])} ${f(left[0][1])}${line(left.slice(1))}A${f(rTop)} ${f(eTop)} 0 0 1 ${f(right[steps][0])} ${f(right[steps][1])}${line(right.slice(0, steps).reverse())}A${f(rBottom)} ${f(eBottom)} 0 0 1 ${f(left[0][0])} ${f(left[0][1])}Z`;
  const flip = lightFrom === 'left';
  const stops = flip
    ? [[0, shade(base, 0.16)], [0.3, base], [0.72, shade(base, -0.16)], [1, shade(base, -0.34)]]
    : [[0, shade(base, -0.34)], [0.28, shade(base, -0.16)], [0.7, base], [1, shade(base, 0.16)]];
  const ringLines = [];
  for (let k = 1; k <= rings; k++) {
    const t = (k + (rand() - 0.5) * 0.4) / (rings + 1);
    const r = radiusAt(profile, t) * maxRadius;
    const y = yOf(t);
    const e = r * openness;
    const op = (0.07 + rand() * 0.07).toFixed(3);
    ringLines.push(`<path d="M${f(cx - r)} ${f(y)}A${f(r)} ${f(e)} 0 0 0 ${f(cx + r)} ${f(y)}" stroke="${shade(base, -0.55)}" stroke-opacity="${op}"/>`);
    ringLines.push(`<path d="M${f(cx - r)} ${f(y + 1.1)}A${f(r)} ${f(e)} 0 0 0 ${f(cx + r)} ${f(y + 1.1)}" stroke="${shade(base, 0.5)}" stroke-opacity="${(op * 0.7).toFixed(3)}"/>`);
  }
  const w = (maxRadius + pad) * 2;
  const h = height + pad * 2 + 6;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" aria-hidden="true" focusable="false">
<defs><linearGradient id="${id}-g" x1="0" y1="0" x2="1" y2="0">${stops.map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`).join('')}</linearGradient></defs>
<ellipse cx="${f(cx)}" cy="${f(footY + 2)}" rx="${f(rBottom * 1.25)}" ry="${f(eBottom * 0.9)}" fill="#000" opacity=".16"/>
<path d="${silhouette}" fill="url(#${id}-g)"/>
<g fill="none" stroke-width="1">${ringLines.join('')}</g>
<ellipse cx="${f(cx)}" cy="${f(topY)}" rx="${f(rTop)}" ry="${f(eTop)}" fill="${shade(base, -0.55)}"/>
<ellipse cx="${f(cx)}" cy="${f(topY + 0.8)}" rx="${f(rTop * 0.86)}" ry="${f(eTop * 0.7)}" fill="${shade(base, -0.72)}"/>
</svg>`;
}
