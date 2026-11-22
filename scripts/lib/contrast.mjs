// WCAG contrast maths. Colours are [r, g, b] in 0..255 unless noted.

function channel(v) {
  const c = v / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

export function luminance([r, g, b]) {
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

export function ratio(a, b) {
  const la = luminance(a);
  const lb = luminance(b);
  const [hi, lo] = la >= lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

// Lay a colour with alpha over an opaque background.
export function over([r, g, b, a], [br, bg, bb]) {
  return [r * a + br * (1 - a), g * a + bg * (1 - a), b * a + bb * (1 - a)];
}

// "Large text" in WCAG: 24 px and up, or 18.66 px and up when bold.
export function isLarge(sizePx, weight) {
  return sizePx >= 24 || (sizePx >= 18.66 && weight >= 700);
}

export function required(sizePx, weight) {
  return isLarge(sizePx, weight) ? 3 : 4.5;
}
