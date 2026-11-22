// Writes demo.html showing each recipe, so you can see them: node assets/recipes/demo.mjs > demo.html
import { contourSvg } from './contours.mjs';
import { dotField, fadeRight } from './dots.mjs';
import { stoneStack } from './shapes.mjs';

const stones = stoneStack({ count: 5, width: 300, seed: 3, centerX: 200, baseY: 330 });
const tones = ['#cfc7b4', '#d8d1bf', '#e1dac9', '#e8e2d3', '#efe9dc'];
// Each stone is one neutral with a small tone shift from top to bottom: lighter where light lands, darker underneath.
const stoneSvg = `<svg viewBox="0 0 400 360" width="400" height="360" aria-hidden="true">
  <defs>${tones.map((t, i) => `<linearGradient id="s${i}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${t}"/><stop offset="1" stop-color="${shade(t, -0.1)}"/></linearGradient>`).join('')}</defs>
  <ellipse cx="200" cy="334" rx="150" ry="7" fill="#000" opacity=".14"/>
  ${stones.map((s, i) => `<path d="${s.d}" fill="url(#s${i})"/>`).join('')}
</svg>`;

function shade(hex, amount) {
  const n = parseInt(hex.slice(1), 16);
  const f = (v) => Math.max(0, Math.min(255, Math.round(v * (1 + amount))));
  return `#${[(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => f(v).toString(16).padStart(2, '0')).join('')}`;
}

console.log(`<!doctype html><meta charset="utf-8"><title>Recipes</title>
<style>
  body{margin:0;font:16px system-ui;background:#f1ede2;color:#1f1b16}
  .row{display:grid;grid-template-columns:1.4fr 1fr;gap:0;min-height:420px}
  .a{position:relative;overflow:hidden;color:#2c4a3a}
  .a svg{position:absolute;inset:0;width:100%;height:100%}
  .a h2{position:relative;font:400 56px/1.05 Georgia,serif;margin:0;padding:120px 48px;max-width:12ch}
  .b{background:#1d221d;display:flex;align-items:center;justify-content:center}
  .c{position:relative;color:#1f1b16;padding:48px;min-height:300px;overflow:hidden}
  .c svg{position:absolute;inset:0}
  .c p{position:relative;max-width:30ch;font:400 32px/1.2 Georgia,serif}
</style>
<div class="row"><div class="a">${contourSvg({ width: 960, height: 420, seed: 7, levels: 16, opacity: 0.3 })}<h2>Write it down where you found it</h2></div><div class="b">${stoneSvg}</div></div>
<div class="c">${dotField({ width: 1440, height: 300, step: 14, radius: fadeRight(3.2), opacity: 0.5 })}<p>Dot field whose density fades to the right.</p></div>`);
