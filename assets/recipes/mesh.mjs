// Grainy mesh gradients ("grainients"): a ground made of soft light with grain on top.
//
//   import { grainient, fromAccent, PALETTES } from './mesh.mjs';
//   const { css } = grainient({ palette: 'ember', shape: 'horizon', seed: 4 });
//   // put css in your stylesheet, then <div class="ground" aria-hidden="true"></div> behind the content
//
// Why it works (see references/materials.md): the eye reads a ground as a material when it is lit from a
// direction, held to one temperature family with a single counterpoint, broken up with grain so it never
// bands, and faded into the page at its edges. This builds exactly that, and refuses colours that read as paint.

import { rng } from './noise.mjs';

// ---------- colour helpers ----------
export function hexToHsl(hex) {
  const n = parseInt(hex.replace('#', ''), 16);
  const r = ((n >> 16) & 255) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min, l = (max + min) / 2;
  if (!d) return { h: 0, s: 0, l };
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  const h = max === r ? ((g - b) / d + (g < b ? 6 : 0)) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return { h: h * 60, s, l };
}
// How paint-like a colour is: HSV saturation (chroma over brightness). HSL calls every pastel "saturated".
export function paintiness(hex) {
  const n = parseInt(hex.replace('#', ''), 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  return max ? (max - min) / max : 0;
}
export const PAINT_CAP = { light: 0.55, dark: 0.8 };

export function hsl(h, s, l, a = 1) {
  return `hsl(${Math.round(((h % 360) + 360) % 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%${a < 1 ? ` / ${a}` : ''})`;
}

// A palette is a family (3 to 4 colours in one temperature), one counterpoint, and the page base.
export const PALETTES = {
  ember:   { family: ['#f6c9a8', '#f1a79b', '#e9c19a', '#f4dbc6'], counter: '#9fb6df', base: '#f4efe8' },
  petal:   { family: ['#f3c4cf', '#e9a9c0', '#f1d3c8', '#f6e2dc'], counter: '#a9c3d9', base: '#f6f1ee' },
  glacier: { family: ['#b9d3ee', '#9fc0e6', '#cfe0f2', '#dfe9f4'], counter: '#f0b79b', base: '#eef2f6' },
  moss:    { family: ['#c9d8b4', '#b3c99b', '#dfe6c9', '#e9eedb'], counter: '#e5b998', base: '#f1f2ea' },
  dusk:    { family: ['#6a5bd6', '#8a4fc9', '#b24fb0', '#4b3fa8'], counter: '#ff9a7a', base: '#0c0814', dark: true },
  midnight:{ family: ['#4f7df0', '#6f97f5', '#9bbcf8', '#2f5fd8'], counter: '#ffb28a', base: '#070b1f', dark: true },
  coal:    { family: ['#8b6a55', '#a47d63', '#6f5446', '#c9a487'], counter: '#6f86a8', base: '#0e0d0c', dark: true },
  ink:     { family: ['#5b6a8a', '#7b8aa8', '#46557a', '#9aa7c1'], counter: '#d9a98a', base: '#0b0d12', dark: true },
};

// Build a palette from one accent: the family sits within about 30 degrees of it, the counterpoint opposite,
// and saturation is capped so the ground stays light rather than paint.
export function fromAccent(hex, { dark = false } = {}) {
  const { h, s } = hexToHsl(hex);
  const cap = dark ? PAINT_CAP.dark : PAINT_CAP.light;
  const l = dark ? [0.52, 0.6, 0.42, 0.7] : [0.82, 0.76, 0.88, 0.92];
  let sat = Math.min(0.9, Math.max(0.3, s * 0.8));
  const build = () => {
    const hues = [h, h - 18, h + 16, h + 30];
    return {
      family: hues.map((hh, i) => hslToHex(hh, sat, l[i])),
      counter: hslToHex(h + 185, sat * 0.85, dark ? 0.62 : 0.78),
      base: dark ? hslToHex(h, 0.35, 0.05) : hslToHex(h, 0.2, 0.95),
      dark,
    };
  };
  let p = build();
  // Pull saturation back until nothing in the ground reads as paint.
  for (let i = 0; i < 40 && [...p.family, p.counter].some((c) => paintiness(c) > cap); i++) { sat *= 0.93; p = build(); }
  return p;
}
export function hslToHex(h, s, l) {
  h = ((h % 360) + 360) % 360;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => { const k = (n + h / 30) % 12; return Math.round(255 * (l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1)))).toString(16).padStart(2, '0'); };
  return `#${f(0)}${f(8)}${f(4)}`;
}

