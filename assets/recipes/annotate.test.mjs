import assert from 'node:assert/strict';
import { test } from 'node:test';
import { annotationCss, chip, elbow, heroDiagram, roundedPolyline } from './annotate.mjs';
import { numeral, tintWord } from './headline.mjs';

test('a chip is positioned in percent, escapes its label and can be marked as a placeholder', () => {
  const html = chip({ label: 'Cap <12 months> & more', x: 12.34, y: 40, pointer: 'br', tone: 'ink', todo: true });
  assert.match(html, /left:12.3%;top:40%/);
  assert.match(html, /data-pointer="br"/);
  assert.match(html, /data-todo/);
  assert.match(html, /Cap &lt;12 months&gt; &amp; more/);
  assert.match(html, /aria-hidden="true"/);
  assert.throws(() => chip({ x: 1, y: 1 }), /label/);
  assert.throws(() => chip({ label: 'x', x: 1, y: 1, pointer: 'up' }), /pointer/);
});

test('the chip styles cover every corner and tone, and hide on a phone', () => {
  const css = annotationCss();
  for (const p of ['tl', 'tr', 'bl', 'br']) assert.match(css, new RegExp(`data-pointer="${p}"`));
  for (const t of ['ink', 'surface']) assert.match(css, new RegExp(`data-tone="${t}"`));
  assert.match(css, /max-width: 47.99rem\) \{ \.chip \{ display: none/);
});

test('a connector turns with a rounded corner and ends where it was told to', () => {
  const d = elbow([0, 0], [100, 60], { first: 'h', radius: 10 });
  assert.match(d, /^M0 0L90 0Q100 0 100 10L100 60$/);
  const v = elbow([0, 0], [100, 60], { first: 'v', radius: 10 });
  assert.match(v, /^M0 0L0 50Q0 60 10 60L100 60$/);
  assert.equal((elbow([0, 0], [100, 60], { first: 'hvh' }).match(/Q/g) || []).length, 2);
  assert.equal(roundedPolyline([[0, 0], [10, 0]]), 'M0 0L10 0');
});

test('the radius never exceeds half the shorter leg', () => {
  assert.match(roundedPolyline([[0, 0], [6, 0], [6, 40]], 30), /L3 0Q6 0 6 3/);
});

test('the diagram is the same for a seed, decorative, flat, and every label is a placeholder', () => {
  const a = heroDiagram({ seed: 3 });
  assert.equal(a, heroDiagram({ seed: 3 }));
  assert.notEqual(a, heroDiagram({ seed: 4 }));
  assert.match(a, /aria-hidden="true"/);
  assert.doesNotMatch(a, /gradient|filter|animate/i);
  const texts = a.match(/<text[^>]*>/g);
  assert.equal(texts.length, 5);
  for (const t of texts) assert.match(t, /data-todo/);
  assert.match(heroDiagram({ labels: ['Clause', 'Redline'] }), /Clause/);
});

test('every line of the diagram stays inside the picture', () => {
  const svg = heroDiagram({ width: 1200, height: 520, card: { x: 230, y: 250, w: 740 }, seed: 7 });
  for (const d of svg.match(/ d="[^"]+"/g)) for (const [, x, y] of d.matchAll(/(-?\d+(?:\.\d)?) (-?\d+(?:\.\d)?)/g)) {
    assert.ok(Number(x) >= 0 && Number(x) <= 1200 && Number(y) >= 0 && Number(y) <= 520, `${x},${y}`);
  }
});

test('one word or phrase in a headline takes the lighter tint', () => {
  assert.equal(tintWord('Smarter Financial Management', 'Financial'), 'Smarter <span class="dim">Financial</span> Management');
  assert.equal(tintWord('The layer for <teams>', ['layer']), 'The <span class="dim">layer</span> for &lt;teams&gt;');
  assert.throws(() => tintWord('A headline', 'missing'), /not in/);
});

test('a figure puts its decimals back, keeps trailing zeros and signs a negative with a minus', () => {
  assert.equal(numeral(56498.5, { prefix: '£' }), '<span class="num">£56,498<span class="dec">.50</span></span>');
  assert.equal(numeral(1284, { decimals: 0, suffix: '%' }), '<span class="num">1,284%</span>');
  assert.match(numeral(-39, { prefix: '$' }), /^<span class="num">−\$39<span class="dec">\.00/);
  assert.throws(() => numeral(Number.NaN), /finite/);
});
