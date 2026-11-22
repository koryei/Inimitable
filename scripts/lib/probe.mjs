// Code that runs inside the page. Each export is a string expression that Chrome evaluates
// and returns as plain data. Kept as strings so the same probe works over DevTools with no build step.

// Shared helpers, pasted at the top of every probe.
export const HELPERS = `
const __canvas = document.createElement('canvas');
__canvas.width = __canvas.height = 1;
const __ctx = __canvas.getContext('2d', { willReadFrequently: true });
// Any CSS colour (rgb, hsl, oklch, named...) -> [r, g, b, a] in 0..255 / 0..1
function toRGBA(value) {
  if (!value || value === 'transparent') return [0, 0, 0, 0];
  __ctx.clearRect(0, 0, 1, 1);
  __ctx.fillStyle = '#000';
  __ctx.fillStyle = value;
  __ctx.fillRect(0, 0, 1, 1);
  const d = __ctx.getImageData(0, 0, 1, 1).data;
  return [d[0], d[1], d[2], d[3] / 255];
}
function toHex(rgba) {
  return '#' + rgba.slice(0, 3).map((n) => n.toString(16).padStart(2, '0')).join('');
}
function visible(el) {
  const r = el.getBoundingClientRect();
  if (!r.width || !r.height) return false;
  const s = getComputedStyle(el);
  return s.display !== 'none' && s.visibility !== 'hidden' && parseFloat(s.opacity) > 0;
}
function ownText(el) {
  let t = '';
  for (const n of el.childNodes) if (n.nodeType === 3) t += n.nodeValue;
  return t.trim();
}
function px(v) {
  const n = parseFloat(v);
  return Number.isFinite(n) ? Math.round(n * 100) / 100 : 0;
}
function tally(map, key, n = 1) {
  map[key] = (map[key] || 0) + n;
}
function describe(el) {
  const cls = typeof el.className === 'string' && el.className.trim() ? '.' + el.className.trim().split(/\\s+/)[0] : '';
  return el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + cls;
}
`;

// Counts of the values actually in use on the page.
export const DRIFT = `(() => {
${HELPERS}
const out = { fontSizes: {}, fontWeights: {}, fontFamilies: {}, radii: {}, spacing: {}, textColors: {}, surfaceColors: {}, borderColors: {}, elements: 0, textElements: 0 };
for (const el of document.querySelectorAll('body, body *')) {
  if (!visible(el)) continue;
  const s = getComputedStyle(el);
  out.elements++;
  if (ownText(el)) {
    out.textElements++;
    tally(out.fontSizes, px(s.fontSize));
    tally(out.fontWeights, s.fontWeight);
    tally(out.fontFamilies, s.fontFamily.split(',')[0].replace(/["']/g, '').trim());
    const c = toRGBA(s.color);
    if (c[3] > 0) tally(out.textColors, toHex(c));
  }
  const bg = toRGBA(s.backgroundColor);
  if (bg[3] > 0.05) tally(out.surfaceColors, toHex(bg));
  for (const side of ['Top', 'Right', 'Bottom', 'Left']) {
    if (px(s['border' + side + 'Width']) > 0 && s['border' + side + 'Style'] !== 'none') {
      const bc = toRGBA(s['border' + side + 'Color']);
      if (bc[3] > 0) tally(out.borderColors, toHex(bc));
    }
  }
  for (const corner of ['TopLeft', 'TopRight', 'BottomRight', 'BottomLeft']) {
    const r = px(s['border' + corner + 'Radius']);
    if (r > 0) tally(out.radii, r > 999 ? 'pill' : r);
  }
  for (const prop of ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft', 'rowGap', 'columnGap']) {
    const v = px(s[prop]);
    if (v > 0) tally(out.spacing, v);
  }
  for (const prop of ['marginTop', 'marginBottom', 'marginLeft', 'marginRight']) {
    const v = px(s[prop]);
    if (v > 0) tally(out.spacing, v);
  }
}
return out;
})()`;
