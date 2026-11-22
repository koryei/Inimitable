// Brightness fields drawn from maths, for when there is no picture: shapes, waves and terrain.
// Each returns { width, height, data } with 0 = black and 1 = white, ready for dither.mjs.
// Combine with `add`, `mul` and `mix`, or with a mask from `disc`, `ring` and `band`.

import { valueNoise } from './noise.mjs';

export function makeField(width, height, fn) {
  const data = new Float32Array(width * height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) data[y * width + x] = Math.min(1, Math.max(0, fn(x / width, y / height, x, y)));
  }
  return { width, height, data };
}

export const disc = (w, h, { cx = 0.5, cy = 0.5, r = 0.4, soft = 0.02 } = {}) =>
  makeField(w, h, (u, v) => 1 - smoothstep(r - soft, r + soft, Math.hypot((u - cx) * (w / h), v - cy)));

export const ring = (w, h, { cx = 0.5, cy = 0.5, r = 0.4, width = 0.01 } = {}) =>
  makeField(w, h, (u, v) => 1 - smoothstep(0, width, Math.abs(Math.hypot((u - cx) * (w / h), v - cy) - r)));

export const band = (w, h, { y = 0.5, thickness = 0.1, soft = 0.02 } = {}) =>
  makeField(w, h, (_u, v) => 1 - smoothstep(thickness / 2 - soft, thickness / 2 + soft, Math.abs(v - y)));

export const gradient = (w, h, { from = 0, to = 1, angle = 90 } = {}) => {
  const a = (angle * Math.PI) / 180;
  return makeField(w, h, (u, v) => from + (to - from) * Math.min(1, Math.max(0, (u - 0.5) * Math.cos(a) + (v - 0.5) * Math.sin(a) + 0.5)));
};

export const terrain = (w, h, { seed = 1, scale = 3, octaves = 4 } = {}) => {
  const n = valueNoise(seed, octaves);
  return makeField(w, h, (u, v) => n(u * scale * 8, v * scale * 8));
};

// A waveform as bars from a series of 0..1 samples, anchored at the bottom: a sound or a trend as a solid shape.
export const bars = (w, h, samples, { gap = 0 } = {}) =>
  makeField(w, h, (u, v) => {
    const i = Math.min(samples.length - 1, Math.floor(u * samples.length));
    const inGap = gap && (u * samples.length) % 1 > 1 - gap;
    return !inGap && 1 - v <= samples[i] ? 1 : 0;
  });

export const smoothstep = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a || 1)));
  return t * t * (3 - 2 * t);
};

export const mul = (a, b) => makeField(a.width, a.height, (_u, _v, x, y) => a.data[y * a.width + x] * b.data[y * b.width + x]);
export const add = (a, b) => makeField(a.width, a.height, (_u, _v, x, y) => a.data[y * a.width + x] + b.data[y * b.width + x]);
export const mix = (a, b, t) => makeField(a.width, a.height, (_u, _v, x, y) => a.data[y * a.width + x] * (1 - t) + b.data[y * b.width + x] * t);
export const invert = (a) => makeField(a.width, a.height, (_u, _v, x, y) => 1 - a.data[y * a.width + x]);

// Edge fade: multiply by a mask that is 1 in the middle and falls to 0 at the borders (a soft vignette).
export const vignette = (w, h, { inner = 0.5, outer = 1 } = {}) =>
  makeField(w, h, (u, v) => 1 - smoothstep(inner, outer, Math.hypot((u - 0.5) * 2, (v - 0.5) * 2)));
