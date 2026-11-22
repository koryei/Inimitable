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

// Machine-made tells found in the rendered page. Returns [{ tell, where, detail }].
import { CLAIM_PATTERNS, GREETING_PATTERN, HYPE_WORDS, PLACEHOLDER_PATTERNS } from './signs-data.mjs';

export const SIGNS = `(() => {
${HELPERS}
const HYPE = new RegExp('\\\\b(' + ${JSON.stringify(HYPE_WORDS.join('|'))} + ')', 'i');
const CLAIM = new RegExp(${JSON.stringify(CLAIM_PATTERNS.join('|'))}, 'i');
const PLACEHOLDER = new RegExp(${JSON.stringify(PLACEHOLDER_PATTERNS.join('|'))}, 'i');
const GREETING = new RegExp(${JSON.stringify(GREETING_PATTERN)}, 'i');
const EMOJI = /\\p{Extended_Pictographic}/u;
const found = [];
const add = (tell, el, detail) => found.push({ tell, where: describe(el), detail: String(detail).slice(0, 90) });
function hue(rgba) {
  const [r, g, b] = rgba.slice(0, 3).map((v) => v / 255);
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
  if (d < 0.12) return null;
  let h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return ((h * 60) + 360) % 360;
}
function colourStops(value) {
  return (value.match(/(rgba?\\([^)]*\\)|color\\([^)]*\\)|oklch\\([^)]*\\)|oklab\\([^)]*\\)|lab\\([^)]*\\)|hsla?\\([^)]*\\))/g) || []).map(toRGBA);
}
function isHueGradient(value) {
  const hues = colourStops(value).map((c) => (c[3] > 0.05 ? hue(c) : null)).filter((h) => h !== null);
  if (hues.length < 2) return false;
  return hues.some((h) => { const diff = Math.abs(h - hues[0]); return Math.min(diff, 360 - diff) > 25; });
}
function skip(el) {
  return !!el.closest('script, style, code, pre, textarea, [contenteditable], svg, [data-brand]');
}
function isLive(el) {
  return !!el.closest('[data-live], [aria-busy="true"], [role="progressbar"], [role="status"]');
}
for (const el of document.querySelectorAll('body, body *')) {
  if (skip(el) || !visible(el)) continue;
  const s = getComputedStyle(el);
  const text = ownText(el);
  const size = px(s.fontSize);
  const weight = parseInt(s.fontWeight, 10);
  const heading = /^H[1-6]$/.test(el.tagName);

  if (s.backgroundImage && s.backgroundImage.includes('gradient')) {
    if (s.webkitBackgroundClip === 'text' || s.backgroundClip === 'text') add('Gradient text', el, s.backgroundImage);
    else if (isHueGradient(s.backgroundImage)) add('Hue-to-hue gradient', el, s.backgroundImage);
  }
  if (s.boxShadow && s.boxShadow !== 'none') {
    for (const part of s.boxShadow.split(/,(?![^(]*\\))/)) {
      const nums = (part.match(/-?[\\d.]+px/g) || []).map(px);
      const blur = nums[2] || 0;
      const colour = colourStops(part)[0];
      if (colour && hue(colour) !== null && colour[3] > 0.08 && blur >= 8) { add('Coloured glow', el, part.trim()); break; }
    }
  }
  if (s.textShadow && s.textShadow !== 'none') {
    const colour = colourStops(s.textShadow)[0];
    if (colour && hue(colour) !== null) add('Coloured glow', el, 'text-shadow ' + s.textShadow);
  }
  if (s.filter && /drop-shadow\\(/.test(s.filter)) {
    const colour = colourStops(s.filter)[0];
    if (colour && hue(colour) !== null) add('Coloured glow', el, s.filter);
  }
  if (text) {
    if ((heading || size >= 24) && weight >= 800) add('Heavy heading', el, 'weight ' + weight + ': ' + text);
    if (s.textTransform === 'uppercase' && size < 16 && px(s.letterSpacing) / size > 0.04 && text.length > 3) add('Uppercase tracked label', el, text);
    if (size < 16 && px(s.letterSpacing) < 0) add('Negative tracking on small text', el, 'letter-spacing ' + s.letterSpacing);
    if (EMOJI.test(text)) add('Emoji in the interface', el, text);
    if (/!/.test(text) && !/!=|!\\w+\\(/.test(text)) add('Exclamation mark', el, text);
    if (HYPE.test(text)) add('Hype word', el, text);
    if (CLAIM.test(text)) add('Unverified claim', el, text);
    if (PLACEHOLDER.test(text)) add('Placeholder content', el, text);
    if (heading && GREETING.test(text)) add('Greeting headline', el, text);
    if ((heading || el.tagName === 'BUTTON' || el.tagName === 'LABEL') && /\\.$/.test(text) && text.split(/\\s+/).length <= 12 && !/\\.\\s+\\S/.test(text)) add('Trailing period on a label', el, text);
    if (/^(new|beta|pro|introducing)\\b/i.test(text.replace(/^[^\\p{L}]+/u, '')) && text.length < 40 && (px(s.borderTopLeftRadius) >= 8 || EMOJI.test(text))) add('Badge above or beside content', el, text);
    if (s.fontStyle === 'italic' && /^(EM|I)$/.test(el.tagName) && !el.closest('blockquote, cite, q')) add('Italic emphasis', el, text);
  }
  if (s.animationName !== 'none' && s.animationIterationCount === 'infinite' && !isLive(el)) add('Looping animation', el, s.animationName);
  if (s.transitionProperty === 'all' && parseFloat(s.transitionDuration) > 0) add('transition: all', el, s.transitionDuration);
}
return found;
})()`;
