import assert from 'node:assert/strict';
import { test } from 'node:test';
import { PAINT_CAP, PALETTES, SHAPE_NAMES, audit, fromAccent, grainient, hexToHsl, motes, paintiness } from './mesh.mjs';

test('every built-in palette passes its own audit', () => {
  for (const [name, p] of Object.entries(PALETTES)) assert.deepEqual(audit(p), [], name);
});

test('a loud accent is pulled back to a light-not-paint ground', () => {
  for (const hex of ['#ff00ff', '#00ff00', '#ff3300', '#0033ff']) {
    const p = fromAccent(hex);
    for (const c of [...p.family, p.counter]) assert.ok(paintiness(c) <= PAINT_CAP.light + 0.001, `${hex} -> ${c} ${paintiness(c)}`);
    const dark = fromAccent(hex, { dark: true });
    for (const c of [...dark.family, dark.counter]) assert.ok(paintiness(c) <= PAINT_CAP.dark + 0.001, `dark ${hex} -> ${c}`);
    assert.deepEqual(audit(p), [], hex);
  }
});

test('the counterpoint sits roughly opposite the family', () => {
  const p = fromAccent('#e8742c');
  const fam = hexToHsl(p.family[0]).h;
  const apart = Math.abs(((hexToHsl(p.counter).h - fam + 540) % 360) - 180);
  assert.ok(Math.abs(apart - 180) < 40, `counterpoint is ${apart} degrees from the family, expected about 180`);
});

test('the audit flags a rainbow', () => {
  const rainbow = { family: ['#ff4d4d', '#4dff4d', '#4d4dff', '#ffff4d'], counter: '#ff4dff', base: '#fff' };
  assert.ok(audit(rainbow).length >= 1);
});

test('the same seed gives the same ground and another seed differs', () => {
  const a = grainient({ palette: 'ember', shape: 'pools', seed: 3 }).css;
  assert.equal(a, grainient({ palette: 'ember', shape: 'pools', seed: 3 }).css);
  assert.notEqual(a, grainient({ palette: 'ember', shape: 'pools', seed: 4 }).css);
});

test('every shape builds a ground with grain, a base colour and (by default) a mask', () => {
  for (const shape of SHAPE_NAMES) {
    const { css, layers } = grainient({ palette: 'dusk', shape });
    assert.ok(layers.length >= 3, shape);
    assert.match(css, /mix-blend-mode: screen/, `${shape}: dark grounds use screen grain`);
    assert.match(css, /mask-image/);
    assert.match(css, /#0c0814/);
  }
  assert.match(grainient({ palette: 'ember' }).css, /mix-blend-mode: multiply/);
});

test('grain strength maps to a small, bounded opacity', () => {
  const op = (g) => Number(grainient({ grain: g }).css.match(/opacity: ([\d.]+)/)[1]);
  assert.ok(op(0) >= 0.04 && op(1) <= 0.22 && op(1) > op(0));
});

test('an unknown palette or shape throws a helpful error', () => {
  assert.throws(() => grainient({ palette: 'nope' }), /Unknown palette/);
  assert.throws(() => grainient({ shape: 'nope' }), /Unknown shape/);
});

test('mask none leaves no mask and drift adds the slow animation', () => {
  assert.doesNotMatch(grainient({ mask: 'none' }).css, /mask-image/);
  assert.match(grainient({ drift: true }).css, /m-drift/);
});

test('a dark bowl and horizon carry a luminous rim, a light one does not', () => {
  assert.match(grainient({ palette: 'dusk', shape: 'bowl' }).css, /radial-gradient\(ellipse [^)]*transparent 65%/);
  assert.match(grainient({ palette: 'dusk', shape: 'horizon' }).css, /ellipse/);
  assert.doesNotMatch(grainient({ palette: 'ember', shape: 'bowl' }).css, /ellipse/);
});

test('rays put shafts of light on ::before with their own mask, and motes add specks', () => {
  const { css } = grainient({ palette: 'abyss', shape: 'rays' });
  assert.match(css, /\.ground::before \{/);
  assert.match(css, /repeating-linear-gradient/);
  assert.match(css, /mask-image: linear-gradient\(to bottom/);
  const speckled = grainient({ palette: 'abyss', shape: 'pools', withMotes: true }).css;
  assert.equal((speckled.match(/radial-gradient\(circle at/g) || []).length, 46);
  assert.doesNotMatch(grainient({ palette: 'abyss', shape: 'pools' }).css, /::before/);
});

test('contour draws its lines as an inline SVG on ::before, deterministic per seed, with no raw # or quotes in the URL', () => {
  const a = grainient({ palette: 'ember', shape: 'contour', seed: 3 }).css;
  assert.match(a, /\.ground::before \{/);
  assert.match(a, /url\("data:image\/svg\+xml,%3Csvg/);
  const url = a.match(/url\("([^"]+)"\)/)[1];
  assert.doesNotMatch(url, /[#<>]/);
  assert.equal(a, grainient({ palette: 'ember', shape: 'contour', seed: 3 }).css);
  assert.notEqual(a, grainient({ palette: 'ember', shape: 'contour', seed: 4 }).css);
  assert.ok((a.match(/%3Cpath/g) || []).length >= 12, 'a dozen or more contour rings');
});

test('motes are deterministic and few', () => {
  assert.deepEqual(motes({ seed: 3 }), motes({ seed: 3 }));
  assert.ok(motes({ count: 30 }).length === 30);
});
