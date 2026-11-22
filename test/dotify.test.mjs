import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { findChrome } from '../scripts/lib/chrome.mjs';
import { dotify } from '../scripts/dotify.mjs';

const skip = findChrome() ? false : 'no Chrome installed';

test('dotify turns a bare SVG into a dotted picture, and a bigger subject gets more dots', { skip }, async () => {
  const dir = mkdtempSync(join(tmpdir(), 'dotify-test-'));
  const small = join(dir, 'small.svg');
  const big = join(dir, 'big.svg');
  writeFileSync(small, '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" fill="#fff"/><circle cx="100" cy="100" r="20" fill="#000"/></svg>');
  writeFileSync(big, '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" fill="#fff"/><circle cx="100" cy="100" r="80" fill="#000"/></svg>');
  const a = await dotify(small, { mode: 'hex', dots: 40, cell: 6, invert: true, trim: false });
  const b = await dotify(big, { mode: 'hex', dots: 40, cell: 6, invert: true, trim: false });
  const count = (r) => (r.svg.match(/h0/g) || []).length;
  assert.ok(count(a) > 5, `small subject: ${count(a)} dots`);
  assert.ok(count(b) > count(a) * 3, `${count(b)} against ${count(a)}`);
});

test('dotify can write ascii art', { skip }, async () => {
  const dir = mkdtempSync(join(tmpdir(), 'dotify-test-'));
  const file = join(dir, 'a.svg');
  writeFileSync(file, '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="100"><rect width="200" height="100" fill="#fff"/><rect x="40" y="20" width="120" height="60" fill="#000"/></svg>');
  const r = await dotify(file, { mode: 'ascii', dots: 40, trim: false });
  assert.match(r.text, /[@%#]/);
});
