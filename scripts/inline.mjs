#!/usr/bin/env node
// Bundle a page folder into ONE self-contained HTML file: stylesheets, scripts and fonts inlined, no network.
//
//   node scripts/inline.mjs <folder or index.html> [--out page.html]
//
// Linked .css files are inlined (their url() fonts and images become data URIs), linked .js files are inlined
// with any "</script" escaped so the page cannot end its own script early, and <img src> files become data URIs.
// External http(s) URLs are left alone and reported, so you can see what still needs the network.

import { existsSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, extname, join, resolve } from 'node:path';
import { isMain, parseArgs } from './lib/args.mjs';

const MIME = { '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf', '.otf': 'font/otf', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif', '.gif': 'image/gif' };
const isRemote = (u) => /^(https?:)?\/\//i.test(u) || u.startsWith('data:') || u.startsWith('#');

export function dataUri(file) {
  const type = MIME[extname(file).toLowerCase()];
  if (!type) throw new Error(`Cannot inline ${file}: unknown type ${extname(file)}`);
  return `data:${type};base64,${readFileSync(file).toString('base64')}`;
}

export function inlineCss(css, dir, remote = []) {
  // A closing style tag inside CSS would end the block early, so it is escaped as CSS would read it.
  css = css.replace(/<\/style/gi, '<\\/style');
  return css.replace(/url\(\s*(['"]?)([^'")]+)\1\s*\)/g, (match, _q, url) => {
    if (isRemote(url)) { if (/^(https?:)?\/\//i.test(url)) remote.push(url); return match; }
    const file = resolve(dir, url.split('?')[0].split('#')[0]);
    if (!existsSync(file)) return match;
    return `url("${dataUri(file)}")`;
  });
}

export function inlineJs(js) {
  return js.replace(/<\/(script)/gi, '<\\/$1').replace(/<!--/g, '<\\!--');
}

export function inlineHtml(html, dir) {
  const remote = [];
  html = html.replace(/<link\b[^>]*\brel=["']stylesheet["'][^>]*>/gi, (tag) => {
    const href = (tag.match(/href=["']([^"']+)["']/i) || [])[1];
    if (!href) return tag;
    if (isRemote(href)) { remote.push(href); return tag; }
    const file = resolve(dir, href);
    if (!existsSync(file)) throw new Error(`Missing stylesheet ${href}`);
    return `<style>\n${inlineCss(readFileSync(file, 'utf8'), dirname(file), remote)}\n</style>`;
  });
  html = html.replace(/<script\b([^>]*)\bsrc=["']([^"']+)["']([^>]*)><\/script>/gi, (tag, a, src, b) => {
    if (isRemote(src)) { remote.push(src); return tag; }
    const file = resolve(dir, src);
    if (!existsSync(file)) throw new Error(`Missing script ${src}`);
    const attrs = `${a} ${b}`.replace(/\bdefer\b/i, '').replace(/\s+/g, ' ').trim();
    // A deferred external script runs after parsing; an inline one does not, so wait for the document to be ready.
    const body = inlineJs(readFileSync(file, 'utf8'));
    return `<script${attrs ? ` ${attrs}` : ''}>\ndocument.addEventListener('DOMContentLoaded', function () {\n${body}\n});\n</script>`;
  });
  html = html.replace(/<img\b([^>]*)\bsrc=["']([^"']+)["']([^>]*)>/gi, (tag, a, src, b) => {
    if (isRemote(src)) { if (/^(https?:)?\/\//i.test(src)) remote.push(src); return tag; }
    const file = resolve(dir, src);
    return existsSync(file) ? `<img${a}src="${dataUri(file)}"${b}>` : tag;
  });
  html = html.replace(/<style>([\s\S]*?)<\/style>/gi, (m, css) => `<style>${inlineCss(css, dir, remote)}</style>`);
  return { html, remote: [...new Set(remote)] };
}

if (isMain(import.meta.url)) {
  const { positional, flags } = parseArgs(process.argv.slice(2));
  if (!positional[0]) { console.error('Usage: node scripts/inline.mjs <folder or index.html> [--out page.html]'); process.exit(2); }
  let input = resolve(positional[0]);
  if (statSync(input).isDirectory()) input = join(input, 'index.html');
  const { html, remote } = inlineHtml(readFileSync(input, 'utf8'), dirname(input));
  const out = typeof flags.out === 'string' ? flags.out : join(dirname(input), 'page.html');
  writeFileSync(out, html);
  console.log(`${out}  ${(html.length / 1024).toFixed(0)} KB`);
  if (remote.length) console.log(`Still needs the network: ${remote.join(', ')}`);
}
