// Judge the raw measurements from the page. No browser needed.
import { over, ratio, required } from './contrast.mjs';

export function judge(raw, { width }) {
  const mobile = width < 700;
  const problems = [];
  const seen = new Set();
  for (const t of raw.text) {
    if (t.unknown) continue; // over an image or gradient: needs eyes
    const fg = t.fg[3] < 1 ? over(t.fg, t.bg) : t.fg.slice(0, 3);
    const r = ratio(fg, t.bg);
    const need = required(t.size, t.weight);
    const key = `${t.where}|${t.text}`;
    if (r < need && !seen.has(key)) {
      seen.add(key);
      problems.push({ kind: 'contrast', where: t.where, detail: `${r.toFixed(2)}:1, needs ${need}:1 ("${t.text}")` });
    }
    if (t.size < (mobile ? 11 : 12) && !seen.has(`size|${key}`)) {
      seen.add(`size|${key}`);
      problems.push({ kind: 'small text', where: t.where, detail: `${t.size}px ("${t.text}")` });
    }
  }
  const minTarget = mobile ? 44 : 24;
  for (const t of raw.targets) {
    if (t.inline) continue;
    if (t.width < minTarget || t.height < minTarget) {
      problems.push({ kind: 'touch target', where: t.where, detail: `${t.width}x${t.height}px, needs ${minTarget}x${minTarget}${t.label ? ` ("${t.label}")` : ''}` });
    }
  }
  for (const n of raw.names) problems.push({ kind: 'name', where: n.where, detail: n.problem });
  if (!raw.lang) problems.push({ kind: 'document', where: 'html', detail: 'no lang attribute' });
  if (!raw.viewport) problems.push({ kind: 'document', where: 'head', detail: 'no viewport meta tag' });
  if (raw.h1 !== 1) problems.push({ kind: 'document', where: 'h1', detail: `${raw.h1} h1 elements (expected 1)` });
  if (raw.sideways) problems.push({ kind: 'layout', where: 'page', detail: 'scrolls sideways' });
  const unknown = raw.text.filter((t) => t.unknown).length;
  return { problems, unknown };
}

export function format({ problems, unknown }, width) {
  const lines = [`Width ${width}px`];
  if (!problems.length) lines.push('  No problems found.');
  const by = new Map();
  for (const p of problems) {
    if (!by.has(p.kind)) by.set(p.kind, []);
    by.get(p.kind).push(p);
  }
  for (const [kind, items] of by) {
    lines.push(`  ${kind} (${items.length})`);
    for (const i of items.slice(0, 5)) lines.push(`    ${i.where}  ${i.detail}`);
    if (items.length > 5) lines.push(`    and ${items.length - 5} more`);
  }
  if (unknown) lines.push(`  ${unknown} text element(s) sit on an image or gradient: check by eye.`);
  return lines.join('\n');
}
