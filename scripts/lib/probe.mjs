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
    // Code blocks have their own syntax colours and mono face: they do not count toward the page's roles.
    if (!el.closest('pre, code, kbd, samp')) {
      tally(out.fontFamilies, s.fontFamily.split(',')[0].replace(/["']/g, '').trim());
      const c = toRGBA(s.color);
      if (c[3] > 0) tally(out.textColors, toHex(c));
    }
  }
  const bg = toRGBA(s.backgroundColor);
  if (bg[3] > 0.05) tally(out.surfaceColors, toHex(bg));
  for (const side of ['Top', 'Right', 'Bottom', 'Left']) {
    if (px(s['border' + side + 'Width']) > 0 && s['border' + side + 'Style'] !== 'none') {
      const bc = toRGBA(s['border' + side + 'Color']);
      if (bc[3] > 0) tally(out.borderColors, toHex(bc) + (bc[3] < 0.995 ? '@' + Math.round(bc[3] * 100) + '%' : ''));
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
import { CLAIM_PATTERNS, GREETING_PATTERN, HYPE_WORDS, PLACEHOLDER_PATTERNS, VAGUE_BUTTON_PATTERN, VAGUE_ERROR_PATTERN } from './signs-data.mjs';

export const SIGNS = `(() => {
${HELPERS}
const HYPE = new RegExp('\\\\b(' + ${JSON.stringify(HYPE_WORDS.join('|'))} + ')', 'i');
const CLAIM = new RegExp(${JSON.stringify(CLAIM_PATTERNS.join('|'))}, 'i');
const PLACEHOLDER = new RegExp(${JSON.stringify(PLACEHOLDER_PATTERNS.join('|'))}, 'i');
const GREETING = new RegExp(${JSON.stringify(GREETING_PATTERN)}, 'i');
const VAGUE_BUTTON = new RegExp(${JSON.stringify(VAGUE_BUTTON_PATTERN)}, 'i');
const VAGUE_ERROR = new RegExp(${JSON.stringify(VAGUE_ERROR_PATTERN)}, 'i');
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
    if ((el.tagName === 'BUTTON' || el.getAttribute('role') === 'button' || el.matches('a.button, a.btn')) && VAGUE_BUTTON.test(text.replace(/[.!]+$/, ''))) add('Vague button label', el, text);
    if (VAGUE_ERROR.test(text)) add('Vague error message', el, text);
    if ((heading || el.tagName === 'BUTTON' || el.tagName === 'LABEL') && /\\.$/.test(text) && text.split(/\\s+/).length <= 12 && !/\\.\\s+\\S/.test(text)) add('Trailing period on a label', el, text);
    if (/^(new|beta|pro|introducing)\\b/i.test(text.replace(/^[^\\p{L}]+/u, '')) && text.length < 40 && (px(s.borderTopLeftRadius) >= 8 || EMOJI.test(text))) add('Badge above or beside content', el, text);
    if (s.fontStyle === 'italic' && /^(EM|I)$/.test(el.tagName) && !el.closest('blockquote, cite, q')) add('Italic emphasis', el, text);
  }
  if (s.animationName !== 'none' && s.animationIterationCount === 'infinite' && !isLive(el)) add('Looping animation', el, s.animationName);
  if (s.transitionProperty === 'all' && parseFloat(s.transitionDuration) > 0) add('transition: all', el, s.transitionDuration);
}
return found;
})()`;

// Raw material for contrast, target-size and naming checks. Judged in Node (see check.mjs).
export const CHECK = `(() => {
${HELPERS}
const root = document.documentElement;
function backdrop(el) {
  // Find what is really behind the text: hit-test the stack of elements under the text's centre,
  // so a coloured sibling or a positioned panel behind it counts, not just the ancestors.
  const layers = [];
  let unknown = false;
  const r = el.getBoundingClientRect();
  const inView = r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth;
  let stack = [];
  if (inView) {
    const cx = Math.min(innerWidth - 1, Math.max(0, r.left + Math.min(r.width / 2, 40)));
    const cy = Math.min(innerHeight - 1, Math.max(0, r.top + r.height / 2));
    stack = document.elementsFromPoint(cx, cy);
  }
  const startAt = stack.indexOf(el);
  // Elements above the text (overlays) are ignored; elements from the text downwards form the backdrop.
  const chain = startAt >= 0 ? stack.slice(startAt) : null;
  const nodes = chain && chain.length ? chain : (() => { const a = []; for (let n = el; n; n = n.parentElement) a.push(n); return a; })();
  for (const n of nodes) {
    const s = getComputedStyle(n);
    if (s.backgroundImage && s.backgroundImage !== 'none') unknown = true;
    const c = toRGBA(s.backgroundColor);
    if (c[3] > 0) layers.push(c);
    if (c[3] >= 1) break;
  }
  let base = [255, 255, 255];
  for (const c of layers.reverse()) base = [0, 1, 2].map((i) => c[i] * c[3] + base[i] * (1 - c[3]));
  return { rgb: base, unknown };
}
function opacityOf(el) {
  let o = 1;
  for (let n = el; n; n = n.parentElement) o *= parseFloat(getComputedStyle(n).opacity);
  return o;
}
const text = [];
const targets = [];
const names = [];
const images = [];
const interactive = 'a[href], button, input:not([type=hidden]), select, textarea, summary, [role=button], [role=link], [role=tab], [role=switch], [role=checkbox], [tabindex]:not([tabindex="-1"])';
for (const el of document.querySelectorAll('body, body *')) {
  if (el.closest('script, style, svg') || !visible(el)) continue;
  const s = getComputedStyle(el);
  const t = ownText(el);
  if (t && !el.disabled && s.visibility === 'visible') {
    const br = el.getBoundingClientRect();
    if (br.bottom < 0 || br.top > innerHeight) { el.scrollIntoView({ block: 'center', inline: 'nearest' }); }
    const bd = backdrop(el);
    const fg = toRGBA(s.color);
    fg[3] *= opacityOf(el);
    const idx = text.length;
    el.setAttribute('data-inim-i', String(idx));
    text.push({ idx, where: describe(el), text: t.slice(0, 40), size: px(s.fontSize), weight: parseInt(s.fontWeight, 10), fg, bg: bd.rgb, unknown: bd.unknown });
  }
  if (el.matches(interactive) && !el.disabled) {
    const r = el.getBoundingClientRect();
    const inline = s.display === 'inline' && el.tagName === 'A' && !!el.closest('p, li, dd, blockquote');
    targets.push({ where: describe(el), width: Math.round(r.width), height: Math.round(r.height), inline, label: (el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 30) });
    const hasName = (el.textContent || '').trim() || el.getAttribute('aria-label') || el.getAttribute('aria-labelledby') || el.getAttribute('title') || el.querySelector('img[alt]:not([alt=""])') || (el.labels && el.labels.length) || (el.tagName === 'INPUT' && ['submit', 'button'].includes(el.type) && el.value);
    if (!hasName) names.push({ where: describe(el), problem: 'interactive element has no accessible name' });
  }
  if (el.tagName === 'IMG' && !el.hasAttribute('alt')) names.push({ where: describe(el), problem: 'image has no alt attribute' });
  if (el.tagName === 'IMG' && !(el.hasAttribute('width') && el.hasAttribute('height')) && (s.aspectRatio === 'auto' || s.aspectRatio.startsWith('auto'))) images.push({ where: describe(el) });
}
// Focus: does focusing an interactive element change how it looks?
const focus = [];
const ring = (el) => { const s = getComputedStyle(el); return [s.outlineStyle, s.outlineWidth, s.outlineColor, s.boxShadow, s.borderTopColor, s.backgroundColor, s.textDecorationLine].join('|'); };
for (const el of [...document.querySelectorAll(interactive)].filter((e) => visible(e) && !e.disabled).slice(0, 40)) {
  const before = ring(el);
  try { el.focus({ focusVisible: true }); } catch { el.focus(); }
  const changed = document.activeElement === el && ring(el) !== before;
  const focused = document.activeElement === el;
  el.blur();
  if (focused && !changed) focus.push({ where: describe(el), label: (el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 30) });
}
return {
  text, targets, names, images, focus,
  lang: !!root.getAttribute('lang'),
  h1: [...document.querySelectorAll('h1')].filter(visible).length,
  viewport: !!document.querySelector('meta[name=viewport]'),
  sideways: root.scrollWidth > root.clientWidth + 1,
};
})()`;
