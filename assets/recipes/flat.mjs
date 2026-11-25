// Flat grounds: one saturated colour carrying the whole first screen (nav, ground and buttons), or a dark rounded
// panel set into a light page. The opposite of a lit gradient: no light, no depth, a colour and what is on it.
//
//   import { FLATS, flatThemeCss, flatGroundCss } from './flat.mjs';
//   flatThemeCss({ tone: 'cobalt', ground: 'flat' })   // the custom properties
//   flatGroundCss({ tone: 'cobalt', ground: 'flat' })  // the hero and closing grounds
//
// Why it works: a flat colour is read as a decision, where a soft gradient is read as a default. It also makes the
// type, the product card and the artwork do the work, so they have to be good. The cost is that nothing hides a weak
// layout. Every tone here is checked for contrast in test/flat.test.mjs: body text 4.5:1 on the ground and on the
// card surface, the lighter-tint text too, and the accent as text on the ground.
//
// "flat" paints the hero in the tone and sets the closing call in a darker panel of the same hue.
// "frame" keeps the page in the tone and sets the whole hero in that dark panel, inset and rounded, below the nav.

import { grainCss } from './mesh.mjs';

export const FLATS = {
  cobalt: { base: '#1f43d6', dark: true, ink: '#f6f4ee', ink2: '#e1e6fb', ink3: '#d3daf9', accent: '#f7d63a', onAccent: '#14120a', panel: '#0a1250', panelAccent: '#f7d63a' },
  mint: { base: '#8fe3bd', dark: false, ink: '#0b2e22', ink2: '#1d4a3a', ink3: '#245241', accent: '#0b5c3f', onAccent: '#ffffff', panel: '#0b2e22', panelAccent: '#8fe3bd' },
  sand: { base: '#e8dfca', dark: false, ink: '#1a1914', ink2: '#3d3a31', ink3: '#5c574b', accent: '#a82e17', onAccent: '#ffffff', panel: '#1a1914', panelAccent: '#e9a98a' },
};
export const FLAT_NAMES = Object.keys(FLATS);

// The panel's own text colours: always light, because the panel is always dark.
const PANEL_TEXT = { ink: '#f3f1ec', ink2: '#cfcbc2', ink3: '#a8a49b' };

// ---------- contrast, so the tones are checked rather than hoped ----------
export const luminance = (hex) => {
  const c = hex.replace('#', '').match(/../g).map((x) => parseInt(x, 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
export const contrast = (a, b) => {
  const [x, y] = [luminance(a), luminance(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
};
// A colour mixed over another, as sRGB, to match CSS color-mix(in srgb, top pct%, bottom).
export const mixHex = (top, bottom, pct) => {
  const t = top.replace('#', '').match(/../g).map((x) => parseInt(x, 16));
  const b = bottom.replace('#', '').match(/../g).map((x) => parseInt(x, 16));
  return `#${t.map((v, i) => Math.round(v * pct + b[i] * (1 - pct)).toString(16).padStart(2, '0')).join('')}`;
};

export function flatTokens(tone) {
  const f = FLATS[tone];
  if (!f) throw new Error(`Unknown flat tone "${tone}". Use one of ${FLAT_NAMES.join(', ')}.`);
  const inkRgb = f.ink;
  const lineOf = (hex, a) => `rgba(${hex.replace('#', '').match(/../g).map((x) => parseInt(x, 16)).join(',')},${a})`;
  return {
    bg: f.base, ink: f.ink, ink2: f.ink2, ink3: f.ink3,
    line: lineOf(inkRgb, 0.14), strong: lineOf(inkRgb, 0.3),
    surface: `color-mix(in srgb, ${f.dark ? '#ffffff' : '#ffffff'} ${f.dark ? 8 : 55}%, ${f.base})`,
    surfaceHex: mixHex('#ffffff', f.base, f.dark ? 0.08 : 0.55),
    accent: f.accent, onAccent: f.onAccent,
    panel: f.panel,
  };
}

export function flatThemeCss({ tone = 'cobalt' } = {}) {
  const f = FLATS[tone];
  const t = flatTokens(tone);
  const lineP = (a) => `rgba(243,241,236,${a})`;
  return `/* Theme: written by scaffold.mjs (${tone}). Edit the values to make them the product's own. */
:root {
  --bg: ${t.bg};
  --ink: ${t.ink};
  --ink-2: ${t.ink2};
  --ink-3: ${t.ink3};
  --line: ${t.line};
  --line-strong: ${t.strong};
  --surface: ${t.surface};
  --accent: ${t.accent};
  --on-accent: ${t.onAccent};
  --radius: 1.75rem;
  /* The dark panel (the closing call, or the whole hero with --ground frame). */
  --panel: ${t.panel};
  --panel-ink: ${PANEL_TEXT.ink};
  --panel-ink-2: ${PANEL_TEXT.ink2};
  --panel-ink-3: ${PANEL_TEXT.ink3};
  --panel-line: ${lineP(0.12)};
  --panel-strong: ${lineP(0.26)};
  --panel-surface: color-mix(in srgb, #ffffff 7%, ${t.panel});
  --panel-accent: ${f.panelAccent};
  color-scheme: ${f.dark ? 'dark' : 'light'};
}
`;
}

// The tokens re-pointed at the panel, so everything inside it (type, buttons, cards, lines) reads as dark-theme
// without a second set of rules. The kit's buttons and the starter's type use these names only.
const PANEL_SCOPE = `--bg: var(--panel); --ink: var(--panel-ink); --ink-2: var(--panel-ink-2); --ink-3: var(--panel-ink-3); --line: var(--panel-line); --line-strong: var(--panel-strong); --surface: var(--panel-surface); --accent: var(--panel-accent); --on-accent: #0b0a0f; color: var(--ink); color-scheme: dark;`;

export function flatGroundCss({ tone = 'cobalt', ground = 'flat', grain = 0.3 } = {}) {
  const f = FLATS[tone];
  const grained = (sel, dark) => grainCss({ dark, strength: grain, selector: sel });
  const common = `/* Flat ground (${ground}, ${tone}). A colour, a little grain so it is not dead, and the type on it. */
.hero .ground, .closer .ground { background: var(--bg); }
`;
  if (ground === 'frame') {
    return `${common}
/* Frame: the page stays in the tone; the hero is a dark panel set in below the nav. */
.hero.is-frame { ${PANEL_SCOPE} margin-top: 5.25rem; min-height: min(100svh - 6rem, 60rem); background: var(--panel); }
.closer { ${PANEL_SCOPE} background: var(--panel); }
${grained('.hero .ground::after, .closer .ground::after', true)}
`;
  }
  return `${common}
/* Flat: the hero is the tone itself; the product card and the closing call are darker panels of the same hue. */
.closer { ${PANEL_SCOPE} background: var(--panel); }
.hero-card .window { ${PANEL_SCOPE} background: var(--panel); border-color: var(--panel-strong); }
${grained('.hero .ground::after', f.dark)}
${grained('.closer .ground::after', true)}
`;
}
