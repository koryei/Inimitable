// The pure half of the frame check: how alike are two page skeletons, and does a page carry its material through?
// A skeleton is what stays when the words, pictures and exact colours are taken away.

// Trait weights add to 1. Layout traits count most: two pages with the same nav, composition and section order read
// as one template however different their colours are.
export const WEIGHTS = { nav: 0.15, composition: 0.15, align: 0.1, container: 0.1, sequence: 0.35, button: 0.05, headlineFont: 0.05, ground: 0.05 };
export const SAME_FRAME = 0.75;
export const MIN_DEVICE_SECTIONS = 3;

// Length of the longest common subsequence: how much of the section order two pages share.
export function lcs(a, b) {
  const row = new Array(b.length + 1).fill(0);
  for (const x of a) {
    let diagonal = 0;
    for (let j = 1; j <= b.length; j++) {
      const above = row[j];
      row[j] = x === b[j - 1] ? diagonal + 1 : Math.max(row[j], row[j - 1]);
      diagonal = above;
    }
  }
  return row[b.length];
}

export function similarity(a, b) {
  let score = 0;
  const shared = [];
  for (const [trait, weight] of Object.entries(WEIGHTS)) {
    if (trait === 'sequence') {
      const longest = Math.max(a.sequence.length, b.sequence.length);
      const part = longest ? lcs(a.sequence, b.sequence) / longest : 1;
      score += weight * part;
      if (part >= 0.6) shared.push(`sections in the same order (${Math.round(part * 100)}%)`);
    } else if (a[trait] === b[trait]) {
      score += weight;
      shared.push(`${trait}: ${a[trait]}`);
    }
  }
  return { score: Math.round(score * 100) / 100, shared };
}

// A material passes when one name is visible on the first screen and in at least two more sections, or when a single
// marked element runs down most of the page (a ruler on the edge, a margin rule).
export function judgeDevice(devices) {
  const found = Object.entries(devices || {}).map(([name, d]) => {
    const spans = d.coverage >= 0.6;
    const spread = d.sections.length >= MIN_DEVICE_SECTIONS && d.sections.includes(0);
    return { name, sections: d.sections.length, firstScreen: d.sections.includes(0), runsThrough: spans, pass: spans ? d.sections.includes(0) : spread };
  });
  const pass = found.some((d) => d.pass);
  let reason = null;
  if (!found.length) reason = 'no element is marked data-device: name the material in the concept and draw it in the page';
  else if (!pass) reason = `a material has to be on the first screen and in ${MIN_DEVICE_SECTIONS - 1} more sections (or run down most of the page)`;
  return { pass, found, reason };
}

// pages: [{ label, traits }]. starters: [{ label, traits }]. Returns every pair that shares a frame.
export function judgeFrames(pages, starters = [], threshold = SAME_FRAME) {
  const pairs = [];
  for (let i = 0; i < pages.length; i++) for (let j = i + 1; j < pages.length; j++) pairs.push({ a: pages[i].label, b: pages[j].label, ...similarity(pages[i].traits, pages[j].traits) });
  const starter = pages.map((page) => {
    const scored = starters.map((s) => ({ page: page.label, starter: s.label, ...similarity(page.traits, s.traits) }));
    return scored.sort((x, y) => y.score - x.score)[0];
  }).filter(Boolean);
  return { threshold, pairs, starter, same: pairs.filter((p) => p.score >= threshold), unchanged: starter.filter((s) => s.score >= threshold) };
}
