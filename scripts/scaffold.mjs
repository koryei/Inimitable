#!/usr/bin/env node
// Start a page from the landing starter: a complete, tested layout with a lit grainient ground, a floating nav,
// a product frame, a bento, steps, a big number, a closing call and a footer, with the motion kit wired in.
//
//   node scripts/scaffold.mjs <folder> [--kind base|landing|app] [--theme dark|light] [--palette ember] [--shape bowl] [--accent '#e8742c']
//                             [--seed 1] [--grain 0.45] [--hero stack|split|card] [--ground lit|flat|frame] [--art column]
//
//   voice    base only, required: sans (Geist), grotesk (Bricolage Grotesque), serif (Newsreader, with italic) or
//            condensed (Big Shoulders Display). weight is required with it: the headline's weight, 100 to 900.
//   kind     base: type, buttons, colour, motion and fonts with no layout, for a page that composes its own frame from
//            its concept; landing (default): the whole standard page; app: a working surface with a sidebar, key numbers,
//            a chart, a table and an empty state
//   theme    dark or light (default dark)
//   palette  one of the built-in grounds (see assets/recipes/mesh.mjs), or use --accent to derive one
//   minimal  keep only the hero, the steps, the closing call and the footer (for a short brief with few facts)
//   motes    drifting specks in the light (a slow breath, stopped under reduced motion)
//   hero     stack (headline over its copy), split (headline beside the one object only this product has) or
//            card (centred headline, then the product card cropped by the bottom of the first screen, with a traced
//            diagram behind it and annotation chips on it; it replaces the product section)
//   ground   lit (default: the soft grainy gradient, the default of machine-built pages, so say why the product wants it),
//            flat (one saturated colour carries the first screen; --palette cobalt|mint|sand), or frame (the page in
//            that colour, the hero a dark rounded panel set in below the nav). The theme follows the colour.
//   art      a duotone print in the split hero's object slot: column | vase | sphere | drape | strata. A stand-in to show the
//            technique: replace it with a picture of the product's own artifact (assets/recipes/duotone.mjs, dotify.mjs)
//   shape    pools | horizon | bowl | blob | sweep | rays | contour for the hero ground (default: bowl on dark, blob on light)
//
// Everything marked data-todo is placeholder. Replace it with the product's real words and numbers.
// signs.mjs reports every data-todo left on a page, so unfinished copy cannot ship.

import { copyFileSync, cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chip, annotationCss, heroDiagram } from '../assets/recipes/annotate.mjs';
import { SUBJECT_NAMES, duotoneSvg } from '../assets/recipes/duotone.mjs';
import { FLATS, FLAT_NAMES, flatGroundCss, flatThemeCss } from '../assets/recipes/flat.mjs';
import { PALETTES, fromAccent, grainient, hexToHsl, hslToHex } from '../assets/recipes/mesh.mjs';
import { isMain, parseArgs } from './lib/args.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

export function themeCss({ dark, palette }) {
  const counter = palette.counter;
  const { h } = hexToHsl(counter);
  const accent = dark ? counter : hslToHex(h, 0.62, 0.4);
  const onAccent = dark ? '#0b0a0f' : '#ffffff';
  const t = dark
    ? { ink: '#f3f1ec', ink2: '#bcb8b0', ink3: '#908c85', line: 'rgba(243,241,236,0.10)', strong: 'rgba(243,241,236,0.22)', surface: `color-mix(in srgb, #ffffff 4%, ${palette.base})` }
    : { ink: '#17150f', ink2: '#3f3a33', ink3: '#58524a', line: 'rgba(23,21,15,0.10)', strong: 'rgba(23,21,15,0.22)', surface: `color-mix(in srgb, #ffffff 62%, ${palette.base})` };
  return `/* Theme: written by scaffold.mjs. Edit the values to make them the product's own. */
:root {
  --bg: ${palette.base};
  --ink: ${t.ink};
  --ink-2: ${t.ink2};
  --ink-3: ${t.ink3};
  --line: ${t.line};
  --line-strong: ${t.strong};
  --surface: ${t.surface};
  --accent: ${accent};
  --on-accent: ${onAccent};
  --radius: 1.75rem;
  color-scheme: ${dark ? 'dark' : 'light'};
}
`;
}

