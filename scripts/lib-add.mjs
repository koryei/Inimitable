#!/usr/bin/env node
// Pull real components from the open registries the skill recommends (Bencho, BoardUI, Aceternity, or any
// shadcn-format registry), so a design uses their actual source instead of a description of it.
//
//   node scripts/lib-add.mjs sources
//   node scripts/lib-add.mjs list  <source>
//   node scripts/lib-add.mjs add   <source> <item> [<item>...] [--out vendor] [--dry-run]
//   node scripts/lib-add.mjs add   --registry 'https://example.com/r/{name}.json' <item>
//
// It only writes files. It never runs code, never installs packages (it prints the ones to install), and
// writes a NOTICE.md next to what it fetched so the source and licence travel with the files.
// Re-skin everything to the project's tokens afterwards: see references/libraries.md.

import { appendFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, normalize, resolve, sep } from 'node:path';
import { isMain, parseArgs } from './lib/args.mjs';

export const SOURCES = {
  bencho: { registry: 'https://bencho.dev/r/{name}.json', index: 'https://bencho.dev/r/registry.json', licence: 'MIT for the free blocks. Keep the notice. Pro blocks are paid and are not served here.', home: 'https://bencho.dev', needs: 'React, framer-motion and lucide-react for most blocks' },
  boardui: { registry: 'https://www.boardui.com/r/{name}.json', index: 'https://www.boardui.com/r/registry.json', licence: 'Free tier as source. Read the repository LICENSE before shipping. Pro items need a licence you hold.', home: 'https://boardui.com', needs: 'React, Tailwind v4, React Aria Components' },
  aceternity: { registry: 'https://ui.aceternity.com/registry/{name}.json', index: 'https://ui.aceternity.com/registry/index.json', licence: 'Free components are open source; Pro templates and blocks have a custom licence that restricts redistribution. Check the component page.', home: 'https://ui.aceternity.com', needs: 'React, Tailwind, motion' },
};

const MAX_ITEMS = 40;

