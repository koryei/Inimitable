// Annotations for a product picture: small label chips with a pointer arrow, and a thin connecting-line diagram
// that sits behind a UI card. Together they turn a screenshot-in-a-box into a picture that explains itself:
// the chip says what to look at, the arrow says where, the lines say how the card connects to the rest.
//
//   import { chip, heroDiagram, annotationCss } from './annotate.mjs';
//   chip({ label: 'Clause 4.2 deviates', x: 8, y: 30, pointer: 'br' })   // HTML, positioned in % of its parent
//   heroDiagram({ width: 1200, height: 520, card: { x: 230, y: 250, w: 740 }, seed: 2 })   // an SVG string
//
// Rules that keep it honest (references/directions.md, "Annotations"): a chip points at something real in the
// picture, says one thing in plain words, and never claims a number the product cannot back. Three chips at most.
// The diagram's nodes name the product's own parts; the placeholder labels here are marked data-todo.

import { rng } from './noise.mjs';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const r1 = (n) => Math.round(n * 10) / 10;

// The arrow cursor, tip at the top left of its box.
export const CURSOR_PATH = 'M0.6 0.6L0.6 14.2L4 11.2L6.4 16.4L9 15.2L6.7 10.1L11.4 10.1Z';

export function cursorSvg() {
  return `<svg class="chip-cursor" viewBox="0 0 12 17" aria-hidden="true" focusable="false"><path d="${CURSOR_PATH}"/></svg>`;
}

// pointer: which corner of the chip the arrow sits on, and so which way it points (tl points up and left).
export function chip({ label, x, y, pointer = 'tl', tone = 'accent', todo = false } = {}) {
  if (!label) throw new Error('A chip needs a label.');
  if (!['tl', 'tr', 'bl', 'br'].includes(pointer)) throw new Error(`pointer is tl, tr, bl or br (got ${pointer}).`);
  if (!['accent', 'ink', 'surface'].includes(tone)) throw new Error(`tone is accent, ink or surface (got ${tone}).`);
  return `<span class="chip" data-tone="${tone}" data-pointer="${pointer}" style="left:${r1(x)}%;top:${r1(y)}%"${todo ? ' data-todo' : ''} aria-hidden="true">${cursorSvg()}<span>${esc(label)}</span></span>`;
}

// The styles for chip(). Written to the page's ground.css by scaffold; copy them into any page that uses chips.
export function annotationCss() {
  return `/* Annotation chips: a label with a pointer arrow, set on a product picture. Decorative; the picture carries the real description. */
.chip { position: absolute; z-index: 3; display: inline-flex; align-items: center; padding: 0.4375rem 0.75rem; border-radius: 0.375rem; font: 500 0.8125rem/1 var(--sans); white-space: nowrap; pointer-events: none; background: var(--accent); color: var(--on-accent); box-shadow: 0 0.625rem 1.5rem -0.75rem rgba(0, 0, 0, 0.4); }
.chip[data-tone="ink"] { background: var(--ink); color: var(--bg); }
.chip[data-tone="surface"] { background: var(--surface); color: var(--ink); box-shadow: inset 0 0 0 1px var(--line-strong), 0 0.625rem 1.5rem -0.75rem rgba(0, 0, 0, 0.4); }
.chip-cursor { position: absolute; width: 0.75rem; height: 1.0625rem; fill: var(--ink); stroke: var(--bg); stroke-width: 1.2; stroke-linejoin: round; overflow: visible; }
.chip[data-pointer="tl"] .chip-cursor { left: -0.9375rem; top: -0.9375rem; }
.chip[data-pointer="tr"] .chip-cursor { right: -0.9375rem; top: -0.9375rem; transform: scaleX(-1); }
.chip[data-pointer="bl"] .chip-cursor { left: -0.9375rem; bottom: -0.9375rem; transform: scaleY(-1); }
.chip[data-pointer="br"] .chip-cursor { right: -0.9375rem; bottom: -0.9375rem; transform: scale(-1, -1); }
@media (max-width: 47.99rem) { .chip { display: none; } }
`;
}

