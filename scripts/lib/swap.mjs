// The swap-the-name test, as far as a script can honestly run it.
//
// The question: take the product name off the first screen. Does it still say something only this product could
// say? A script cannot judge taste, so it checks one narrow thing. The agent declares the nouns of the product's
// own subject (the native artifact from the concept: "tide", "harbour", "launch", "depth"), and this checks that
// the first screen uses them, and that the artwork (not only the headline) is about them.
//
// It cannot tell a good picture from a bad one, and an agent can declare weak nouns. The generic list below
// refuses the obvious ones. A pass means "the first screen names the product's own things", never "it is distinctive".

// Words every product in a category could say. They are refused as declared nouns, and a headline that leans on
// them is reported (never failed): the headline may still be fine if the artwork is owned.
export const GENERIC_NOUNS = [
  'product', 'products', 'app', 'apps', 'platform', 'platforms', 'tool', 'tools', 'software', 'solution', 'solutions',
  'service', 'services', 'system', 'systems', 'team', 'teams', 'business', 'businesses', 'company', 'companies',
  'data', 'insight', 'insights', 'workflow', 'workflows', 'dashboard', 'dashboards', 'user', 'users', 'customer',
  'customers', 'client', 'clients', 'ai', 'automation', 'integration', 'integrations', 'analytics', 'management',
  'enterprise', 'enterprises', 'everything', 'work', 'results', 'future', 'world', 'way', 'time', 'life', 'smart',
];

export const CATEGORY_PHRASES = [
  'platform', 'solution', 'solutions', 'all-in-one', 'ai-powered', 'ai-driven', 'workflow', 'workflows',
  'modern teams', 'modern enterprises', 'smarter', 'insights', 'everything you need', 'one place', 'seamless',
  'streamline', 'empower', 'empowering', 'supercharge', 'next-generation', 'reimagine', 'transform your',
];

const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const normalise = (s) => String(s || '').toLowerCase().replace(/[’']/g, "'").replace(/\s+/g, ' ').trim();

export function parseNouns(value) {
  return String(value || '')
    .split(/[,;\n]/)
    .map((n) => normalise(n))
    .filter(Boolean);
}

// Which declared nouns appear in a piece of text (whole words, a plural allowed).
export function nounsIn(text, nouns) {
  const t = normalise(text);
  return nouns.filter((n) => new RegExp(`(^|[^a-z0-9])${escape(n)}(s|es)?(?![a-z0-9])`, 'i').test(t));
}

// Strip every occurrence of the product name, so the test is about everything except the name.
export function withoutName(text, name) {
  if (!name) return normalise(text);
  return normalise(String(text || '').replace(new RegExp(escape(name), 'gi'), ' '));
}

// first: { headline, artwork, copy, hasArtwork } from the first screen. Returns the verdict and the reasons.
export function judge({ name, nouns, first, typographic = false, minNouns = 2 }) {
  const reasons = [];
  const declared = [...new Set(nouns)];
  const refused = declared.filter((n) => GENERIC_NOUNS.includes(n));
  const usable = declared.filter((n) => !GENERIC_NOUNS.includes(n));
  const empty = { headline: [], artwork: [], copy: [], all: [] };
  if (refused.length) reasons.push(`"${refused.join('", "')}" fit any product in the category. Declare the things only this product makes or handles.`);
  if (usable.length < minNouns) {
    reasons.push(`Declare at least ${minNouns} nouns from the concept's native artifact (got ${usable.length}).`);
    return { pass: false, reasons, found: empty, usable, refused, category: [] };
  }
  const headline = withoutName(first.headline, name);
  const artwork = withoutName(first.artwork, name);
  const copy = withoutName(first.copy, name);
  const found = { headline: nounsIn(headline, usable), artwork: nounsIn(artwork, usable), copy: nounsIn(copy, usable) };
  found.all = [...new Set([...found.headline, ...found.artwork, ...found.copy])];
  const category = CATEGORY_PHRASES.filter((p) => new RegExp(`(^|[^a-z])${escape(p)}`, 'i').test(headline));

  if (found.all.length < minNouns) reasons.push(`With the name removed, the first screen uses ${found.all.length} of the product's own nouns (${found.all.join(', ') || 'none'}). It needs ${minNouns}.`);
  if (typographic) {
    if (found.headline.length + found.copy.length < 1) reasons.push("A type-led first screen has to put the product's own words in the headline or the line under it.");
  } else if (!first.hasArtwork) {
    reasons.push('No artwork on the first screen (no figure, drawing, image or product frame), so only the skeleton is left. Add the signature from the concept, or pass --typographic if the headline is the signature.');
  } else if (!found.artwork.length) {
    reasons.push("The artwork says nothing about the product's own things: no declared noun appears in its text, labels or accessible description. Draw the artifact, or describe it (aria-label, alt, figcaption).");
  }
  return { pass: reasons.length === 0, reasons, found, usable, refused, category };
}