export function itemUrl(template, name) {
  if (/^https?:\/\//.test(name)) return name;
  return template.replace('{name}', name);
}

// A registry file's destination, kept inside the output folder whatever the registry says.
export function safeTarget(file, out) {
  const raw = file.target || file.path || '';
  // Any parent-directory segment is refused outright, not quietly rewritten.
  if (raw.split(/[/\\]/).includes('..')) throw new Error(`Refusing to write outside the output folder: ${raw}`);
  let rel = raw.replace(/^@components\//, '').replace(/^@\//, '').replace(/^~\//, '');
  rel = normalize(rel).replace(/^[/\\]+/, '');
  if (!rel) throw new Error(`Refusing an empty file path in the registry item`);
  const full = resolve(out, rel);
  if (!full.startsWith(resolve(out) + sep)) throw new Error(`Refusing to write outside the output folder: ${rel}`);
  return full;
}

export async function resolveItems(template, names, fetchJson) {
  const seen = new Map();
  const queue = [...names];
  while (queue.length) {
    const name = queue.shift();
    const url = itemUrl(template, name);
    if (seen.has(url)) continue;
    if (seen.size >= MAX_ITEMS) throw new Error(`More than ${MAX_ITEMS} items in one install: stopping.`);
    const item = await fetchJson(url);
    if (!item || !Array.isArray(item.files)) throw new Error(`${url} is not a registry item (no files).`);
    seen.set(url, item);
    for (const dep of item.registryDependencies || []) queue.push(dep);
  }
  return [...seen.entries()].map(([url, item]) => ({ url, item }));
}

export function plan(resolved, out) {
  const files = [];
  const npm = new Set();
  const licences = new Set();
  for (const { url, item } of resolved) {
    for (const d of item.dependencies || []) npm.add(d);
    for (const d of item.devDependencies || []) npm.add(`${d} (dev)`);
    if (item.meta?.license) licences.add(`${item.name}: ${item.meta.license}`);
    for (const f of item.files) {
      if (typeof f.content !== 'string') continue;
      files.push({ item: item.name, url, full: safeTarget(f, out), bytes: Buffer.byteLength(f.content), content: f.content });
    }
  }
  return { files, npm: [...npm], licences: [...licences] };
}

async function getJson(url) {
  const res = await fetch(url, { headers: { accept: 'application/json', 'user-agent': 'inimitable-lib-add' } });
  if (!res.ok) throw new Error(`${url} answered ${res.status}`);
  return res.json();
}

export async function add({ source, registry, names, out = 'vendor', dryRun = false, fetchJson = getJson, now = () => new Date() }) {
  const info = source ? SOURCES[source] : { registry, licence: 'Unknown: read the source registry\'s licence before shipping.', home: registry };
  if (!info) throw new Error(`Unknown source "${source}". Known: ${Object.keys(SOURCES).join(', ')}, or pass --registry.`);
  const dest = out;
  const resolved = await resolveItems(info.registry, names, fetchJson);
  const result = plan(resolved, dest);
  if (!dryRun) {
    for (const f of result.files) {
      mkdirSync(dirname(f.full), { recursive: true });
      writeFileSync(f.full, f.content);
    }
    mkdirSync(dest, { recursive: true });
    const notice = join(dest, `NOTICE-${source || 'registry'}.md`);
    if (!existsSync(notice)) writeFileSync(notice, `# Vendored from ${source || 'a registry'}\n\nSource: ${info.home}\nLicence: ${info.licence}\n\nThese files were fetched unmodified by inimitable's lib-add. Keep this notice with them. Re-skin them to the project's tokens before shipping.\n\n`);
    appendFileSync(notice, `- ${now().toISOString().slice(0, 10)}: ${resolved.map((r) => r.item.name).join(', ')}\n`);
  }
  return { ...result, items: resolved.map((r) => r.item.name), dest, licence: info.licence, needs: info.needs };
}

export async function list(source, fetchJson = getJson) {
  const info = SOURCES[source];
  if (!info) throw new Error(`Unknown source "${source}". Known: ${Object.keys(SOURCES).join(', ')}.`);
  const data = await fetchJson(info.index);
  const items = Array.isArray(data) ? data : data.items || [];
  return items.map((i) => ({ name: i.name, title: i.title, description: i.description, type: i.type }));
}

if (isMain(import.meta.url)) {
  const { positional, flags } = parseArgs(process.argv.slice(2), { booleans: ['dry-run'] });
  const [command, ...rest] = positional;
  try {
    if (command === 'sources' || !command) {
      for (const [name, s] of Object.entries(SOURCES)) console.log(`${name.padEnd(11)} ${s.home}\n            needs ${s.needs}\n            ${s.licence}`);
    } else if (command === 'list') {
      for (const i of await list(rest[0])) console.log(`${String(i.name).padEnd(24)} ${(i.description || i.title || '').slice(0, 90)}`);
    } else if (command === 'add') {
      const source = flags.registry ? undefined : rest.shift();
      if (!rest.length) throw new Error('Name at least one item: node scripts/lib-add.mjs add bencho liq-toggle');
      const result = await add({ source, registry: typeof flags.registry === 'string' ? flags.registry : undefined, names: rest, out: typeof flags.out === 'string' ? flags.out : 'vendor', dryRun: Boolean(flags['dry-run']) });
      console.log(`${flags['dry-run'] ? 'Would write' : 'Wrote'} ${result.files.length} file(s) from ${result.items.join(', ')} into ${result.dest}`);
      for (const f of result.files) console.log(`  ${f.full}  (${f.bytes} bytes)`);
      if (result.npm.length) console.log(`\nInstall these packages yourself (nothing was installed):\n  ${result.npm.join('\n  ')}`);
      console.log(`\nNeeds: ${result.needs}\nLicence: ${result.licence}${result.licences.length ? `\n  ${result.licences.join('\n  ')}` : ''}\nRe-skin to the project's tokens, name what you took in the report.`);
    } else throw new Error(`Unknown command "${command}". Use sources, list or add.`);
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}
