import assert from 'node:assert/strict';
import { test } from 'node:test';
import { score } from './score.mjs';

test('a clean page scores 100', () => {
  assert.equal(score({ tells: [], checks: [{ problems: [] }], drift: { flags: [] }, shoot: [{ sideways: false, errors: [] }] }).score, 100);
});

test('tells, problems, drift and overflow all cost points', () => {
  const result = score({
    tells: [{ tell: 'Gradient text' }, { tell: 'Gradient text' }, { tell: 'Emoji in the interface' }],
    checks: [{ problems: [{ kind: 'contrast', where: 'p' }] }, { problems: [{ kind: 'contrast', where: 'p' }] }],
    drift: { flags: ['9 font sizes'] },
    shoot: [{ sideways: true, errors: [] }],
  });
  // 2 kinds x 3 + 1 extra x .25 + 1 distinct problem x 2 + 1 flag x 2 + sideways 10 = 20.25
  assert.equal(result.score, 80);
  assert.equal(result.breakdown.tellKinds, 2);
  assert.equal(result.breakdown.checkProblems, 1);
});

test('the score never goes below zero', () => {
  const tells = Array.from({ length: 60 }, (_, i) => ({ tell: `kind ${i}` }));
  assert.equal(score({ tells }).score, 0);
});
