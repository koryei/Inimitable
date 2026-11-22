// Isometric drawing helpers: a flat plane, boxes and stacked plates drawn as clean line art with optional
// tonal fills. This is the calm "blueprint" illustration style: thin outlines, one accent colour on the part
// that matters, a faint isometric grid floor.
//
//   import { isoBox, isoGrid, isoPoint } from './iso.mjs';
//
// Coordinates: x runs right-down, y runs left-down, z runs up, all in drawing units. The origin (ox, oy) is
// where the (0, 0, 0) corner lands on the page.

const COS = Math.cos(Math.PI / 6);
const SIN = 0.5;
const f = (n) => Number(n.toFixed(1));

export function isoPoint(x, y, z = 0, ox = 0, oy = 0) {
  return [ox + (x - y) * COS, oy + (x + y) * SIN - z];
}

const poly = (pts, attrs) => `<polygon points="${pts.map((p) => `${f(p[0])},${f(p[1])}`).join(' ')}" ${attrs}/>`;

// A box with three visible faces. `tones` are the top, left and right fills (or 'none' for pure line art).
export function isoBox({ x = 0, y = 0, z = 0, w, d, h, ox = 0, oy = 0, stroke = 'currentColor', width = 1, tones = ['none', 'none', 'none'], opacity = 1, dash }) {
  const p = (px, py, pz) => isoPoint(px, py, pz, ox, oy);
  const a = p(x, y, z + h);
  const b = p(x + w, y, z + h);
  const c = p(x + w, y + d, z + h);
  const e = p(x, y + d, z + h);
  const g = p(x, y + d, z);
  const hh = p(x + w, y + d, z);
  const i = p(x + w, y, z);
  const attrs = (fill) => `fill="${fill}" stroke="${stroke}" stroke-width="${width}" stroke-linejoin="round"${dash ? ` stroke-dasharray="${dash}"` : ''} opacity="${opacity}"`;
  return `<g>${poly([e, c, hh, g], attrs(tones[1]))}${poly([b, c, hh, i], attrs(tones[2]))}${poly([a, b, c, e], attrs(tones[0]))}</g>`;
}

// A flat rectangle on the ground plane (or at height z), as a plate or pad.
export function isoPlate({ x = 0, y = 0, z = 0, w, d, ox = 0, oy = 0, stroke = 'currentColor', width = 1, fill = 'none', dash, radius = 0 }) {
  const p = (px, py) => isoPoint(px, py, z, ox, oy);
  const pts = [p(x, y), p(x + w, y), p(x + w, y + d), p(x, y + d)];
  return poly(pts, `fill="${fill}" stroke="${stroke}" stroke-width="${width}" stroke-linejoin="${radius ? 'round' : 'miter'}"${dash ? ` stroke-dasharray="${dash}"` : ''}`);
}

// A faint isometric grid floor: two families of lines.
export function isoGrid({ cols = 12, rows = 12, size = 40, ox = 0, oy = 0, stroke = 'currentColor', opacity = 0.14 }) {
  const lines = [];
  for (let i = 0; i <= cols; i++) {
    const [x1, y1] = isoPoint(i * size, 0, 0, ox, oy);
    const [x2, y2] = isoPoint(i * size, rows * size, 0, ox, oy);
    lines.push(`M${f(x1)} ${f(y1)}L${f(x2)} ${f(y2)}`);
  }
  for (let j = 0; j <= rows; j++) {
    const [x1, y1] = isoPoint(0, j * size, 0, ox, oy);
    const [x2, y2] = isoPoint(cols * size, j * size, 0, ox, oy);
    lines.push(`M${f(x1)} ${f(y1)}L${f(x2)} ${f(y2)}`);
  }
  return `<path d="${lines.join('')}" fill="none" stroke="${stroke}" stroke-width="1" opacity="${opacity}"/>`;
}

// A circle on the ground plane (an ellipse in isometric view), for holes and wheels.
export function isoCircle({ x, y, z = 0, r, ox = 0, oy = 0, stroke = 'currentColor', width = 1, fill = 'none' }) {
  const [cx, cy] = isoPoint(x, y, z, ox, oy);
  return `<ellipse cx="${f(cx)}" cy="${f(cy)}" rx="${f(r * COS * 1.15)}" ry="${f(r * SIN * 1.15)}" fill="${fill}" stroke="${stroke}" stroke-width="${width}"/>`;
}

// A leader with a small dot, for pointing at a part of the drawing.
export function isoPin({ x, y, z = 0, ox = 0, oy = 0, dx = 40, dy = -40, stroke = 'currentColor', accent = stroke }) {
  const [px, py] = isoPoint(x, y, z, ox, oy);
  return `<g><path d="M${f(px)} ${f(py)}l${dx} ${dy}" stroke="${stroke}" stroke-width="1" fill="none"/><circle cx="${f(px)}" cy="${f(py)}" r="3" fill="${accent}"/></g>`;
}

// A neat exploded stack of plates: each layer lifted by `gap`, outlined, with the chosen layer in the accent.
export function explodedStack({ layers = 4, w = 160, d = 160, thickness = 10, gap = 34, ox = 0, oy = 0, stroke = 'currentColor', tones = ['#ffffff', '#ececea', '#dcdcd8'], accent, accentLayer = -1 }) {
  const parts = [];
  for (let i = 0; i < layers; i++) {
    const z = i * (thickness + gap);
    const isAccent = i === (accentLayer < 0 ? layers + accentLayer : accentLayer);
    parts.push(isoBox({ x: 0, y: 0, z, w, d, h: thickness, ox, oy, stroke, tones: isAccent && accent ? [accent, accent, accent] : tones }));
    if (i < layers - 1) {
      const a = isoPoint(w / 2, d / 2, z + thickness, ox, oy);
      const b = isoPoint(w / 2, d / 2, z + thickness + gap, ox, oy);
      parts.push(`<path d="M${f(a[0])} ${f(a[1])}L${f(b[0])} ${f(b[1])}" stroke="${stroke}" stroke-width="1" stroke-dasharray="3 3" opacity=".5"/>`);
    }
  }
  return `<g>${parts.reverse().join('')}</g>`;
}
