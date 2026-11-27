// Duotone artwork with no photograph: a drawn subject shaded in one ink on one paper, as a halftone, a dither or
// an engraving. The look is the printed kind: a statue or a landscape in a single saturated colour, flat, with a
// texture that ties the picture to the interface around it. Here the subject is computed, so it needs no stock
// image, belongs to nobody and is the same every time for a seed.
//
//   import { duotoneSvg, SUBJECTS } from './duotone.mjs';
//   const svg = duotoneSvg({ subject: 'strata', seed: 3, mode: 'lines', ink: '#2447e8', paper: '#ffffff' });
//
// The built-in subjects are generic stand-ins (a column, a vase, a sphere, folds of cloth, layered strata).
// The artwork only helps a page if it is about the product: pass `field` instead of `subject` with a brightness
// field of the product's own artifact (a field from fields.mjs, or a rendered picture through dotify.mjs), and
// treat the stand-ins as a way to see the technique. See references/directions.md ("Duotone").
//
// A field is { width, height, data } with 1 = paper (empty) and 0 = full ink, as in dither.mjs.

import { downsample, ditherSvg, halftoneSvg, orderedDither } from './dither.mjs';
import { makeField, smoothstep } from './fields.mjs';
import { valueNoise } from './noise.mjs';
import { PROFILES, radiusAt } from './revolve.mjs';

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
// How ink-free the paper is, and how light the lightest part of a subject stays, so a subject always reads against its paper.
const PAPER = 1;
const LIGHTEST = 0.86;
const DARKEST = 0.1;
const tone = (shade) => DARKEST + (LIGHTEST - DARKEST) * clamp(shade);

// A body of revolution lit from the left: `radius(v)` gives the half-width (0..0.5 of the width) at height v, or 0 for empty.
function lathe(w, h, radius, { light = [-0.62, -0.2, 0.75], flutes = 0, fluteRange = [0, 0], cast = 0 } = {}) {
  const len = Math.hypot(...light);
  const L = light.map((c) => c / len);
  return makeField(w, h, (u, v) => {
    const r = radius(v);
    const nx = r > 0 ? (u - 0.5) / r : 2;
    if (Math.abs(nx) >= 1) {
      // A soft shadow on the paper, to the right of the object, so it sits on something.
      if (!cast) return PAPER;
      const side = (u - 0.5 - r) / (cast * 0.5 + 1e-6);
      return r > 0 && u > 0.5 && side < 1 && v > 0.6 ? PAPER - 0.22 * (1 - side) * smoothstep(0.6, 0.98, v) : PAPER;
    }
    const z = Math.sqrt(1 - nx * nx);
    let shade = 0.1 + Math.max(0, nx * L[0] + z * L[2]) * 0.95;
    if (flutes && v > fluteRange[0] && v < fluteRange[1]) shade += Math.sin(Math.asin(nx) * flutes) * 0.1 * z;
    // The edge is drawn darker, which is what gives an engraved figure its outline.
    shade *= 0.55 + 0.45 * smoothstep(1, 0.82, Math.abs(nx));
    return tone(shade);
  });
}

export const SUBJECTS = {
  // A classical column: slab, capital, fluted shaft, base.
  column(w, h) {
    const radius = (v) => {
      if (v < 0.05 || v > 0.96) return 0;
      if (v < 0.09) return 0.3;
      if (v < 0.17) return 0.19 + 0.09 * smoothstep(0.17, 0.09, v) ** 1.5;
      if (v < 0.86) return 0.185 - 0.03 * ((v - 0.17) / 0.69);
      if (v < 0.9) return 0.215;
      return 0.27;
    };
    return lathe(w, h, radius, { flutes: 9, fluteRange: [0.17, 0.86], cast: 0.3 });
  },
  // A turned vessel, drawn from the profile table in revolve.mjs.
  vase(w, h, { seed = 1 } = {}) {
    const names = Object.keys(PROFILES);
    const profile = PROFILES[names[(seed - 1 + names.length) % names.length]];
    const radius = (v) => (v < 0.06 || v > 0.94 ? 0 : radiusAt(profile, 1 - (v - 0.06) / 0.88) * 0.42);
    return lathe(w, h, radius, { cast: 0.3 });
  },
  // A lit sphere on paper.
  sphere(w, h) {
    return makeField(w, h, (u, v) => {
      const x = ((u - 0.5) * (w / h)) / 0.34;
      const y = (v - 0.48) / 0.34;
      const d2 = x * x + y * y;
      if (d2 >= 1) return PAPER;
      const z = Math.sqrt(1 - d2);
      const shade = 0.08 + Math.max(0, x * -0.5 + y * -0.55 + z * 0.67) * 0.98;
      return tone(shade * (0.6 + 0.4 * smoothstep(1, 0.8, Math.sqrt(d2))));
    });
  },
  // Folds of cloth: a few long waves, warped, shaded by their slope.
  drape(w, h, { seed = 1 } = {}) {
    const n = valueNoise(seed, 3);
    const height = (u, v) => Math.sin((u * 3.1 + n(u * 2, v * 2) * 1.6 + v * 0.5) * Math.PI * 2) * 0.5 + Math.sin((u * 6.3 - v * 0.8 + n(v * 3, u * 3) * 2) * Math.PI * 2) * 0.15;
    const e = 0.003;
    return makeField(w, h, (u, v) => {
      const dx = (height(u + e, v) - height(u - e, v)) / (2 * e);
      return tone(0.5 - dx * 0.035 + (n(u * 9, v * 9) - 0.5) * 0.06);
    });
  },
  // A cylinder on its side, cut into wavering layers: banded rock, a rolled length of tape, a stack of pages.
  strata(w, h, { seed = 1 } = {}) {
    const n = valueNoise(seed, 3);
    const tones = [0.9, 0.35, 0.65, 0.12, 0.78, 0.5];
    return makeField(w, h, (u, v) => {
      const half = 0.27;
      const ny = (v - 0.5) / half;
      if (Math.abs(ny) >= 1) return PAPER;
      const z = Math.sqrt(1 - ny * ny);
      // Layer boundaries wander with the noise and bow with the curve of the cylinder.
      const t = u * 7.5 + n(u * 2.4, 2.2) * 1.4 + ny * 0.5 * z;
      const band = tones[Math.abs(Math.floor(t)) % tones.length];
      const light = 0.2 + Math.max(0, -ny * 0.5 + z * 0.7);
      return tone(clamp(band * 0.7 + light * 0.4 - 0.05) * (0.6 + 0.4 * smoothstep(1, 0.8, Math.abs(ny))));
    });
  },
};