// ---------- grain ----------
// Fine noise from an SVG filter, inline. `strength` 0..1 maps to 4% .. 22% opacity.
export function grainCss({ dark = false, strength = 0.4, selector = '.ground::after' } = {}) {
  const opacity = (0.04 + strength * 0.18).toFixed(3);
  const matrix = dark ? '0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1 0' : '0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0';
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='${matrix}'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>`;
  return `${selector} {\n  content: "";\n  position: absolute;\n  inset: 0;\n  pointer-events: none;\n  opacity: ${opacity};\n  mix-blend-mode: ${dark ? 'screen' : 'multiply'};\n  background-image: url("data:image/svg+xml;utf8,${svg}");\n}`;
}

// ---------- shapes: where the light comes from ----------
const pool = (x, y, rx, ry, color, fade = 62) => `radial-gradient(${rx}% ${ry}% at ${x}% ${y}%, ${color} 0%, transparent ${fade}%)`;

const SHAPES = {
  // Several soft pools placed off-centre, one family plus a counterpoint.
  pools(p, rand) {
    const spots = [[12, 20], [86, 10], [72, 90], [34, 58], [60, 45]];
    const jitter = () => (rand() - 0.5) * 14;
    const layers = p.family.slice(0, 3).map((c, i) => pool(spots[i][0] + jitter(), spots[i][1] + jitter(), 50 + rand() * 22, 58 + rand() * 20, c, 60 + rand() * 8));
    layers.push(pool(spots[3][0] + jitter(), spots[3][1] + jitter(), 44, 52, p.counter, 66));
    layers.push(pool(spots[4][0] + jitter(), spots[4][1] + jitter(), 40, 46, p.family[3], 70));
    return layers;
  },
  // A glow rising from the bottom edge, dark above: an atmosphere, a planet's limb, a sunrise.
  horizon(p, rand) {
    const x = 42 + rand() * 16;
    return [
      pool(x, 112, 85, 62, p.family[2], 88),
      pool(x - 12, 108, 68, 46, p.family[1], 80),
      pool(x + 18, 104, 52, 34, p.counter, 74),
      pool(x, 100, 62, 30, p.family[0], 78),
    ];
  },
  // The inverse: light pours down from the top into the dark, leaving the lower half calm for type.
  bowl(p, rand) {
    const x = 40 + rand() * 20;
    return [
      pool(x, -12, 90, 60, p.family[0], 90),
      pool(x - 20, -6, 55, 36, p.family[1], 80),
      pool(x + 22, -8, 50, 32, p.counter, 78),
      pool(x, -14, 70, 40, p.family[2], 85),
    ];
  },
  // One soft cloud of colour to one side, the rest of the page left clean.
  blob(p, rand) {
    const x = 78 + rand() * 12;
    const y = 36 + rand() * 18;
    return [
      pool(x, y, 46, 70, p.family[1], 72),
      pool(x - 14, y - 12, 38, 54, p.family[0], 70),
      pool(x + 4, y + 18, 34, 48, p.counter, 70),
      pool(x - 24, y + 6, 30, 40, p.family[2], 70),
    ];
  },
  // A diagonal sweep of colour, like a fold in cloth.
  sweep(p, rand) {
    const a = 118 + rand() * 20;
    // On a dark ground the band is a thin seam of light, not a wash, or the ground stops being dark.
    const w = p.dark ? [44, 50, 56] : [34, 52, 66];
    const mixIn = (c) => (p.dark ? `color-mix(in srgb, ${c} 55%, transparent)` : c);
    return [
      `linear-gradient(${a}deg, transparent ${w[0] - 22}%, ${mixIn(p.family[0])} ${w[0]}%, ${mixIn(p.family[1])} ${w[1]}%, ${mixIn(p.counter)} ${w[2]}%, transparent ${w[2] + 24}%)`,
      pool(14, 82, 54, 60, mixIn(p.family[2]), 70),
      pool(88, 16, 46, 52, mixIn(p.family[3]), 70),
    ];
  },
};
export const SHAPE_NAMES = Object.keys(SHAPES);

const MASKS = {
  bottom: 'linear-gradient(#000 60%, transparent 100%)',
  top: 'linear-gradient(transparent 0%, #000 40%)',
  radial: 'radial-gradient(120% 100% at 50% 40%, #000 55%, transparent 100%)',
  none: '',
};

// Everything checked against the rules that make a ground read as a material and not as paint.
export function audit(palette) {
  const problems = [];
  const all = [...palette.family, palette.counter];
  const cap = palette.dark ? PAINT_CAP.dark : PAINT_CAP.light;
  for (const c of all) {
    const v = paintiness(c);
    if (v > cap) problems.push(`${c} is ${Math.round(v * 100)}% saturated: a ground is light, not paint (keep stops under ${Math.round(cap * 100)}% on a ${palette.dark ? 'dark' : 'light'} ground)`);
  }
  const hues = palette.family.map((c) => hexToHsl(c)).filter((c) => c.s > 0.1).map((c) => c.h);
  const spread = hues.length ? Math.max(...hues) - Math.min(...hues) : 0;
  if (spread > 70 && Math.max(...hues) - Math.min(...hues) < 290) problems.push(`the family spans ${Math.round(spread)} degrees of hue: keep it in one temperature, with one counterpoint`);
  return problems;
}

export function grainient({ palette = 'ember', shape = 'pools', seed = 1, mask = 'bottom', grain = 0.4, selector = '.ground', drift = false } = {}) {
  const p = typeof palette === 'string' ? PALETTES[palette] : palette;
  if (!p) throw new Error(`Unknown palette "${palette}". Use one of ${Object.keys(PALETTES).join(', ')} or fromAccent("#hex").`);
  if (!SHAPES[shape]) throw new Error(`Unknown shape "${shape}". Use one of ${SHAPE_NAMES.join(', ')}.`);
  const rand = rng(seed);
  const layers = SHAPES[shape](p, rand);
  const maskCss = MASKS[mask] ?? mask;
  const css = [
    `${selector} {`,
    '  position: absolute;',
    '  inset: 0;',
    '  z-index: -1;',
    '  overflow: hidden;',
    '  pointer-events: none;',
    `  background:\n    ${layers.join(',\n    ')},\n    ${p.base};`,
    maskCss ? `  -webkit-mask-image: ${maskCss};\n  mask-image: ${maskCss};` : '',
    drift ? '  animation: m-drift 38s ease-in-out infinite alternate;' : '',
    '}',
    grainCss({ dark: !!p.dark, strength: grain, selector: `${selector}::after` }),
  ].filter(Boolean).join('\n');
  return { css, palette: p, problems: audit(p), layers };
}
