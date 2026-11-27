// Turns the raw counts from the page into numbers and flags. No browser needed, so it is testable.

const MONO = /mono|code|courier|consolas|menlo|plex mono|jetbrains|fira code|source code|sf mono/i;

export const SCALE = [4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128];

const sum = (obj) => Object.values(obj).reduce((a, b) => a + b, 0);
const sorted = (obj) => Object.entries(obj).sort((a, b) => b[1] - a[1]);

function hexToHsl(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h;
  if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  return { h: Math.round(h * 60), s, l };
}

// Colours that read as a hue rather than grey. Grouped by 30 degree bands.
export function hueBands(colorCounts, minSaturation = 0.2) {
  const bands = {};
  for (const [hex, n] of Object.entries(colorCounts)) {
    const { h, s, l } = hexToHsl(hex);
    if (s < minSaturation || l < 0.05 || l > 0.97) continue;
    const band = Math.floor(h / 30) * 30;
    bands[band] = (bands[band] || 0) + n;
  }
  return bands;
}

export function analyse(raw, { scale = SCALE } = {}) {
  const spacingTotal = sum(raw.spacing);
  const offGrid = {};
  const offScale = {};
  for (const [value, n] of Object.entries(raw.spacing)) {
    const v = Number(value);
    if (v === 2) continue; // a 2 px step is allowed for tight rows and nudges inside small controls
    if (v % 4 !== 0) offGrid[v] = n;
    else if (!scale.includes(v)) offScale[v] = n;
  }
  const onGridShare = spacingTotal ? 1 - sum(offGrid) / spacingTotal : 1;
  const sizes = Object.keys(raw.fontSizes).map(Number).sort((a, b) => a - b);
  const weights = Object.keys(raw.fontWeights).map(Number).sort((a, b) => a - b);
  const radii = Object.keys(raw.radii);
  const hues = hueBands({ ...raw.textColors, ...raw.surfaceColors, ...raw.borderColors });
  const tinyText = sizes.filter((s) => s < 12);
  const flags = [];
  // The working scale (under 40 px) is capped at about 7 sizes; display, numeral and statement sizes (40 px and up,
  // used once or twice each) are a separate allowance of 4, so a page may have a real hierarchy at the top.
  const working = sizes.filter((n) => n < 40);
  const display = sizes.filter((n) => n >= 40);
  if (working.length > 7) flags.push(`${working.length} working font sizes under 40 px (a scale needs about 7 or fewer)`);
  if (display.length > 4) flags.push(`${display.length} display sizes at 40 px and up (keep to about 4: headline, numeral, statement, price)`);
  if (tinyText.length) flags.push(`text smaller than 12 px: ${tinyText.join(', ')}`);
  const loud = /^(persuade|experience)$/.test(raw.mode || '');
  if (!loud && weights.some((w) => w >= 700)) flags.push(`weights ${weights.filter((w) => w >= 700).join(', ')} in use (heavy)`);
  if (weights.length > 3) flags.push(`${weights.length} font weights in use`);
  const proportional = Object.keys(raw.fontFamilies).filter((f) => !MONO.test(f));
  if (proportional.length > 2) flags.push(`${proportional.length} proportional font families in use (one family plus one partner is the rule; a mono for code or figures is extra)`);
  if (radii.length > 4) flags.push(`${radii.length} different corner radii`);
  if (onGridShare < 0.9) flags.push(`only ${Math.round(onGridShare * 100)}% of spacing values sit on the 4 px grid`);
  if (Object.keys(offGrid).length) flags.push(`off-grid spacing: ${Object.keys(offGrid).join(', ')}`);
  const neutralText = Object.keys(raw.textColors).filter((hex) => hexToHsl(hex).s < 0.25);
  if (neutralText.length > 6) flags.push(`${neutralText.length} different neutral text colours (aim for three roles per surface)`);
  if (Object.keys(hues).length > 3) flags.push(`${Object.keys(hues).length} colour hues in use (${Object.keys(hues).join(', ')} degrees; an accent plus red and green for meaning is fine)`);
  return {
    totals: { elements: raw.elements, textElements: raw.textElements },
    fontSizes: sorted(raw.fontSizes),
    fontWeights: sorted(raw.fontWeights),
    fontFamilies: sorted(raw.fontFamilies),
    radii: sorted(raw.radii),
    spacing: { onGridShare, offGrid, offScale, distinct: Object.keys(raw.spacing).length },
    colours: {
      text: sorted(raw.textColors),
      surfaces: sorted(raw.surfaceColors),
      borders: sorted(raw.borderColors),
      hueBands: hues,
    },
    flags,
  };
}

export function format(report) {
  const line = (label, pairs) => `  ${label.padEnd(10)} ${pairs.map(([v, n]) => `${v} (${n})`).join(', ') || 'none'}`;
  const out = [];
  out.push(`Elements ${report.totals.elements}, with text ${report.totals.textElements}`);
  out.push(line('sizes', report.fontSizes));
  out.push(line('weights', report.fontWeights));
  out.push(line('families', report.fontFamilies));
  out.push(line('radii', report.radii));
  out.push(`  spacing    ${Math.round(report.spacing.onGridShare * 100)}% on the 4 px grid, ${report.spacing.distinct} distinct values`);
  out.push(line('text', report.colours.text));
  out.push(line('surfaces', report.colours.surfaces));
  out.push(line('borders', report.colours.borders));
  out.push(report.flags.length ? `\nFlags\n${report.flags.map((f) => `  - ${f}`).join('\n')}` : '\nNo flags.');
  return out.join('\n');
}

// For the before and after line of a report.
export function compare(before, after) {
  const pick = (r) => ({
    sizes: r.fontSizes.length,
    weights: r.fontWeights.length,
    families: r.fontFamilies.length,
    radii: r.radii.length,
    offGridValues: Object.keys(r.spacing.offGrid).length,
    textColours: r.colours.text.length,
    hues: Object.keys(r.colours.hueBands).length,
    flags: r.flags.length,
  });
  const a = pick(before);
  const b = pick(after);
  return Object.keys(a).map((k) => ({ metric: k, before: a[k], after: b[k] }));
}
