import assert from 'node:assert/strict';
import { test } from 'node:test';
import { FLATS, FLAT_NAMES, contrast, flatGroundCss, flatThemeCss, flatTokens, mixHex } from './flat.mjs';

test('contrast matches the known values', () => {
  assert.ok(Math.abs(contrast('#000000', '#ffffff') - 21) < 0.01);
  assert.ok(Math.abs(contrast('#777777', '#ffffff') - 4.48) < 0.05);
  assert.equal(mixHex('#ffffff', '#000000', 0.5), '#808080');
});

for (const tone of FLAT_NAMES) {
  test(`${tone}: every text colour passes on the ground and on the card, and so do the accent and the panel`, () => {
    const t = flatTokens(tone);
    for (const [name, c] of [['ink', t.ink], ['ink-2', t.ink2], ['ink-3', t.ink3]]) {
      assert.ok(contrast(c, t.bg) >= 4.5, `${name} on the ground: ${contrast(c, t.bg).toFixed(2)}`);
      assert.ok(contrast(c, t.surfaceHex) >= 4.5, `${name} on the card: ${contrast(c, t.surfaceHex).toFixed(2)}`);
    }
    assert.ok(contrast(t.accent, t.bg) >= 4.5, `accent as text on the ground: ${contrast(t.accent, t.bg).toFixed(2)}`);
    assert.ok(contrast(t.onAccent, t.accent) >= 4.5, 'text on an accent fill');
    const f = FLATS[tone];
    assert.ok(contrast('#f3f1ec', t.panel) >= 12, 'light text on the panel');
    assert.ok(contrast('#a8a49b', t.panel) >= 4.5, 'tinted text on the panel');
    assert.ok(contrast(f.panelAccent, t.panel) >= 4.5, 'the accent on the panel');
    assert.ok(contrast('#0b0a0f', f.panelAccent) >= 4.5, 'text on the accent fill inside the panel');
  });
}

test('the theme writes every token the starter uses, and the panel set', () => {
  const css = flatThemeCss({ tone: 'cobalt' });
  for (const v of ['--bg', '--ink', '--ink-2', '--ink-3', '--line', '--line-strong', '--surface', '--accent', '--on-accent', '--radius', '--panel', '--panel-ink', '--panel-surface']) assert.match(css, new RegExp(`${v}:`));
  assert.match(css, /color-scheme: dark/);
  assert.match(flatThemeCss({ tone: 'sand' }), /color-scheme: light/);
  assert.throws(() => flatTokens('plum'), /cobalt, mint, sand/);
});

test('flat keeps the hero in the tone and the closing call in the panel; frame puts the hero in the panel', () => {
  const flat = flatGroundCss({ tone: 'mint', ground: 'flat' });
  assert.match(flat, /\.closer \{ --bg: var\(--panel\)/);
  assert.doesNotMatch(flat, /\.hero \{/);
  const frame = flatGroundCss({ tone: 'sand', ground: 'frame' });
  assert.match(frame, /\.hero \{ --bg: var\(--panel\)/);
  assert.match(frame, /margin-top: 5\.25rem/);
});
