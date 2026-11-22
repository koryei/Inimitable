#!/usr/bin/env node
// Builds the website into site/dist: the page, one stylesheet (the instrument kit plus the site's own CSS),
// the script, the example images (copied from examples/, the single source of truth), and a hero picture
// made with the skill's own tools: the "before" screen dotted with dotify, annotated with hud.mjs.
//
//   node site/build.mjs            then open site/dist/index.html
import { copyFileSync, cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { callout, cornerBrackets, crosshair, overlaySvg, registration, ruler } from '../assets/recipes/hud.mjs';
import { dotify } from '../scripts/dotify.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'site', 'dist');
rmSync(dist, { recursive: true, force: true });
mkdirSync(join(dist, 'img'), { recursive: true });

// Pages and styles.
copyFileSync(join(root, 'site', 'index.html'), join(dist, 'index.html'));
copyFileSync(join(root, 'site', 'site.js'), join(dist, 'site.js'));
writeFileSync(join(dist, 'styles.css'), `${readFileSync(join(root, 'assets', 'recipes', 'instrument.css'), 'utf8')}\n${readFileSync(join(root, 'site', 'site.css'), 'utf8')}`);
writeFileSync(join(dist, '.nojekyll'), '');

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

// Hero: the dashboard "before" screen as dots, so the page can show the same screen before and after.
const dots = await dotify(join(root, 'examples/dashboard/before-1440.jpg'), { mode: 'halftone', dots: 120, cell: 8, fill: '#141414', invert: true, trim: false });
writeFileSync(join(dist, 'hero-dots.svg'), dots.svg);

// Annotation laid over the hero, drawn with the skill's HUD recipes. Sized to the 1440 x 900 screenshots.
const W = 960;
const H = 600;
const ink = '#141414';
const overlay = overlaySvg({
  width: W,
  height: H,
  children: [
    `<g color="${ink}">`,
    cornerBrackets({ x: 6, y: 6, w: W - 12, h: H - 12, size: 14, stroke: ink }),
    registration({ x: 30, y: H - 30, stroke: ink }),
    ruler({ x: W - 14, y: 90, length: 420, step: 20, major: 100, orientation: 'v', stroke: ink, text: ink, side: -1, size: 9 }),
    crosshair({ x: 480, y: 300, size: 12, stroke: '#d4281f', gap: 4 }),
    callout({ x: 250, y: 190, label: 'Before', sub: '75 tells found', dx: 60, dy: -70, side: 'right', stroke: ink, fill: '#e6e5e1', size: 12 }),
    callout({ x: 740, y: 380, label: 'After', sub: '0 tells found', dx: -50, dy: 80, side: 'left', stroke: ink, fill: '#e6e5e1', size: 12 }),
    '</g>',
  ],
});
writeFileSync(join(dist, 'hero-overlay.svg'), overlay);
console.log(`Built ${dist}`);
