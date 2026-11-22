import assert from 'node:assert/strict';
import { test } from 'node:test';
import { Terminal, cellWidth } from './vt.mjs';

test('prints text and newlines', () => {
  const t = new Terminal(20, 5);
  t.write('hello\r\nworld');
  assert.equal(t.text(), 'hello\nworld');
});

test('carriage return overwrites', () => {
  const t = new Terminal(20, 5);
  t.write('abcdef\rXY');
  assert.equal(t.text(), 'XYcdef');
});

test('erase line and cursor up redraw (spinner style)', () => {
  const t = new Terminal(20, 5);
  t.write('working...\r\n');
  t.write('\x1b[1A\x1b[2K\r✓ done\r\n');
  assert.equal(t.text(), '✓ done');
});

test('long lines wrap and are counted', () => {
  const t = new Terminal(10, 5);
  t.write('abcdefghijklmno');
  assert.equal(t.text(), 'abcdefghij\nklmno');
  assert.equal(t.wrapped, 1);
});

test('colours are recorded and stripped from text', () => {
  const t = new Terminal(20, 5);
  t.write('\x1b[32mok\x1b[0m plain');
  assert.equal(t.text(), 'ok plain');
  assert.equal(Object.keys(t.colours()).length, 1);
  assert.match(t.html(), /color:#b5bd68/);
});

test('256 and true colour', () => {
  const t = new Terminal(20, 5);
  t.write('\x1b[38;5;196mA\x1b[38;2;1;2;3mB');
  assert.equal(Object.keys(t.colours()).length, 2);
});

test('scrolling keeps scrollback', () => {
  const t = new Terminal(10, 2);
  t.write('1\r\n2\r\n3\r\n4');
  assert.equal(t.text(), '1\n2\n3\n4');
});

test('cursor addressing', () => {
  const t = new Terminal(10, 3);
  t.write('\x1b[2;3Hx');
  assert.equal(t.text(), '\n  x');
});

test('wide characters take two cells', () => {
  assert.equal(cellWidth('漢'.codePointAt(0)), 2);
  assert.equal(cellWidth('a'.codePointAt(0)), 1);
  const t = new Terminal(10, 2);
  t.write('漢a');
  assert.equal(t.x, 3);
});
