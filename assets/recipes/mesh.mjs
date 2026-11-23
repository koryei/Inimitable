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
  abyss:   { family: ['#2c8a85', '#3aa59a', '#1f6f78', '#5fc4b0'], counter: '#e7a86f', base: '#04110f', dark: true },
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
// The luminous edge of a body of light: a soft elliptical rim, like the limb of a planet or the lip of a bowl of glow.
// It is what turns a smudge of colour into a shape with an inside and an outside.
const rim = (x, y, rx, ry, color, at = 70, soft = 5) => `radial-gradient(ellipse ${rx}% ${ry}% at ${x}% ${y}%, transparent ${at - soft}%, ${color} ${at}%, transparent ${at + soft}%)`;
const mixIn = (c, pct) => `color-mix(in srgb, ${c} ${pct}%, transparent)`;

const pool = (x, y, rx, ry, color, fade = 62) => `radial-gradient(${rx}% ${ry}% at ${x}% ${y}%, ${color} 0%, transparent ${fade}%)`;

const SHAPES = {
  // Several soft pools placed off-centre, one family plus a counterpoint.
  pools(p, rand) {
    const spots = [[12, 20], [86, 10], [72, 90], [34, 58], [60, 45]];
    const jitter = () => (rand() - 0.5) * 14;
    const layers = p.family.slice(0, 3).map((c, i) => pool(spots[i][0] + jitter(), spots[i][1] + jitter(), 50 + rand() * 22, 58 + rand() * 20, c, 60 + rand() * 8));
    // On a light ground the counterpoint is a hint, not a colour: at full strength it reads as paint.
    layers.push(pool(spots[3][0] + jitter(), spots[3][1] + jitter(), 44, 52, p.dark ? p.counter : mixIn(p.counter, 55), 66));
    layers.push(pool(spots[4][0] + jitter(), spots[4][1] + jitter(), 40, 46, p.family[3], 70));
    return layers;
  },
  // A glow rising from the bottom edge, dark above: an atmosphere, a planet's limb, a sunrise.
  horizon(p, rand) {
    const x = 42 + rand() * 16;
    const edge = p.dark ? [rim(x, 118, 70, 62, mixIn(p.family[2], 60), 70)] : [];
    // Pale pastel on pale paper barely differs in lightness, so a light horizon rises further into the frame.
    const lift = p.dark ? 0 : 16;
    return [
      ...edge,
      pool(x, 112 - lift, 85, 62 + lift / 2, p.family[2], 88),
      pool(x - 12, 108 - lift, 68, 46 + lift / 2, p.family[1], 80),
      pool(x + 18, 104 - lift, 52, 34 + lift / 2, p.counter, 74),
      pool(x, 100 - lift, 62, 30 + lift / 2, p.family[0], 78),
    ];
  },
  // The inverse: light pours down from the top into the dark, leaving the lower half calm for type.
  bowl(p, rand) {
    const x = 40 + rand() * 20;
    const edge = p.dark ? [rim(x, -20, 74, 58, mixIn(p.family[2], 62), 70)] : [];
    return [
      ...edge,
      pool(x, -14, 104, 72, p.family[0], 92),
      pool(x - 22, -6, 64, 46, p.family[1], 84),
      pool(x + 26, -8, 58, 42, p.counter, 82),
      pool(x, -16, 84, 54, p.family[2], 88),
    ];
  },
  // One soft cloud of colour to one side, the rest of the page left clean.
  blob(p, rand) {
    const x = 78 + rand() * 12;
    const y = 36 + rand() * 18;
    return [
      pool(x, y, 46, 70, p.family[1], 72),
      pool(x - 14, y - 12, 38, 54, p.family[0], 70),
      pool(x + 4, y + 18, 34, 48, p.dark ? p.counter : mixIn(p.counter, 70), 70),
      pool(x - 24, y + 6, 30, 40, p.family[2], 70),
    ];
  },
  // Shafts of light falling from above, like sun through water or a window in a dark room. The shafts are a
  // separate layer (drawn on ::before) so they can be masked on their own; the pools beneath give them a source.
  rays(p, rand) {
    const angle = 96 + rand() * 10;
    const ray = (c, a) => `color-mix(in srgb, ${c} ${a}%, transparent)`;
    const colour = p.dark ? p.family[2] : p.family[0];
    return {
      layers: [pool(50, -12, 96, 64, p.family[1], 92), pool(30, -6, 58, 40, p.family[0], 80), pool(74, -8, 52, 36, p.counter, 74)],
      before: {
        background: [
          `repeating-linear-gradient(${angle}deg, transparent 0 7%, ${ray(colour, p.dark ? 34 : 40)} 10%, transparent 13.5%, transparent 19%)`,
          `repeating-linear-gradient(${angle + 5}deg, transparent 0 11%, ${ray(p.family[2], p.dark ? 22 : 28)} 14%, transparent 17%, transparent 27%)`,
        ].join(',\n    '),
        mask: 'linear-gradient(to bottom, #000 0%, rgba(0,0,0,0.65) 38%, transparent 82%)',
      },
    };
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
  // Topographic contour lines over a soft pool of light: a map of the product's terrain, calm and exact.
  // The lines sit on ::before so they fade out with the mask and can drift on their own.
  contour(p, rand) {
    const cx = 500 + (rand() - 0.5) * 360, cy = 175 + (rand() - 0.5) * 70;  // the terrain sits high, so the headline below it stays on quiet ground
    const wob = [[2, rand() * 6.28, 0.07 + rand() * 0.05], [3, rand() * 6.28, 0.05 + rand() * 0.04], [5, rand() * 6.28, 0.02 + rand() * 0.02]];
    const rings = 15;
    const paths = [];
    for (let i = 1; i <= rings; i++) {
      const r0 = 26 + i * 34;
      const pts = [];
      for (let k = 0; k < 96; k++) {
        const t = (k / 96) * Math.PI * 2;
        const r = r0 * (1 + wob.reduce((sum, [n, ph, a]) => sum + a * Math.sin(n * t + ph + i * 0.09), 0));
        pts.push(`${(cx + r * Math.cos(t) * 1.45).toFixed(1)} ${(cy + r * Math.sin(t) * 0.82).toFixed(1)}`);
      }
      paths.push(`<path d="M${pts.join('L')}Z"/>`);
    }
    const stroke = p.dark ? p.family[2] : '#2a2218';
    const opacity = p.dark ? 0.34 : 0.16;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid slice"><g fill="none" stroke="${stroke}" stroke-opacity="${opacity}" stroke-width="1.1" vector-effect="non-scaling-stroke">${paths.join('')}</g></svg>`;
    const url = `url("data:image/svg+xml,${svg.replace(/</g, '%3C').replace(/>/g, '%3E').replace(/#/g, '%23').replace(/"/g, "'")}") center / cover no-repeat`;
    const mixIn = (c, n) => `color-mix(in srgb, ${c} ${p.dark ? Math.round(n * 0.8) : n}%, transparent)`;
    return {
      layers: [
        pool(cx / 10, cy / 6, 50, 52, mixIn(p.family[1], 70), 66),
        pool(cx / 10 - 18, cy / 6 + 10, 34, 38, mixIn(p.family[0], 70), 70),
        pool(cx / 10 + 22, cy / 6 - 12, 26, 30, mixIn(p.counter, 45), 72),
      ],
      before: { background: url, mask: 'radial-gradient(90% 90% at 50% 45%, #000 35%, transparent 100%)' },
    };
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

// Faint specks scattered through the light, like dust in a beam. Static dots; pair with .m-drift for a slow breath.
export function motes({ count = 46, seed = 7, color = '#ffffff', alpha = 0.55 } = {}) {
  const rand = rng(seed);
  return Array.from({ length: count }, () => {
    const x = (rand() * 100).toFixed(1), y = (rand() * 100).toFixed(1), r = (1 + rand() * 1.6).toFixed(1);
    const a = Math.round(alpha * (0.3 + rand() * 0.7) * 100);
    return `radial-gradient(circle at ${x}% ${y}%, color-mix(in srgb, ${color} ${a}%, transparent) ${r}px, transparent ${(Number(r) + 1).toFixed(1)}px)`;
  });
}

export function grainient({ palette = 'ember', shape = 'pools', seed = 1, mask = 'bottom', grain = 0.4, selector = '.ground', drift = false, withMotes = false } = {}) {
  const p = typeof palette === 'string' ? PALETTES[palette] : palette;
  if (!p) throw new Error(`Unknown palette "${palette}". Use one of ${Object.keys(PALETTES).join(', ')} or fromAccent("#hex").`);
  if (!SHAPES[shape]) throw new Error(`Unknown shape "${shape}". Use one of ${SHAPE_NAMES.join(', ')}.`);
  const rand = rng(seed);
  const built = SHAPES[shape](p, rand);
  const layers = Array.isArray(built) ? built : built.layers;
  const before = Array.isArray(built) ? null : built.before;
  const maskCss = MASKS[mask] ?? mask;
  // A second layer on ::before holds shafts of light and/or motes, so it can be masked and animated on its own.
  const speck = withMotes ? motes({ color: p.dark ? p.family[2] : '#ffffff', alpha: p.dark ? 0.7 : 0.9 }) : [];
  const beforeBg = [...(before ? [before.background] : []), ...speck].join(',\n    ');
  const beforeCss = beforeBg ? [`${selector}::before {`, '  content: "";', '  position: absolute;', '  inset: 0;', '  pointer-events: none;', `  background:\n    ${beforeBg};`, before?.mask ? `  -webkit-mask-image: ${before.mask};\n  mask-image: ${before.mask};` : '', drift && withMotes ? '  animation: m-drift 38s ease-in-out infinite alternate;' : '', '}'].filter(Boolean).join('\n') : '';
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
    beforeCss,
    grainCss({ dark: !!p.dark, strength: grain, selector: `${selector}::after` }),
  ].filter(Boolean).join('\n');
  return { css, palette: p, problems: audit(p), layers };
}