export const SUBJECT_NAMES = Object.keys(SUBJECTS);

// A line screen: one horizontal line per `pitch`, thicker where the picture is darker. The look of an engraving.
export function engraveSvg(field, { pitch = 6, step = 3, scale = 1, ink = 'currentColor', paper, min = 0.18 } = {}) {
  const w = field.width * scale;
  const h = field.height * scale;
  const sample = (x, y) => field.data[Math.min(field.height - 1, Math.floor(y / scale)) * field.width + Math.min(field.width - 1, Math.floor(x / scale))];
  const parts = [];
  const lines = Math.floor(h / pitch);
  for (let j = 0; j < lines; j++) {
    const yc = (j + 0.5) * pitch;
    let run = [];
    const flush = () => {
      if (run.length > 1) {
        const top = run.map(([x, t]) => `${x} ${(yc - t).toFixed(1)}`);
        const bottom = run.map(([x, t]) => `${x} ${(yc + t).toFixed(1)}`).reverse();
        parts.push(`M${top.join('L')}L${bottom.join('L')}Z`);
      }
      run = [];
    };
    for (let x = 0; x <= w; x += step) {
      const t = (1 - sample(x, yc)) * pitch * 0.5 * 0.96;
      if (t >= min) run.push([x, t]);
      else flush();
    }
    flush();
  }
  const bg = paper ? `<rect width="${w}" height="${h}" fill="${paper}"/>` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" aria-hidden="true" focusable="false">${bg}<path d="${parts.join('')}" fill="${ink}"/></svg>`;
}

// One call: a subject (or your own field) as a two-colour print. Returns an SVG string.
//   mode  halftone (dots grow with the dark), lines (an engraving) or dither (a crisp pixel screen)
//   cell  the dot pitch, line pitch or pixel size in output units
//   ink / paper  the only two colours in the picture. CSS variables work: ink 'var(--bg)', paper 'var(--ink)'.
export function duotoneSvg({ subject = 'column', field, width = 440, height = 550, seed = 1, mode = 'halftone', cell, ink = 'currentColor', paper, label, angle = 45 } = {}) {
  const makeSubject = SUBJECTS[subject];
  if (!field && !makeSubject) throw new Error(`Unknown subject "${subject}". Use one of ${SUBJECT_NAMES.join(', ')} or pass a field.`);
  const pitch = cell ?? (mode === 'lines' ? 6 : mode === 'dither' ? 5 : 8);
  // Sample the subject at about two samples per dot, so the file stays small and the dots stay round.
  const sw = Math.max(24, Math.round(width / (pitch * 0.5)));
  const src = field ?? makeSubject(sw, Math.round(sw * (height / width)), { seed });
  const scale = width / src.width;
  let svg;
  if (mode === 'lines') svg = engraveSvg(src, { pitch, step: Math.max(2, Math.round(pitch / 2)), scale, ink, paper });
  else if (mode === 'dither') {
    const fine = src.width > width / pitch ? downsample(src, Math.max(1, Math.floor(src.width / (width / pitch)))) : src;
    svg = ditherSvg(orderedDither(fine, { matrix: 4 }), { cell: width / fine.width, fill: ink, background: paper, lit: 0 });
  } else svg = halftoneSvg(src, { cell: pitch, maxRadius: pitch * 0.62, angle, fill: ink, background: paper, scale, minRadius: 0.5 });
  // Fill the box it is placed in: no fixed pixel size, crop rather than letterbox, and say what it is (or that it is decoration).
  svg = svg.replace(/ width="[\d.]+" height="[\d.]+"/, ' preserveAspectRatio="xMidYMid slice"');
  if (label) svg = svg.replace(/aria-hidden="true" focusable="false"/, `role="img" aria-label="${label.replace(/"/g, '&quot;')}"`);
  return svg;
}

// Fraction of the picture that is ink: a quick check that a subject neither vanishes nor fills in.
export function inkShare(field, threshold = 0.5) {
  let n = 0;
  for (const v of field.data) if (v < threshold) n++;
  return n / field.data.length;
}
