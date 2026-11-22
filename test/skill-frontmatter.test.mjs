// The skills CLI (npx skills add) parses SKILL.md with a strict YAML parser. A description with ": " in it
// breaks the whole listing, so keep it a block scalar, and check the rules the CLI and agents rely on.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const text = readFileSync(new URL('../SKILL.md', import.meta.url), 'utf8');
const match = text.match(/^---\n([\s\S]*?)\n---\n/);
const lines = match ? match[1].split('\n') : [];

function field(name) {
  const i = lines.findIndex((l) => l.startsWith(`${name}:`));
  if (i < 0) return null;
  const first = lines[i].slice(name.length + 1).trim();
  if (/^[>|][+-]?$/.test(first)) {
    const body = [];
    for (let j = i + 1; j < lines.length && /^\s+\S/.test(lines[j]); j++) body.push(lines[j].trim());
    return { block: true, value: body.join(' ') };
  }
  return { block: false, value: first };
}

test('SKILL.md has frontmatter with a name and a description', () => {
  assert.ok(match, 'frontmatter is missing');
  assert.equal(field('name')?.value, 'inimitable');
  assert.ok(field('description')?.value.length > 100);
});

test('the description is safe for a strict YAML parser', () => {
  const d = field('description');
  assert.ok(d.block || (/^".*"$/.test(d.value) && !/(?<!\\)"[^"]*(?<!\\)"[^"]*"/.test(d.value.slice(1, -1).replace(/\\"/g, ''))), 'use a block scalar (>-) or a fully quoted string');
  if (!d.block) assert.ok(!/: /.test(d.value.slice(1, -1)) || /^".*"$/.test(d.value));
});

test('no plain scalar in the frontmatter contains ": " or " #"', () => {
  for (const l of lines) {
    if (/^\s/.test(l) || /:\s*[>|]/.test(l)) continue; // block scalar content or marker
    const value = l.slice(l.indexOf(':') + 1).trim();
    if (value.startsWith('"') || value.startsWith("'")) continue;
    assert.ok(!/: /.test(value) && !/ #/.test(value), `unsafe plain scalar: ${l}`);
  }
});

test('the description stays within the length agents accept', () => {
  assert.ok(field('description').value.length <= 1024, `${field('description').value.length} characters`);
});
