// Dot fields and halftone-style patterns, as SVG. A dot field is a quiet, honest texture; use a function
// to make it carry meaning (density follows data, a shape, or a gradient of presence).
//
//   import { dotField } from './dots.mjs';
//   dotField({ width: 600, height: 400, step: 14, radius: (x, y) => 1 + 2 * Math.sin(x / 80) ** 2 });

export function dotField({ width = 600, height = 400, step = 16, radius = () => 1.5, fill = 'currentColor', opacity = 0.35 } = {}) {
  const dots = [];
  for (let y = step / 2; y < height; y += step) {
    for (let x = step / 2; x < width; x += step) {
      const r = typeof radius === 'function' ? radius(x, y, width, height) : radius;
      if (r > 0.15) dots.push(`<circle cx="${x}" cy="${y}" r="${r.toFixed(2)}"/>`);
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" aria-hidden="true" focusable="false" fill="${fill}" style="opacity:${opacity}">${dots.join('')}</svg>`;
}

// Radius that fades from `max` at the left edge to nothing at the right: a texture that leads the eye.
export const fadeRight = (max = 3) => (x, _y, w) => max * (1 - x / w) ** 1.4;
