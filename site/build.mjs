#!/usr/bin/env node
// Builds the website into site/dist: the landing starter (motion kit, fonts, ground), this page on top,
// and the example images (copied from examples/, the single source of truth).
//
//   node site/build.mjs            then open site/dist/index.html
import { copyFileSync, cpSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DRIFT } from '../scripts/lib/probe.mjs';
import { scaffold } from '../scripts/scaffold.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'site', 'dist');
rmSync(dist, { recursive: true, force: true });
mkdirSync(join(dist, 'img'), { recursive: true });

// The page is the skill's own landing starter: scaffold writes the motion kit, the open fonts, the lit ground
// and the starter's styles, then this page's own markup, styles and script go on top.
scaffold(dist, { theme: 'light', palette: 'ember', shape: 'contour', seed: 3 });
copyFileSync(join(root, 'site', 'index.html'), join(dist, 'index.html'));
copyFileSync(join(root, 'site', 'site.js'), join(dist, 'site.js'));
copyFileSync(join(root, 'site', 'site.css'), join(dist, 'site.css'));
writeFileSync(join(dist, '.nojekyll'), '');

// The page counts itself with the same probe drift.mjs runs, so the receipt and the tool cannot
// disagree. Written from the one copy in scripts/lib/probe.mjs rather than retyped here.
writeFileSync(join(dist, 'count.js'), `window.__countPage = () => (${DRIFT});\n`);

// Example images, copied from the examples so there is one copy in the repo.
const images = {
  'landing-before': 'examples/landing/before-1440.jpg',
  'landing-after': 'examples/landing/after-1440.jpg',
  'dashboard-before': 'examples/dashboard/before-1440.jpg',
  'dashboard-after': 'examples/dashboard/after-1440.jpg',
  'messaging-before': 'examples/instrument-messaging/without-skill-1440.jpg',
  'messaging-after': 'examples/instrument-messaging/with-skill-1440.jpg',
  'chip-before': 'examples/instrument-chip/without-skill-1440.jpg',
  'chip-after': 'examples/instrument-chip/with-skill-1440.jpg',
  'terminal-before': 'examples/terminal/before-60.jpg',
  'terminal-after': 'examples/terminal/after-60.jpg',
};
for (const [name, from] of Object.entries(images)) copyFileSync(join(root, from), join(dist, 'img', `${name}.jpg`));
cpSync(join(root, 'site', 'favicon.svg'), join(dist, 'favicon.svg'));

console.log(`Built ${dist}`);