export function scaffold(dest, { theme = 'dark', palette = 'midnight', accent, shape, seed = 1, grain = 0.45, hero: heroLayout = 'stack', motes = false, minimal = false, ground = 'lit', art } = {}) {
  if (!['lit', 'flat', 'frame'].includes(ground)) throw new Error(`--ground is lit, flat or frame (got "${ground}").`);
  if (!['stack', 'split', 'card'].includes(heroLayout)) throw new Error(`--hero is stack, split or card (got "${heroLayout}").`);
  if (art && !SUBJECT_NAMES.includes(art)) throw new Error(`--art is one of ${SUBJECT_NAMES.join(', ')} (got "${art}").`);
  if (art && heroLayout === 'card') throw new Error('--art goes in the split hero\'s object slot; the card hero shows the product card instead.');
  if (art) heroLayout = 'split';
  // Flat and frame grounds take a colour from --palette (cobalt, mint, sand); the default is cobalt, or sand for a frame.
  let tone;
  if (ground !== 'lit') {
    tone = FLATS[palette] ? palette : ground === 'frame' ? 'sand' : 'cobalt';
    if (palette && palette !== 'midnight' && !FLATS[palette]) throw new Error(`Unknown tone "${palette}". Flat and frame grounds use ${FLAT_NAMES.join(', ')}.`);
  }
  // A flat or framed ground is a colour with its own text colours, so the theme follows the colour.
  if (tone) theme = FLATS[tone].dark ? 'dark' : 'light';
  const dark = theme === 'dark';
  let pal;
  if (tone) pal = { base: FLATS[tone].base, counter: FLATS[tone].accent, family: [], dark };
  else if (accent) pal = fromAccent(accent, { dark });
  else {
    pal = PALETTES[palette === 'midnight' && !dark ? 'ember' : palette];
    if (!pal) throw new Error(`Unknown palette "${palette}". Use one of ${Object.keys(PALETTES).join(', ')} or --accent '#hex'.`);
    if (Boolean(pal.dark) !== dark) throw new Error(`The ${palette} palette is ${pal.dark ? 'dark' : 'light'}: use --theme ${pal.dark ? 'dark' : 'light'}, or pick another palette.`);
  }
  const heroShape = shape || (dark ? 'bowl' : 'blob');
  const hero = tone ? { css: '', problems: [] } : grainient({ palette: pal, shape: heroShape, seed, grain, selector: '.hero .ground', withMotes: motes, drift: motes, mask: heroShape === 'blob' || heroShape === 'sweep' ? 'none' : 'bottom' });
  const closer = tone ? { css: '', problems: [] } : grainient({ palette: pal, shape: dark ? 'horizon' : 'pools', seed: seed + 7, grain, selector: '.closer .ground', mask: 'radial' });

  mkdirSync(dest, { recursive: true });
  const starter = join(root, 'assets', 'starters', 'landing');
  let html = readFileSync(join(starter, 'index.html'), 'utf8').replace('data-theme="dark"', `data-theme="${theme}"`);
  // The object block exists only in the split layout.
  html = heroLayout === 'split' ? html.replace('<div class="hero-in">', '<div class="hero-in split">').replace(/<!--\/?object-->\n?/g, '') : html.replace(/ *<!--object-->[\s\S]*?<!--\/object-->\n?/, '');
  if (art) {
    // The print is the whole plate: ink is the page colour, paper is the text colour, so it follows the theme.
    const print = duotoneSvg({ subject: art, seed, mode: art === 'strata' ? 'lines' : 'halftone', ink: 'var(--bg)', paper: 'var(--ink)', width: 440, height: 550 });
    html = html.replace('<figure class="hero-object"', '<figure class="hero-object is-art"').replace(/<svg viewBox="0 0 400 400"[\s\S]*?<\/svg>/, print);
  }
  if (heroLayout === 'card') {
    html = html.replace('<div class="hero-in">', '<div class="hero-in card">').replace('<section class="hero"', '<section class="hero has-card"').replace(/<!--\/?card-->\n?/g, '');
    html = html.replace('<!--diagram-->', heroDiagram({ seed })).replace('<!--chips-->', [
      chip({ label: 'Say what to look at', x: 3, y: 62, pointer: 'tr', todo: true }),
      chip({ label: 'One true detail', x: 66, y: 70, pointer: 'tl', tone: 'ink', todo: true }),
    ].join('\n        '));
    html = html.replace(/ *<!--stats-->[\s\S]*?<!--\/stats-->\n?/, '');
    // The card is the product section's job now: cut that section and send its links to the features instead.
    html = html.replace(/<!--optional:product-->[\s\S]*?<!--\/optional:product-->\n?/g, '');
    html = html.replace(/href="#product"/g, 'href="#features"');
  } else html = html.replace(/ *<!--card-->[\s\S]*?<!--\/card-->\n?/, '').replace(/<!--\/?stats-->\n?/g, '');
  if (ground === 'frame') html = html.replace('<section class="hero"', '<section class="hero is-frame"').replace('<section class="hero has-card"', '<section class="hero is-frame has-card"');
  // --minimal keeps the hero, the steps, the closing call and the footer: for a short brief with few facts.
  html = minimal ? html.replace(/<!--optional:(\w+)-->[\s\S]*?<!--\/optional:\1-->\n?/g, '') : html.replace(/<!--\/?optional:\w+-->\n?/g, '');
  if (minimal) {
    // A link to a section that was cut (the hero's "See it working") points at the steps instead of nowhere.
    const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]));
    html = html.replace(/href="#([^"]+)"/g, (whole, id) => (ids.has(id) ? whole : 'href="#how"'));
  }
  writeFileSync(join(dest, 'index.html'), html);
  copyFileSync(join(starter, 'landing.css'), join(dest, 'landing.css'));
  copyFileSync(join(root, 'assets', 'motion', 'motion.css'), join(dest, 'motion.css'));
  copyFileSync(join(root, 'assets', 'motion', 'motion.js'), join(dest, 'motion.js'));
  cpSync(join(root, 'assets', 'fonts'), join(dest, 'fonts'), { recursive: true });
  const annotations = heroLayout === 'card' ? `\n${annotationCss()}` : '';
  if (tone) writeFileSync(join(dest, 'ground.css'), `${flatThemeCss({ tone })}\n${flatGroundCss({ tone, ground })}${annotations}`);
  else writeFileSync(join(dest, 'ground.css'), `${themeCss({ dark, palette: pal })}\n/* Hero ground */\n${hero.css}\n\n/* Closing ground */\n${closer.css}\n${annotations}`);
  const todo = (readFileSync(join(dest, 'index.html'), 'utf8').match(/data-todo/g) || []).length;
  return { dest, todo, palette: pal, problems: [...hero.problems, ...closer.problems], shape: tone ? `${ground} ${tone}` : `${heroShape} ground`, theme, ground, tone };
}

