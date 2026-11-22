// Writes a demo page in the instrument style so you can see the recipes together:
//   node assets/recipes/instrument-demo.mjs dark  > instrument-dark.html
//   node assets/recipes/instrument-demo.mjs light > instrument-light.html
// The labels on the object are marked as an example reading: never invent specs for a real product.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { downsample, halftoneSvg } from './dither.mjs';
import { disc, makeField, sphere } from './fields.mjs';
import { callout, cornerBrackets, crosshair, overlaySvg, readout, registration, ruler } from './hud.mjs';

const mode = process.argv[2] === 'light' ? 'light' : 'dark';
const css = readFileSync(fileURLToPath(new URL('./instrument.css', import.meta.url)), 'utf8');
const accent = mode === 'dark' ? '#ff5a1f' : '#d4281f';

// The hero object: a lit sphere drawn as hex halftone dots. Light mode reads like print (dark dots build the shadow);
// dark mode reads like light on a screen (bright dots build the lit side).
const N = 150;
const R = 0.42;
const body = sphere(N, N, { r: R, light: [-0.45, -0.5, 0.75], ambient: 0.2 });
const inside = disc(N, N, { r: R, soft: 0.004 });
const field = makeField(N, N, (_u, _v, x, y) => {
  const shade = body.data[y * N + x];
  if (mode === 'dark') return shade * 0.85;
  return inside.data[y * N + x] > 0.02 ? 1 - (1 - shade) * 0.85 : 1;
});
const dots = halftoneSvg(field, { cell: 6, hex: true, invert: mode === 'dark', fill: mode === 'dark' ? '#e8e6e1' : '#14161a', scale: 4.2, maxRadius: 2.8, angle: 0 });

// Meridians and parallels drawn as fine lines over the dots, so they stay crisp at any size.
function graticuleLines({ cx, cy, r, stroke }) {
  const parts = [];
  for (let k = 1; k < 6; k++) parts.push(`<ellipse cx="${cx}" cy="${cy}" rx="${(r * Math.abs(Math.sin((k * Math.PI) / 6))).toFixed(1)}" ry="${r}"/>`);
  for (let k = -3; k <= 3; k++) {
    const y = cy + r * Math.sin((k * Math.PI) / 8);
    const half = r * Math.cos((k * Math.PI) / 8);
    parts.push(`<path d="M${(cx - half).toFixed(1)} ${y.toFixed(1)}Q${cx} ${(y + 10 * (k === 0 ? 0 : Math.sign(k))).toFixed(1)} ${(cx + half).toFixed(1)} ${y.toFixed(1)}"/>`);
  }
  return `<g fill="none" stroke="${stroke}" stroke-width="0.7" opacity=".35">${parts.join('')}</g>`;
}

const W = 640;
const H = 640;
const stroke = mode === 'dark' ? '#e8e6e1' : '#14161a';
const ground = mode === 'dark' ? '#0f0f10' : '#e6e5e1';
const overlay = overlaySvg({
  width: W,
  height: H,
  children: [
    `<g color="${stroke}" opacity=".9">`,
    callout({ x: 190, y: 230, label: 'Surface scan', sub: 'Example reading', dx: -40, dy: -90, side: 'left', stroke, fill: ground }),
    callout({ x: 430, y: 330, label: 'Signal lock', sub: 'Example reading', dx: 60, dy: 70, side: 'right', stroke, fill: ground }),
    graticuleLines({ cx: 320, cy: 320, r: 0.42 * 640 * 0.92, stroke }),
    crosshair({ x: 320, y: 320, size: 22, stroke: accent, gap: 6 }),
    registration({ x: 40, y: 600, stroke }),
    registration({ x: 600, y: 40, stroke }),
    ruler({ x: 610, y: 120, length: 400, step: 20, major: 100, orientation: 'v', stroke, text: stroke, side: -1 }),
    '</g>',
  ],
});

console.log(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Instrument demo</title>
<style>${css}
body{margin:0;min-height:100vh}
.hero{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.1fr);min-height:100vh}
.left{padding:96px 56px 56px;display:flex;flex-direction:column;justify-content:center;gap:24px;position:relative}
.nav{position:absolute;top:0;left:0;right:0;display:flex;justify-content:space-between;align-items:center;padding:20px 56px}
.nav a{display:inline-flex;align-items:center;min-height:44px;padding:0 12px;color:var(--ink-2);text-decoration:none;font:400 13px var(--mono);margin-left:8px}
.right{position:relative;display:flex;align-items:center;justify-content:center;border-left:1px solid var(--line)}
.stage{width:min(100%,640px);aspect-ratio:1}
.stage svg{width:100%;height:100%}
.lede{max-width:34ch;font-size:16px;line-height:1.5;color:var(--ink-2);margin:0}
.actions{display:flex;gap:12px;flex-wrap:wrap}
.foot{position:absolute;left:56px;right:56px;bottom:40px}
@media(max-width:900px){.hero{grid-template-columns:1fr}.left{padding:96px 24px 24px}.nav{padding:20px 24px}.right{min-height:420px;border-left:0}.foot{position:static;margin:24px}}
</style></head>
<body class="inst inst-${mode} grid-bg" style="--accent:${accent}">
<section class="hero">
  <div class="left">
    <nav class="nav" aria-label="Main"><a class="micro micro-caps" href="#" style="display:inline-flex;align-items:center;min-height:44px;text-decoration:none">Orbital</a><span><a href="#">Product</a><a href="#">Docs</a><a href="#">Pricing</a></span></nav>
    <span class="micro micro-caps slash">Earth observation</span>
    <h1 class="display">See the planet <span class="br-word">change</span>.</h1>
    <p class="lede">Daily imagery of any place on Earth, delivered as a clean feed you can query, compare and act on.</p>
    <div class="actions"><a class="btn btn-accent" href="#">Request access</a><a class="btn" href="#">Read the docs</a></div>
    <div class="foot"><div class="stats"><div class="stat"><b>Daily</b><span>revisit</span></div><div class="stat"><b>3 m</b><span>resolution</span></div><div class="stat"><b>API</b><span>and bulk export</span></div><div class="stat"><b>Free</b><span>to start</span></div></div></div>
  </div>
  <div class="right"><div class="stage">
    <div style="position:absolute;inset:0;display:grid;place-items:center">${dots.replace('<svg ', '<svg style="width:92%;height:92%" ')}</div>
    <div style="position:absolute;inset:0">${overlay}</div>
  </div></div>
</section></body></html>`);
