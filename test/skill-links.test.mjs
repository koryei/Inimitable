// A skill is prose plus links, and a broken link is invisible until an agent follows it mid-run.
// These checks keep every reference file reachable from SKILL.md and every relative link resolving.
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const root = fileURLToPath(new URL('..', import.meta.url));
const skill = readFileSync(join(root, 'SKILL.md'), 'utf8');

function markdownFiles(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...markdownFiles(path));
    else if (entry.name.endsWith('.md')) out.push(path);
  }
  return out;
}

const references = markdownFiles(join(root, 'references'));

// Relative links only: skip http(s), mailto and bare anchors.
function links(text) {
  return [...text.matchAll(/\[[^\]]*\]\(([^)\s]+)\)/g)]
    .map((m) => m[1])
    .filter((href) => !/^(https?:|mailto:|#)/.test(href));
}

test('every reference file is reachable from SKILL.md by following links', () => {
  // Reachability, not direct linking: the repair layers hang off fix.md, which SKILL.md names.
  const seen = new Set();
  const queue = [join(root, 'SKILL.md')];
  while (queue.length) {
    const file = queue.pop();
    if (seen.has(file) || !existsSync(file)) continue;
    seen.add(file);
    if (!file.endsWith('.md')) continue;
    for (const href of links(readFileSync(file, 'utf8'))) queue.push(resolve(dirname(file), href));
  }
  const orphans = references.filter((path) => !seen.has(path)).map((path) => relative(root, path));
  assert.deepEqual(orphans, [], `not reachable from SKILL.md: ${orphans.join(', ')}`);
});

test('every relative link in SKILL.md and the references resolves', () => {
  const broken = [];
  for (const file of [join(root, 'SKILL.md'), ...references]) {
    for (const href of links(readFileSync(file, 'utf8'))) {
      const target = resolve(dirname(file), href);
      if (!existsSync(target)) broken.push(`${relative(root, file)} -> ${href}`);
    }
  }
  assert.deepEqual(broken, [], `broken links: ${broken.join(', ')}`);
});

test('every reference file opens with a level-one heading', () => {
  const missing = references
    .filter((path) => !readFileSync(path, 'utf8').startsWith('# '))
    .map((path) => relative(root, path));
  assert.deepEqual(missing, [], `no "# " heading: ${missing.join(', ')}`);
});

test('the run table names a file for every step', () => {
  const rows = skill.split('\n').filter((line) => /^\| \d+ \|/.test(line));
  assert.equal(rows.length, 9, `${rows.length} steps in the run table`);
  for (const row of rows) {
    assert.match(row, /\]\(references\/|\.md\)/, `step has no file to read: ${row}`);
  }
});
