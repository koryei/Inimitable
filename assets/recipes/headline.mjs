// Headline helpers: a lighter-tint word inside a headline, and a big figure whose decimals sit back.
//
//   import { tintWord, numeral } from './headline.mjs';
//   tintWord('Smarter Financial Management', 'Financial')   // 'Smarter <span class="dim">Financial</span> Management'
//   numeral(56498.5, { prefix: '£' })                       // '<span class="num">£56,498<span class="dec">.50</span></span>'
//
// Why they work: one headline in one size can still have two levels. A tint step on one word says which word is the
// subject and which is the frame, without a second size or a second colour. In a big figure the whole part is the
// message and the decimals are precision: set them back and the number reads at a glance and still tells the truth.
// The classes (.dim, .num, .dec) are in the landing starter's CSS and use its --ink-3 token, so the tint is always
// a text colour that passes contrast on the page's ground. Do not invent a new tint.

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Wrap the first occurrence of each word (or phrase) in the lighter tint. Throws if a word is not in the text:
// a headline that changed should not silently lose its emphasis.
export function tintWord(text, words) {
  let html = esc(text);
  for (const word of [].concat(words)) {
    const w = esc(word);
    const at = html.indexOf(w);
    if (at < 0) throw new Error(`"${word}" is not in "${text}".`);
    html = `${html.slice(0, at)}<span class="dim">${w}</span>${html.slice(at + w.length)}`;
  }
  return html;
}

// A figure with grey decimals and tabular digits. `decimals` places are shown even when zero (50 pence is ".50", not ".5").
export function numeral(value, { decimals = 2, prefix = '', suffix = '', locale = 'en-GB' } = {}) {
  if (!Number.isFinite(value)) throw new Error('numeral needs a finite number.');
  const parts = new Intl.NumberFormat(locale, { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).formatToParts(Math.abs(value));
  const whole = parts.filter((p) => p.type === 'integer' || p.type === 'group').map((p) => p.value).join('');
  const dec = parts.filter((p) => p.type === 'decimal' || p.type === 'fraction').map((p) => p.value).join('');
  const sign = value < 0 ? '−' : '';
  return `<span class="num">${esc(sign + prefix)}${whole}${dec ? `<span class="dec">${dec}</span>` : ''}${esc(suffix)}</span>`;
}
