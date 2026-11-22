// Turn a brightness field (a picture, a drawn shape, a function) into a dithered, dotted, halftone or
// hex-cell image. This is how a subject becomes a "computational" hero object: the same picture,
// one consistent texture, in one or two colours.
//
//   import { fieldFromImage, orderedDither, ditherSvg } from './dither.mjs';
//   const field = fieldFromImage(decodePng(buffer));              // values 0..1, width x height
//   const grid = orderedDither(field, { levels: 1 });              // true where a dot goes
//   const svg = ditherSvg(grid, { cell: 6, fill: '#e8e6e1' });
//
// A field is { width, height, data: Float32Array } with 0 = black and 1 = white.

import { rng } from './noise.mjs';

export function fieldFromImage(image, { invert = false, contrast = 1, gamma = 1, crop } = {}) {
  const { width, height, data } = image;
  const x0 = crop?.x ?? 0;
  const y0 = crop?.y ?? 0;
  const w = crop?.w ?? width - x0;
  const h = crop?.h ?? height - y0;
  const out = new Float32Array(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = ((y0 + y) * width + (x0 + x)) * 4;
      const a = data[i + 3] / 255;
      let l = (0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]) / 255;
      l = l * a + (1 - a); // transparent pixels read as white
      l = Math.min(1, Math.max(0, (l - 0.5) * contrast + 0.5)) ** gamma;
      out[y * w + x] = invert ? 1 - l : l;
    }
  }
  return { width: w, height: h, data: out };
}

// The box around everything that differs from the background (taken from the top-left pixel).
// Use it to crop a subject out of empty space before dotting it.
export function contentBox(field, { tolerance = 0.04, margin = 2 } = {}) {
  const bg = field.data[0];
  let x0 = field.width;
  let y0 = field.height;
  let x1 = -1;
  let y1 = -1;
  for (let y = 0; y < field.height; y++) {
    for (let x = 0; x < field.width; x++) {
      if (Math.abs(field.data[y * field.width + x] - bg) > tolerance) {
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        if (y > y1) y1 = y;
      }
    }
  }
  if (x1 < 0) return { x: 0, y: 0, w: field.width, h: field.height };
  const x = Math.max(0, x0 - margin);
  const y = Math.max(0, y0 - margin);
  return { x, y, w: Math.min(field.width, x1 + margin + 1) - x, h: Math.min(field.height, y1 + margin + 1) - y };
}

export function crop(field, box) {
  const out = new Float32Array(box.w * box.h);
  for (let y = 0; y < box.h; y++) for (let x = 0; x < box.w; x++) out[y * box.w + x] = field.data[(box.y + y) * field.width + box.x + x];
  return { width: box.w, height: box.h, data: out };
}

// Box-average a field down to fewer cells, so a big picture becomes a coarse grid of values.
export function downsample(field, cell) {
  const w = Math.max(1, Math.floor(field.width / cell));
  const h = Math.max(1, Math.floor(field.height / cell));
  const out = new Float32Array(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let sum = 0;
      let n = 0;
      for (let dy = 0; dy < cell; dy++) {
        for (let dx = 0; dx < cell; dx++) {
          sum += field.data[(y * cell + dy) * field.width + (x * cell + dx)];
          n++;
        }
      }
      out[y * w + x] = sum / n;
    }
  }
  return { width: w, height: h, data: out };
}

export function bayer(n = 4) {
  if (n === 1) return [[0]];
  const prev = bayer(n / 2);
  const size = n;
  const m = Array.from({ length: size }, () => Array(size).fill(0));
  for (let y = 0; y < n / 2; y++) {
    for (let x = 0; x < n / 2; x++) {
      const v = prev[y][x] * 4;
      m[y][x] = v;
      m[y][x + n / 2] = v + 2;
      m[y + n / 2][x] = v + 3;
      m[y + n / 2][x + n / 2] = v + 1;
    }
  }
  return m;
}

// Ordered (Bayer) dithering: a regular, graphic pattern. Returns a boolean grid, true where the cell is lit.
// `threshold` shifts the overall density; `matrix` is 2, 4 or 8.
export function orderedDither(field, { matrix = 4, threshold = 0 } = {}) {
  const m = bayer(matrix);
  const n = matrix;
  const max = n * n;
  const grid = new Uint8Array(field.width * field.height);
  for (let y = 0; y < field.height; y++) {
    for (let x = 0; x < field.width; x++) {
      const t = (m[y % n][x % n] + 0.5) / max;
      grid[y * field.width + x] = field.data[y * field.width + x] + threshold > t ? 1 : 0;
    }
  }
  return { width: field.width, height: field.height, data: grid };
}

// Floyd-Steinberg error diffusion: an organic, grainy pattern that keeps detail in faces and edges.
export function floydSteinberg(field, { threshold = 0.5 } = {}) {
  const w = field.width;
  const h = field.height;
  const buf = Float32Array.from(field.data);
  const grid = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      const old = buf[i];
      const val = old >= threshold ? 1 : 0;
      grid[i] = val;
      const err = old - val;
      if (x + 1 < w) buf[i + 1] += (err * 7) / 16;
      if (y + 1 < h) {
        if (x > 0) buf[i + w - 1] += (err * 3) / 16;
        buf[i + w] += (err * 5) / 16;
        if (x + 1 < w) buf[i + w + 1] += err / 16;
      }
    }
  }
  return { width: w, height: h, data: grid };
}

