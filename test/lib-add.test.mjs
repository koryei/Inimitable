import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { SOURCES, add, itemUrl, list, plan, resolveItems, safeTarget } from '../scripts/lib-add.mjs';

const items = {
  'https://r.test/a.json': { name: 'a', type: 'registry:component', dependencies: ['framer-motion@^13'], registryDependencies: ['https://r.test/tokens.json', 'b'], meta: { license: 'MIT' }, files: [{ path: 'registry/a/A.tsx', target: '@components/a/A.tsx', content: 'export const A = 1;' }, { path: 'registry/a/A.css', target: '@components/a/A.css', content: '.a{}' }] },
  'https://r.test/tokens.json': { name: 'tokens', files: [{ path: 't.css', target: '@components/t.css', content: ':root{}' }] },
  'https://r.test/b.json': { name: 'b', dependencies: ['lucide-react'], files: [{ path: 'b.tsx', content: 'export const B = 2;' }] },
};
const fakeFetch = async (url) => { if (!items[url]) throw new Error(`${url} answered 404`); return items[url]; };

test('a name becomes the registry url and a full url is kept', () => {
  assert.equal(itemUrl('https://r.test/{name}.json', 'a'), 'https://r.test/a.json');
  assert.equal(itemUrl('https://r.test/{name}.json', 'https://other.test/x.json'), 'https://other.test/x.json');
});

test('registry dependencies are followed, once each', async () => {
  const resolved = await resolveItems('https://r.test/{name}.json', ['a'], fakeFetch);
  assert.deepEqual(resolved.map((r) => r.item.name).sort(), ['a', 'b', 'tokens']);
});

test('a file can never be written outside the output folder', () => {
  const out = join(tmpdir(), 'lib-out');
  assert.throws(() => safeTarget({ target: '../../etc/passwd' }, out), /outside/);
  assert.throws(() => safeTarget({ path: '../x' }, out), /outside/);
  assert.ok(safeTarget({ target: '/abs/file.tsx' }, out).startsWith(out));
  assert.ok(safeTarget({ target: '@components/bencho/x/X.tsx' }, out).endsWith(join('bencho', 'x', 'X.tsx')));
});

test('the plan lists files, packages to install and licences', async () => {
  const resolved = await resolveItems('https://r.test/{name}.json', ['a'], fakeFetch);
  const p = plan(resolved, join(tmpdir(), 'plan-out'));
  assert.equal(p.files.length, 4);
  assert.deepEqual(p.npm.sort(), ['framer-motion@^13', 'lucide-react']);
  assert.deepEqual(p.licences, ['a: MIT']);
});

test('add writes the files and a notice, and installs nothing', async () => {
  const out = mkdtempSync(join(tmpdir(), 'lib-add-'));
  const result = await add({ registry: 'https://r.test/{name}.json', names: ['a'], out, fetchJson: fakeFetch, now: () => new Date('2026-11-22T00:00:00Z') });
  assert.equal(readFileSync(join(out, 'a', 'A.tsx'), 'utf8'), 'export const A = 1;');
  const notice = readFileSync(join(out, 'NOTICE-registry.md'), 'utf8');
  assert.match(notice, /Licence:/);
  assert.match(notice, /2026-11-22: a, tokens, b/);
  assert.ok(result.npm.includes('framer-motion@^13'));
});

test('a dry run writes nothing', async () => {
  const out = mkdtempSync(join(tmpdir(), 'lib-dry-'));
  await add({ registry: 'https://r.test/{name}.json', names: ['a'], out, fetchJson: fakeFetch, dryRun: true });
  assert.throws(() => readFileSync(join(out, 'a', 'A.tsx')), /ENOENT/);
});

test('an unknown source and a missing item are plain errors', async () => {
  await assert.rejects(add({ source: 'nope', names: ['a'], fetchJson: fakeFetch }), /Unknown source/);
  await assert.rejects(add({ registry: 'https://r.test/{name}.json', names: ['zzz'], out: tmpdir(), fetchJson: fakeFetch }), /404/);
});

test('list reads either an array or an items field', async () => {
  const rows = await list('bencho', async () => ({ items: [{ name: 'x', description: 'An x' }] }));
  assert.deepEqual(rows, [{ name: 'x', title: undefined, description: 'An x', type: undefined }]);
});

test('every known source names its licence and what it needs', () => {
  for (const [name, s] of Object.entries(SOURCES)) { assert.ok(s.licence.length > 20, name); assert.ok(s.needs, name); assert.match(s.registry, /\{name\}/, name); }
});

// Live: the real Bencho registry serves real source. Skipped when offline.
test('LIVE: the Bencho toggle and its tokens come down with their dependencies', async (t) => {
  let live;
  try { live = await fetch('https://bencho.dev/r/liq-toggle.json', { signal: AbortSignal.timeout(8000) }); } catch { return t.skip('offline'); }
  if (!live.ok) return t.skip(`bencho answered ${live.status}`);
  const out = mkdtempSync(join(tmpdir(), 'lib-live-'));
  const result = await add({ source: 'bencho', names: ['liq-toggle'], out });
  assert.ok(result.items.includes('liq-toggle') && result.items.includes('bencho-tokens'));
  assert.ok(result.files.some((f) => f.full.endsWith('Toggle.tsx') && f.bytes > 2000));
  assert.ok(result.npm.some((d) => d.startsWith('framer-motion')));
  assert.match(readFileSync(join(out, 'NOTICE-bencho.md'), 'utf8'), /MIT/);
});
