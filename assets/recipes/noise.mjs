// Small seeded value noise, dependency-free. Same seed, same picture.

export function rng(seed = 1) {
  let a = seed >>> 0 || 1;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const smooth = (t) => t * t * (3 - 2 * t);

// Returns noise(x, y) in 0..1, smooth, with `octaves` layers for natural detail.
export function valueNoise(seed = 1, octaves = 3) {
  const size = 256;
  const rand = rng(seed);
  const grid = Array.from({ length: size * size }, () => rand());
  const at = (x, y) => grid[((y & 255) << 8) | (x & 255)];
  const base = (x, y) => {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const tx = smooth(x - xi);
    const ty = smooth(y - yi);
    const a = at(xi, yi) * (1 - tx) + at(xi + 1, yi) * tx;
    const b = at(xi, yi + 1) * (1 - tx) + at(xi + 1, yi + 1) * tx;
    return a * (1 - ty) + b * ty;
  };
  return (x, y) => {
    let sum = 0;
    let amp = 1;
    let norm = 0;
    let f = 1;
    for (let o = 0; o < octaves; o++) {
      sum += base(x * f, y * f) * amp;
      norm += amp;
      amp *= 0.5;
      f *= 2;
    }
    return sum / norm;
  };
}