// ---------- app starter ----------
const luminance = (hex) => {
  const c = hex.replace('#', '').match(/../g).map((x) => parseInt(x, 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const ratio = (a, b) => { const [x, y] = [luminance(a), luminance(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };

export function appThemeCss({ dark, accent }) {
  const a = accent || (dark ? '#5fbf8f' : '#1f7a52');
  const onAccent = ratio(a, '#0b0b0c') >= ratio(a, '#ffffff') ? '#0b0b0c' : '#ffffff';
  const t = dark
    ? { bg: '#121214', side: '#0e0e10', card: '#18181b', raised: '#222226', ink: '#ececee', ink2: '#a6a6ad', ink3: '#8a8a92', line: 'rgba(236,236,238,0.08)', strong: 'rgba(236,236,238,0.2)', edge: 'rgba(255,255,255,0.08)', bad: '#ff7b7b' }
    : { bg: '#f6f5f2', side: '#efeeea', card: '#ffffff', raised: '#f0efeb', ink: '#17171a', ink2: '#4a4a51', ink3: '#62626a', line: 'rgba(23,23,26,0.09)', strong: 'rgba(23,23,26,0.22)', edge: 'rgba(255,255,255,0.8)', bad: '#b42318' };
  return `/* Theme: written by scaffold.mjs. Edit the values to make them the product's own. One accent, used rarely. */
:root {
  --bg: ${t.bg};
  --side-bg: ${t.side};
  --card: ${t.card};
  --raised: ${t.raised};
  --ink: ${t.ink};
  --ink-2: ${t.ink2};
  --ink-3: ${t.ink3};
  --line: ${t.line};
  --line-strong: ${t.strong};
  --edge: ${t.edge};
  --accent: ${a};
  --on-accent: ${onAccent};
  --bad: ${t.bad};
  color-scheme: ${dark ? 'dark' : 'light'};
}
`;
}

export function scaffoldApp(dest, { theme = 'dark', accent } = {}) {
  const dark = theme === 'dark';
  const starter = join(root, 'assets', 'starters', 'app');
  mkdirSync(dest, { recursive: true });
  writeFileSync(join(dest, 'index.html'), readFileSync(join(starter, 'index.html'), 'utf8').replace('data-theme="dark"', `data-theme="${theme}"`));
  copyFileSync(join(starter, 'app.css'), join(dest, 'app.css'));
  copyFileSync(join(root, 'assets', 'motion', 'motion.css'), join(dest, 'motion.css'));
  copyFileSync(join(root, 'assets', 'motion', 'motion.js'), join(dest, 'motion.js'));
  cpSync(join(root, 'assets', 'fonts'), join(dest, 'fonts'), { recursive: true });
  writeFileSync(join(dest, 'theme.css'), appThemeCss({ dark, accent }));
  const todo = (readFileSync(join(dest, 'index.html'), 'utf8').match(/data-todo/g) || []).length;
  return { dest, todo, problems: [], shape: 'app' };
}

// ---------- display voices for the base starter ----------
// The face and weight are the page's own decision (references/direction.md), so the base has no default for either.
// Tracking per face and weight comes from measured letter gaps (evals/tracking.mjs): heavy type needs far less
// tightening than light type, and Newsreader takes none. Order: [h2, small display, 62rem, 80rem and up].
export const VOICES = {
  sans: { family: 'Geist', fallback: 'ui-sans-serif, system-ui, sans-serif', weights: [100, 900], files: [], light: [-0.02, -0.03, -0.03, -0.04], heavy: [0.01, 0, -0.01, -0.02] },
  grotesk: { family: 'Bricolage Grotesque', fallback: 'ui-sans-serif, system-ui, sans-serif', weights: [200, 800], files: ['bricolage.woff2'], licence: 'OFL-bricolage.txt', light: [-0.02, -0.03, -0.035, -0.04], heavy: [-0.01, -0.02, -0.02, -0.03] },
  serif: { family: 'Newsreader', fallback: '"Iowan Old Style", Georgia, serif', weights: [200, 800], files: ['newsreader.woff2', 'newsreader-italic.woff2'], licence: 'OFL-newsreader.txt', light: [0, 0.01, 0.01, 0], heavy: [0, 0.02, 0.02, 0.01] },
  condensed: { family: 'Big Shoulders Display', fallback: '"Arial Narrow", ui-sans-serif, sans-serif', weights: [100, 900], files: ['big-shoulders.woff2'], licence: 'OFL-big-shoulders.txt', light: [0, -0.02, -0.02, -0.03], heavy: [0.01, 0, 0, -0.01] },
};

export function voiceCss(voice, weight) {
  const v = VOICES[voice];
  const faces = v.files.map((file) => `@font-face { font-family: "${v.family}"; src: url("fonts/${file}") format("woff2"); font-weight: ${v.weights[0]} ${v.weights[1]}; font-style: ${file.includes('italic') ? 'italic' : 'normal'}; font-display: swap; }`);
  const [h2, s, m, l] = weight > 500 ? v.heavy : v.light;
  return `\n/* Display voice: ${voice}, ${weight}. Tracking measured for this face and weight. */\n${faces.join('\n')}\n:root {\n  --display: "${v.family}", ${v.fallback};\n  --display-weight: ${weight};\n  --track-h2: ${h2}em;\n  --track-1: ${s}em;\n  --track-2: ${m}em;\n  --track-3: ${l}em;\n}\n`;
}

// ---------- base starter: the craft without the layout ----------
// For a page whose frame comes from its own concept. No hero, no sections beyond the first and the last: the agent
// composes the layout in page.css from the shape of the product's artifact (references/direction.md).
export function scaffoldBase(dest, { theme = 'dark', palette, accent, voice, weight } = {}) {
  const how = 'Choose from the concept\'s voice line (references/direction.md).';
  if (!VOICES[voice]) throw new Error(`--voice is ${Object.keys(VOICES).join(', ')}${voice ? ` (got "${voice}")` : ''}. ${how}`);
  const [low, high] = VOICES[voice].weights;
  if (!Number.isInteger(weight) || weight < low || weight > high) throw new Error(`--weight for ${voice} is a number from ${low} to ${high}. ${how}`);
  if (accent && !/^#[0-9a-f]{6}$/i.test(accent)) throw new Error(`--accent is a six-digit hex colour (got "${accent}").`);
  const problems = [];
  let css;
  if (palette && FLATS[palette]) {
    theme = FLATS[palette].dark ? 'dark' : 'light';
    css = flatThemeCss({ tone: palette });
  } else {
    const dark = theme === 'dark';
    let pal;
    if (accent) pal = fromAccent(accent, { dark });
    else {
      pal = PALETTES[palette || (dark ? 'midnight' : 'ember')];
      if (!pal) throw new Error(`Unknown palette "${palette}". Use one of ${[...Object.keys(PALETTES), ...FLAT_NAMES].join(', ')} or --accent '#hex'.`);
      if (Boolean(pal.dark) !== dark) throw new Error(`The ${palette} palette is ${pal.dark ? 'dark' : 'light'}: use --theme ${pal.dark ? 'dark' : 'light'}, or pick another palette.`);
    }
    css = themeCss({ dark, palette: pal });
    // In the base the colour asked for is the accent itself, not the seed of a derived palette.
    if (accent) {
      const onAccent = ratio(accent, '#0b0b0c') >= ratio(accent, '#ffffff') ? '#0b0b0c' : '#ffffff';
      css = css.replace(/--accent: [^;]+;/, `--accent: ${accent};`).replace(/--on-accent: [^;]+;/, `--on-accent: ${onAccent};`);
      // The accent also draws focus rings and link hover, so it has to read on the page.
      const seen = ratio(accent, pal.base);
      if (seen < 4.5) problems.push(`the accent ${accent} is ${seen.toFixed(1)}:1 on the page colour: too faint for link hover and focus. Darken or lighten it, or use it only as a fill.`);
    }
  }
  const starter = join(root, 'assets', 'starters', 'base');
  mkdirSync(dest, { recursive: true });
  writeFileSync(join(dest, 'index.html'), readFileSync(join(starter, 'index.html'), 'utf8').replace('data-theme="dark"', `data-theme="${theme}"`));
  copyFileSync(join(starter, 'base.css'), join(dest, 'base.css'));
  writeFileSync(join(dest, 'theme.css'), css + voiceCss(voice, weight));
  // Never overwrite the layout someone has already written.
  if (!existsSync(join(dest, 'page.css'))) writeFileSync(join(dest, 'page.css'), '/* Your layout. Take it from the shape of the product\'s own artifact. */\n');
  copyFileSync(join(root, 'assets', 'motion', 'motion.css'), join(dest, 'motion.css'));
  copyFileSync(join(root, 'assets', 'motion', 'motion.js'), join(dest, 'motion.js'));
  cpSync(join(root, 'assets', 'fonts'), join(dest, 'fonts'), { recursive: true });
  const { files, licence } = VOICES[voice];
  for (const file of [...files, ...(licence ? [licence] : [])]) copyFileSync(join(root, 'assets', 'voices', file), join(dest, 'fonts', file));
  const todo = (readFileSync(join(dest, 'index.html'), 'utf8').match(/data-todo/g) || []).length;
  return { dest, todo, problems, shape: 'base', theme, voice, weight };
}

if (isMain(import.meta.url)) {
  const { positional, flags } = parseArgs(process.argv.slice(2), { booleans: ['motes', 'minimal'] });
  if (!positional[0]) {
    console.error("Usage: node scripts/scaffold.mjs <folder> [--theme dark|light] [--palette ember] [--shape bowl] [--accent '#e8742c'] [--seed 1] [--grain 0.45] [--hero stack|split|card] [--ground lit|flat|frame] [--art column] [--motes] [--minimal] [--kind app]\n       node scripts/scaffold.mjs <folder> --kind base --voice sans|grotesk|serif|condensed --weight 400 [--theme dark|light] [--accent '#hex' | --palette name]");
    process.exit(2);
  }
  try {
    const kind = flags.kind === undefined ? 'landing' : flags.kind;
    if (!['landing', 'app', 'base'].includes(kind)) throw new Error(`--kind is base, landing or app (got "${kind}").`);
    const text = (name) => (typeof flags[name] === 'string' ? flags[name] : undefined);
    const mode = flags.theme === 'light' ? 'light' : 'dark';
    const result = kind === 'app' ? scaffoldApp(positional[0], { theme: mode, accent: text('accent') }) : kind === 'base' ? scaffoldBase(positional[0], { theme: mode, accent: text('accent'), palette: text('palette'), voice: text('voice'), weight: flags.weight ? Number(flags.weight) : undefined }) : scaffold(positional[0], {
      theme: flags.theme === 'light' ? 'light' : 'dark',
      palette: typeof flags.palette === 'string' ? flags.palette : undefined,
      accent: typeof flags.accent === 'string' ? flags.accent : undefined,
      shape: typeof flags.shape === 'string' ? flags.shape : undefined,
      seed: flags.seed ? Number(flags.seed) : 1,
      grain: flags.grain ? Number(flags.grain) : 0.45,
      hero: ['split', 'card'].includes(flags.hero) ? flags.hero : 'stack',
      ground: typeof flags.ground === 'string' ? flags.ground : 'lit',
      art: typeof flags.art === 'string' ? flags.art : undefined,
      motes: Boolean(flags.motes),
      minimal: Boolean(flags.minimal),
    });
    console.log(`Started ${result.dest}  (${kind === 'app' ? `${mode}, app shell` : kind === 'base' ? `${result.theme}, no layout` : `${result.theme}, ${result.shape}`})`);
    if (kind === 'base') console.log('The layout is yours: write it in page.css, from the shape of the artifact in your concept, and carry one material through the page (data-device).');
    if (kind === 'landing') console.log('This is the shared frame: every page started here has the same nav, hero and closing block. For a page that has to be recognisably this product, use --kind base.');
    if (kind === 'landing' && result.ground === 'lit') console.log('Ground: lit, the soft grainy gradient. It is the default of machine-built pages: keep it only if the concept says why this product wants light (flat and frame are the alternatives).');
    console.log(`${result.todo} placeholders to replace (every data-todo). signs.mjs lists any left.`);
    for (const p of result.problems) console.log(`warning: ${p}`);
    console.log(`\nNext: replace the placeholders with the real content, then run shoot, signs, check, craft${kind === 'app' ? '' : ' and frame'} on index.html.`);
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}