// A path through points with rounded corners: a connector that turns like a circuit trace, not a diagonal.
export function roundedPolyline(points, radius = 14) {
  const d = [`M${r1(points[0][0])} ${r1(points[0][1])}`];
  for (let i = 1; i < points.length - 1; i++) {
    const [px, py] = points[i - 1];
    const [x, y] = points[i];
    const [nx, ny] = points[i + 1];
    const a = Math.hypot(x - px, y - py);
    const b = Math.hypot(nx - x, ny - y);
    const k = Math.min(radius, a / 2, b / 2);
    d.push(`L${r1(x - ((x - px) / a) * k)} ${r1(y - ((y - py) / a) * k)}Q${r1(x)} ${r1(y)} ${r1(x + ((nx - x) / b) * k)} ${r1(y + ((ny - y) / b) * k)}`);
  }
  const last = points[points.length - 1];
  d.push(`L${r1(last[0])} ${r1(last[1])}`);
  return d.join('');
}

// An elbow from one point to another: horizontal first ('h'), vertical first ('v'), or horizontal-vertical-horizontal ('hvh').
export function elbow([x1, y1], [x2, y2], { first = 'h', radius = 14 } = {}) {
  if (first === 'v') return roundedPolyline([[x1, y1], [x1, y2], [x2, y2]], radius);
  if (first === 'hvh') return roundedPolyline([[x1, y1], [(x1 + x2) / 2, y1], [(x1 + x2) / 2, y2], [x2, y2]], radius);
  return roundedPolyline([[x1, y1], [x2, y1], [x2, y2]], radius);
}

// A diagram that sits behind a card: nodes at the left, right and top, each joined to the card by a thin traced line.
// Seeded, so the same page always gets the same diagram. `card` is { x, y, w }: where the card's top edge is.
// Every label is a placeholder (data-todo): replace each with the name of one of the product's own parts.
export function heroDiagram({ width = 1200, height = 520, card = { x: 230, y: 250, w: 740 }, seed = 1, stroke = 'var(--line-strong)', text = 'var(--ink-3)', labels } = {}) {
  const rand = rng(seed);
  const names = labels ?? ['Part one', 'Part two', 'Part three', 'Part four', 'Part five'];
  const slots = [
    { side: 'l', x: 36, y: 70 + rand() * 50, join: [card.x + card.w * 0.12, card.y], first: 'h' },
    { side: 'l', x: 36, y: 200 + rand() * 40, join: [card.x, card.y + 56 + rand() * 30], first: 'hvh' },
    { side: 'r', x: width - 36, y: 56 + rand() * 50, join: [card.x + card.w * 0.88, card.y], first: 'h' },
    { side: 'r', x: width - 36, y: 190 + rand() * 50, join: [card.x + card.w, card.y + 56 + rand() * 30], first: 'hvh' },
    { side: 'l', x: card.x + card.w * 0.46, y: 30 + rand() * 20, join: [card.x + card.w * 0.5, card.y], first: 'v' },
  ];
  const paths = [];
  const nodes = [];
  slots.forEach((s, i) => {
    const w = 96;
    const nx = s.side === 'l' ? s.x : s.x - w;
    const from = s.first === 'v' ? [nx + w / 2, s.y + 22] : [s.side === 'l' ? nx + w : nx, s.y + 11];
    paths.push(`<path d="${elbow(from, s.join, { first: s.first === 'v' ? 'v' : s.first, radius: 18 })}"/>`);
    nodes.push(`<g><rect x="${r1(nx)}" y="${r1(s.y)}" width="${w}" height="22" rx="4"/><text x="${r1(nx + 10)}" y="${r1(s.y + 15)}" data-todo>${esc(names[i % names.length])}</text><circle cx="${r1(s.join[0])}" cy="${r1(s.join[1])}" r="3"/></g>`);
  });
  return `<svg class="diagram" viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMin slice" aria-hidden="true" focusable="false" data-draw><g fill="none" stroke="${stroke}" stroke-width="1">${paths.join('')}</g><g fill="none" stroke="${stroke}" stroke-width="1">${nodes.join('')}</g><style>.diagram text{fill:${text};stroke:none;font:400 11px var(--mono)}.diagram circle{fill:${stroke};stroke:none}</style></svg>`;
}
