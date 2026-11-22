// HUD furniture as SVG strings: callouts with leader lines, corner brackets, crosshairs, registration
// marks, edge rulers, numbered tags and readout panels. These are what make a hero object feel measured
// and instrumented. Every function returns an SVG fragment (or a full <svg> where noted).
//
// Honesty rule: a callout points at something real and says something true. Never invent a spec,
// a number or a certification. If a figure is illustrative, say so on the page ("Example reading").
//
//   import { callout, cornerBrackets, crosshair, ruler } from './hud.mjs';

const f = (n) => Number(n.toFixed(1));
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

// Four corner ticks around a box: the registration look used on buttons, frames and photographs.
export function cornerBrackets({ x = 0, y = 0, w, h, size = 8, stroke = 'currentColor', width = 1 }) {
  const c = (px, py, dx, dy) => `M${f(px + dx * size)} ${f(py)}H${f(px)}V${f(py + dy * size)}`;
  return `<path d="${c(x, y, 1, 1)}${c(x + w, y, -1, 1)}${c(x + w, y + h, -1, -1)}${c(x, y + h, 1, -1)}" fill="none" stroke="${stroke}" stroke-width="${width}" stroke-linecap="square"/>`;
}

export function crosshair({ x, y, size = 10, stroke = 'currentColor', width = 1, gap = 3 }) {
  return `<path d="M${f(x - size)} ${f(y)}H${f(x - gap)}M${f(x + gap)} ${f(y)}H${f(x + size)}M${f(x)} ${f(y - size)}V${f(y - gap)}M${f(x)} ${f(y + gap)}V${f(y + size)}" stroke="${stroke}" stroke-width="${width}" fill="none"/>`;
}

// A registration mark: a circle with a cross through it, as on a print proof.
export function registration({ x, y, r = 7, stroke = 'currentColor', width = 1 }) {
  return `<g fill="none" stroke="${stroke}" stroke-width="${width}"><circle cx="${f(x)}" cy="${f(y)}" r="${r}"/>${crosshair({ x, y, size: r + 4, stroke, width, gap: 0 })}</g>`;
}

// A callout: a dot on the thing, an elbow leader line, and a small label box with corner ticks.
// side 'right' or 'left' says where the label sits; dy lifts the label above or below the dot.
export function callout({ x, y, label, sub, side = 'right', dx = 70, dy = -40, width, stroke = 'currentColor', fill = 'none', text = 'currentColor', font = 'ui-monospace, "SF Mono", Menlo, monospace', size = 10 }) {
  const dir = side === 'right' ? 1 : -1;
  const lw = width ?? Math.max(label.length, (sub || '').length) * size * 0.62 + 16;
  const lh = sub ? size * 2.9 : size * 2;
  const ex = x + dx * dir;
  const ey = y + dy;
  const bx = side === 'right' ? ex : ex - lw;
  const by = ey - lh / 2;
  const elbow = `M${f(x)} ${f(y)}L${f(x + (dx * dir) / 2)} ${f(ey)}H${f(ex)}`;
  return `<g><path d="${elbow}" fill="none" stroke="${stroke}" stroke-width="1"/><circle cx="${f(x)}" cy="${f(y)}" r="2.5" fill="${stroke}"/><rect x="${f(bx)}" y="${f(by)}" width="${f(lw)}" height="${f(lh)}" fill="${fill}" stroke="${stroke}" stroke-opacity=".35"/>${cornerBrackets({ x: bx, y: by, w: lw, h: lh, size: 4, stroke })}<text x="${f(bx + 8)}" y="${f(by + size * 1.35)}" font-family='${font}' font-size="${size}" fill="${text}">${esc(label)}</text>${sub ? `<text x="${f(bx + 8)}" y="${f(by + size * 2.45)}" font-family='${font}' font-size="${size - 1.5}" fill="${text}" opacity=".6">${esc(sub)}</text>` : ''}</g>`;
}

