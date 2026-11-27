// The frame check: pure scoring, then real pages in a browser.
import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { format, frame } from '../scripts/frame.mjs';
import { findChrome } from '../scripts/lib/chrome.mjs';
import { SAME_FRAME, WEIGHTS, judgeDevice, judgeFrames, lcs, similarity } from '../scripts/lib/frame.mjs';
import { scaffold } from '../scripts/scaffold.mjs';

const skip = findChrome() ? false : 'no Chrome installed';
const fixture = (name) => fileURLToPath(new URL(`./fixtures/${name}`, import.meta.url));
const base = { nav: 'floating-pill', composition: 'art beside', align: 'left', container: 'inset panel', sequence: ['columns', 'text', 'closing panel'], button: 'pill', headlineFont: 'sans', ground: 'tinted' };

test('the weights add to one, so a score is a share of the skeleton', () => {
  assert.ok(Math.abs(Object.values(WEIGHTS).reduce((a, b) => a + b, 0) - 1) < 1e-9);
});

test('section order is compared by what two pages share in sequence', () => {
  assert.equal(lcs(['a', 'b', 'c'], ['a', 'c']), 2);
  assert.equal(lcs(['a'], ['b']), 0);
  assert.equal(lcs([], ['b']), 0);
});

test('the same skeleton scores one, and a recolour does not make it a new one', () => {
  assert.equal(similarity(base, base).score, 1);
  assert.ok(similarity(base, { ...base, ground: 'colour' }).score >= SAME_FRAME);
  assert.ok(similarity(base, { ...base, nav: 'bar', composition: 'art behind', container: 'open', sequence: ['table', 'price'] }).score < SAME_FRAME);
});

test('pairs and starter frames at or over the threshold are reported', () => {
  const other = { ...base, nav: 'none', composition: 'type only', align: 'centred', container: 'open', sequence: ['table'] };
  const r = judgeFrames([{ label: 'a', traits: base }, { label: 'b', traits: base }, { label: 'c', traits: other }], [{ label: 'split', traits: base }]);
  assert.deepEqual(r.same.map((p) => [p.a, p.b]), [['a', 'b']]);
  assert.deepEqual(r.unchanged.map((s) => s.page), ['a', 'b']);
});

test('a material passes across three sections or down the page, and fails alone or absent', () => {
  assert.equal(judgeDevice({ rule: { sections: [0, 1, 3], coverage: 0.1 } }).pass, true);
  assert.equal(judgeDevice({ ruler: { sections: [0], coverage: 1 } }).pass, true);
  assert.equal(judgeDevice({ tick: { sections: [0, 1], coverage: 0.01 } }).pass, false);
  assert.equal(judgeDevice({ late: { sections: [1, 2, 3], coverage: 0.1 } }).pass, false);
  assert.match(judgeDevice({}).reason, /data-device/);
});

test('two pages from the landing starter share a frame, and are the starter frame', { skip }, async () => {
  const pages = ['one', 'two'].map((name, i) => {
    const dir = mkdtempSync(join(tmpdir(), `frame-${name}-`));
    scaffold(dir, { ground: 'flat', palette: i ? 'mint' : 'sand', hero: 'split', minimal: true });
    return join(dir, 'index.html');
  });
  const r = await frame(pages);
  assert.equal(r.pass, false);
  assert.equal(r.same.length, 1);
  assert.equal(r.unchanged.length, 2);
  assert.match(format(r), /SAME FRAME/);
});

test('a page with its own frame and a material down the edge passes', { skip }, async () => {
  const r = await frame([fixture('own-frame.html')]);
  assert.equal(r.pages[0].device.pass, true, JSON.stringify(r.pages[0]));
  assert.deepEqual(r.unchanged, []);
  assert.equal(r.pass, true, format(r));
});

test('one small marked element on the first screen is not a material, unless the check is turned off', { skip }, async () => {
  assert.equal((await frame([fixture('lone-device.html')], { starter: false })).pass, false);
  assert.equal((await frame([fixture('lone-device.html')], { starter: false, device: false })).pass, true);
});
