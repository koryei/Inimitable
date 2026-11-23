import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { feel } from '../evals/feel.mjs';
import { scaffold } from '../scripts/scaffold.mjs';
import { findChrome } from '../scripts/lib/chrome.mjs';

const skip = findChrome() ? false : 'no Chrome installed';

test('a correct but dead page scores low, the starter scores high', { skip }, async () => {
  const dead = await feel(fileURLToPath(new URL('./fixtures/clean.html', import.meta.url)));
  assert.ok(dead.score < 40, `dead page scored ${dead.score}`);
  assert.equal(dead.entrance, 0);
  assert.equal(dead.scroll, 0);
  const dir = mkdtempSync(join(tmpdir(), 'feel-'));
  scaffold(dir, { theme: 'dark', palette: 'midnight' });
  const live = await feel(join(dir, 'index.html'));
  assert.ok(live.score >= 75, `starter scored ${live.score}: ${JSON.stringify(live.points)}`);
  assert.ok(live.entrance >= 8, `${live.entrance} elements arrive on load`);
  assert.ok(live.scroll >= 10, `${live.scroll} elements move on scroll`);
  assert.ok(live.answerShare >= 0.95);
  assert.equal(live.loopsReduced, 0);
}, { timeout: 120000 });