// A ruler along an edge: ticks every `step`, a longer tick every `major`, with numbers at the majors.
export function ruler({ x, y, length, orientation = 'v', step = 10, major = 50, from = 0, stroke = 'currentColor', text = 'currentColor', size = 8, font = 'ui-monospace, "SF Mono", Menlo, monospace', side = 1 }) {
  const parts = [];
  for (let i = 0; i <= length; i += step) {
    const isMajor = i % major === 0;
    const len = isMajor ? 8 : 4;
    if (orientation === 'v') {
      parts.push(`<path d="M${f(x)} ${f(y + i)}h${f(len * side)}" stroke="${stroke}" stroke-width="1"/>`);
      if (isMajor) parts.push(`<text x="${f(x + (len + 3) * side)}" y="${f(y + i + 3)}" font-family='${font}' font-size="${size}" fill="${text}" text-anchor="${side > 0 ? 'start' : 'end'}">${from + i}</text>`);
    } else {
      parts.push(`<path d="M${f(x + i)} ${f(y)}v${f(len * side)}" stroke="${stroke}" stroke-width="1"/>`);
      if (isMajor) parts.push(`<text x="${f(x + i)}" y="${f(y + (len + 10) * side)}" font-family='${font}' font-size="${size}" fill="${text}" text-anchor="middle">${from + i}</text>`);
    }
  }
  return `<g>${parts.join('')}</g>`;
}

// A numbered tag, like [03], for pinning a note to a place on a drawing.
export function tag({ x, y, n, stroke = 'currentColor', text = 'currentColor', font = 'ui-monospace, "SF Mono", Menlo, monospace', size = 9 }) {
  const label = `[${String(n).padStart(2, '0')}]`;
  const w = label.length * size * 0.62 + 6;
  return `<g><rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(size + 6)}" fill="none" stroke="${stroke}" stroke-opacity=".5"/><text x="${f(x + 3)}" y="${f(y + size + 1)}" font-family='${font}' font-size="${size}" fill="${text}">${label}</text></g>`;
}

// A readout panel: rows of "key ..... value", like a terminal status block. Rows are [key, value].
export function readout({ x, y, rows, width = 220, size = 10, line = 15, stroke = 'currentColor', text = 'currentColor', font = 'ui-monospace, "SF Mono", Menlo, monospace', title }) {
  const h = rows.length * line + 16 + (title ? line : 0);
  const out = [`<rect x="${f(x)}" y="${f(y)}" width="${width}" height="${f(h)}" fill="none" stroke="${stroke}" stroke-opacity=".35"/>`, cornerBrackets({ x, y, w: width, h, size: 5, stroke })];
  let cy = y + 8 + size;
  if (title) {
    out.push(`<text x="${f(x + 8)}" y="${f(cy)}" font-family='${font}' font-size="${size}" fill="${text}" opacity=".6">${esc(title)}</text>`);
    cy += line;
  }
  for (const [k, v] of rows) {
    const dots = '.'.repeat(Math.max(2, Math.floor((width - 16) / (size * 0.6)) - (`${k}${v}`.length + 2)));
    out.push(`<text x="${f(x + 8)}" y="${f(cy)}" font-family='${font}' font-size="${size}" fill="${text}" xml:space="preserve">${esc(k)} ${dots} ${esc(v)}</text>`);
    cy += line;
  }
  return `<g>${out.join('')}</g>`;
}

// A dashed frame with cut corners, used for a "module" box.
export function frame({ x, y, w, h, dash = '4 4', stroke = 'currentColor', cut = 0 }) {
  const d = cut ? `M${x + cut} ${y}H${x + w - cut}L${x + w} ${y + cut}V${y + h - cut}L${x + w - cut} ${y + h}H${x + cut}L${x} ${y + h - cut}V${y + cut}Z` : `M${x} ${y}H${x + w}V${y + h}H${x}Z`;
  return `<path d="${d}" fill="none" stroke="${stroke}" stroke-width="1" stroke-dasharray="${dash}" stroke-opacity=".6"/>`;
}

// A whole overlay as one SVG sized to its container, to lay over a hero object.
export function overlaySvg({ width, height, children, label }) {
  const a11y = label ? `role="img" aria-label="${esc(label)}"` : 'aria-hidden="true" focusable="false"';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" ${a11y}>${children.join('')}</svg>`;
}
