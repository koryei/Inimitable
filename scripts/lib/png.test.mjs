import assert from 'node:assert/strict';
import { deflateSync } from 'node:zlib';
import { test } from 'node:test';
import { decodePng, pixelAt } from './png.mjs';

// Minimal encoder for tests: RGB, 8-bit, with a chosen filter on every row.
function crc32(buf) {
  let c;
  const table = Array.from({ length: 256 }, (_, n) => { c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
  let crc = 0xffffffff;
  for (const b of buf) crc = table[(crc ^ b) & 255] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}
function encode(width, height, pixels, filter = 0) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;
  const rows = [];
  for (let y = 0; y < height; y++) {
    const row = Buffer.from(pixels.slice(y * width * 3, (y + 1) * width * 3));
    if (filter === 1) for (let x = row.length - 1; x >= 3; x--) row[x] = (row[x] - row[x - 3]) & 255; // Sub filter
    rows.push(Buffer.concat([Buffer.from([filter]), row]));
  }
  return Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(Buffer.concat(rows))), chunk('IEND', Buffer.alloc(0))]);
}

const pixels = [255, 0, 0, 0, 255, 0, 0, 0, 255, 10, 20, 30, 40, 50, 60, 70, 80, 90]; // 3 x 2
for (const filter of [0, 1]) {
  test(`decodes an RGB png with filter ${filter}`, () => {
    const image = decodePng(encode(3, 2, pixels, filter));
    assert.equal(image.width, 3);
    assert.equal(image.height, 2);
    assert.deepEqual(pixelAt(image, 1, 0), [0, 255, 0]);
    assert.deepEqual(pixelAt(image, 2, 1), [70, 80, 90]);
  });
}

test('rejects a file that is not a png', () => {
  assert.throws(() => decodePng(Buffer.from('nope nope nope')), /Not a PNG/);
});
