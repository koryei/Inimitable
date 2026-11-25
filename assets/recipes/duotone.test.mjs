import assert from 'node:assert/strict';
import { test } from 'node:test';
import { SUBJECTS, SUBJECT_NAMES, duotoneSvg, engraveSvg, inkShare } from './duotone.mjs';
import { makeField } from './fields.mjs';

test('every subject is a field with real paper and real ink, so it reads against its ground', () => {
  for (const name of SUBJECT_NAMES) {
    const f = SUBJECTS[name](120, 150, { seed: 2 });
    assert.equal(f.data.length, 120 * 150);
    const share = inkShare(f);
    assert.ok(share > 0.04 && share < 0.75, `${name}: ${(share * 100).toFixed(0)}% of the picture is ink`);
    let min = 1;
    let max = 0;
    for (const v of f.data) { min = Math.min(min, v); max = Math.max(max, v); }
    assert.ok(min < 0.3 && max > 0.8, `${name} spans dark to light (${min.toFixed(2)} to ${max.toFixed(2)})`);
  }
});

test('the same seed gives the same print and a different seed gives a different one', () => {
  for (const subject of ['drape', 'strata', 'vase']) {
    assert.equal(duotoneSvg({ subject, seed: 4 }), duotoneSvg({ subject, seed: 4 }));
    assert.notEqual(duotoneSvg({ subject, seed: 4 }), duotoneSvg({ subject, seed: 5 }), subject);
  }
});

test('a print has two colours and no more, in every mode', () => {
  for (const mode of ['halftone', 'lines', 'dither']) {
    const svg = duotoneSvg({ subject: 'column', mode, ink: '#1f43d6', paper: '#ffffff' });
    const colours = new Set([...svg.matchAll(/(?:fill|stroke)="(#[0-9a-f]{3,8}|var\([^)]*\)|[a-z]+)"/gi)].map((m) => m[1].toLowerCase()).filter((c) => c !== 'none'));
    assert.deepEqual([...colours].sort(), ['#1f43d6', '#ffffff'], mode);
    assert.doesNotMatch(svg, /gradient|filter|opacity|<image/i, `${mode} is flat: no gradients, filters or bitmaps`);
  }
});

test('CSS variables work as the two colours, so the print follows the theme', () => {
  const svg = duotoneSvg({ subject: 'sphere', ink: 'var(--bg)', paper: 'var(--ink)' });
  assert.match(svg, /var\(--bg\)/);
  assert.match(svg, /var\(--ink\)/);
});

test('the svg fills its box, is decoration unless labelled, and stays a sensible size', () => {
  const svg = duotoneSvg({ subject: 'drape', mode: 'lines' });
  assert.match(svg, /aria-hidden="true"/);
  assert.match(svg, /preserveAspectRatio="xMidYMid slice"/);
  assert.doesNotMatch(svg, / width="\d/);
  assert.match(duotoneSvg({ subject: 'strata', label: 'A core, cut in layers' }), /role="img" aria-label="A core, cut in layers"/);
  for (const mode of ['halftone', 'lines', 'dither']) assert.ok(duotoneSvg({ subject: 'drape', mode }).length < 260 * 1024, `${mode} stays under 260 KB`);
});

test('an engraving is thicker where the picture is darker, and empty where it is paper', () => {
  const field = makeField(60, 30, (u) => (u < 0.5 ? 1 : 0.1)); // paper on the left half, ink on the right
  const svg = engraveSvg(field, { pitch: 6, step: 3, scale: 1, ink: '#000' });
  const first = svg.match(/<path d="M([^"]+)"/)[1];
  const xs = [...first.matchAll(/(\d+) -?[\d.]+/g)].map((m) => Number(m[1]));
  assert.ok(Math.min(...xs) >= 30, 'the paper side draws nothing');
  assert.ok(Math.max(...xs) >= 50, 'the ink side draws lines');
});

test('your own field works instead of a subject, and a wrong subject says what is available', () => {
  const field = makeField(40, 40, (u, v) => (Math.hypot(u - 0.5, v - 0.5) < 0.3 ? 0.1 : 1));
  assert.match(duotoneSvg({ field, mode: 'halftone', width: 200, height: 200 }), /<svg/);
  assert.throws(() => duotoneSvg({ subject: 'unicorn' }), /column, vase, sphere, drape, strata/);
});
