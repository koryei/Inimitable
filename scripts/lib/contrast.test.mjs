import assert from 'node:assert/strict';
import { test } from 'node:test';
import { isLarge, over, ratio, required } from './contrast.mjs';

test('black on white is 21:1', () => {
  assert.equal(Math.round(ratio([0, 0, 0], [255, 255, 255])), 21);
});

test('same colour is 1:1', () => {
  assert.equal(ratio([120, 120, 120], [120, 120, 120]), 1);
});

test('known pair: #767676 on white is about 4.54', () => {
  const r = ratio([118, 118, 118], [255, 255, 255]);
  assert.ok(r > 4.5 && r < 4.6, String(r));
});

test('alpha blends over the background', () => {
  assert.deepEqual(over([0, 0, 0, 0.5], [255, 255, 255]).map(Math.round), [128, 128, 128]);
});

test('large text needs 3:1, small needs 4.5:1', () => {
  assert.equal(required(24, 400), 3);
  assert.equal(required(19, 700), 3);
  assert.equal(required(16, 400), 4.5);
  assert.equal(isLarge(18, 400), false);
});