// White-noise stipple: random, like a spray of dots. Seeded so the same picture always gives the same dots.
export function stipple(field, { seed = 1 } = {}) {
  const rand = rng(seed);
  const grid = new Uint8Array(field.width * field.height);
  for (let i = 0; i < grid.length; i++) grid[i] = field.data[i] > rand() ? 1 : 0;
  return { width: field.width, height: field.height, data: grid };
}

// Lit cells as one compact path of merged horizontal runs. `lit` chooses which value draws (true for lit cells).
export function ditherPath(grid, { cell = 6, gap = 0, lit = 1 } = {}) {
  const parts = [];
  const size = cell - gap;
  for (let y = 0; y < grid.height; y++) {
    let x = 0;
    while (x < grid.width) {
      if (grid.data[y * grid.width + x] === lit) {
        let run = 1;
        while (x + run < grid.width && grid.data[y * grid.width + x + run] === lit) run++;
        parts.push(`M${x * cell} ${y * cell}h${run * cell - gap}v${size}h${-(run * cell - gap)}z`);
        x += run;
      } else x++;
    }
  }
  return parts.join('');
}

export function ditherSvg(grid, { cell = 6, gap = 0, fill = 'currentColor', background, lit = 1, label } = {}) {
  const w = grid.width * cell;
  const h = grid.height * cell;
  const bg = background ? `<rect width="${w}" height="${h}" fill="${background}"/>` : '';
  const title = label ? `<title>${label}</title>` : '';
  const a11y = label ? 'role="img"' : 'aria-hidden="true" focusable="false"';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" ${a11y}>${title}${bg}<path d="${ditherPath(grid, { cell, gap, lit })}" fill="${fill}"/></svg>`;
}

// Dots whose size follows brightness, on a straight or rotated grid: a classic halftone screen.
export function halftoneSvg(field, { cell = 8, maxRadius, angle = 0, fill = 'currentColor', background, hex = false, invert = false, minRadius = 0.35, scale = 1 } = {}) {
  // `scale` is how many output pixels one field cell covers: use the downsampling factor's inverse so a
  // coarse field still draws at full size. `cell` is the dot pitch in output pixels.
  const r = maxRadius ?? cell * 0.5;
  const fw = field.width;
  const fh = field.height;
  const w = fw * scale;
  const h = fh * scale;
  const sample = (x, y) => {
    const xi = Math.min(fw - 1, Math.max(0, Math.floor(x / scale)));
    const yi = Math.min(fh - 1, Math.max(0, Math.floor(y / scale)));
    return field.data[yi * fw + xi];
  };
  const cos = Math.cos((angle * Math.PI) / 180);
  const sin = Math.sin((angle * Math.PI) / 180);
  const dots = [];
  const stepY = hex ? cell * 0.866 : cell;
  const diag = Math.hypot(w, h);
  for (let j = -Math.ceil(diag / stepY); j <= Math.ceil(diag / stepY); j++) {
    for (let i = -Math.ceil(diag / cell); i <= Math.ceil(diag / cell); i++) {
      const gx = i * cell + (hex && j % 2 ? cell / 2 : 0);
      const gy = j * stepY;
      const x = w / 2 + gx * cos - gy * sin;
      const y = h / 2 + gx * sin + gy * cos;
      if (x < 0 || y < 0 || x >= w || y >= h) continue;
      const v = invert ? sample(x, y) : 1 - sample(x, y);
      const rad = v * r;
      if (rad >= minRadius) dots.push(`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${rad.toFixed(2)}"/>`);
    }
  }
  const bg = background ? `<rect width="${w}" height="${h}" fill="${background}"/>` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" aria-hidden="true" focusable="false">${bg}<g fill="${fill}">${dots.join('')}</g></svg>`;
}

// The field as text characters, dark to light along `ramp`. Returns an array of lines.
export function asciiLines(field, { cell = 8, ramp = ' .:-=+*#%@', invert = false, aspect = 2 } = {}) {
  const cw = cell;
  const ch = cell * aspect;
  const cols = Math.floor(field.width / cw);
  const rows = Math.floor(field.height / ch);
  const lines = [];
  for (let y = 0; y < rows; y++) {
    let line = '';
    for (let x = 0; x < cols; x++) {
      let sum = 0;
      let n = 0;
      for (let dy = 0; dy < ch; dy++) {
        for (let dx = 0; dx < cw; dx++) {
          sum += field.data[Math.floor(y * ch + dy) * field.width + (x * cw + dx)];
          n++;
        }
      }
      const v = invert ? sum / n : 1 - sum / n;
      line += ramp[Math.min(ramp.length - 1, Math.floor(v * ramp.length))];
    }
    lines.push(line);
  }
  return lines;
}

export function lit(grid) {
  let n = 0;
  for (const v of grid.data) n += v;
  return n / grid.data.length;
}
