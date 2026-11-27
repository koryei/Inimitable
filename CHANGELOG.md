# Changelog

## 0.10.0

Driven by round 7 and a second opinion from a stronger model: the skill's own taste rules banned or penalised the moves that made the baseline pages memorable. **Not yet evaluated:** nothing here shows the pages are now more distinctive.

- **Pages that persuade may shout.** On `data-mode="persuade"` or `experience`, heavy weights and tracked capitals are no longer tells or drift flags; italic, full stops, strong colour and long headlines are allowed when the concept chooses them. Working screens keep every rule.
- **A seven-line concept:** adds one headline move only this product's headline could make, and a voice (face, weight, case, loudness). "Keep the rest calm" is gone.
- **Three display voices** under the Open Font Licence: Bricolage Grotesque, Newsreader (with italic) and Big Shoulders Display, beside Geist. `scaffold --kind base` now requires `--voice` and `--weight`, and writes letter spacing measured for that face and weight.
- **The base lost its house furniture:** no button arrow, no monospace captions, no dimmed second headline line.
- **Gate guidance:** the checks find faults in a chosen design; do not design toward the score.

## 0.9.0

Driven by round 6, where skilled pages lost on distinctiveness because they shared one frame.

- **A base starter** (`scaffold --kind base`): type with tracking by size, controls, colour, motion kit and fonts, and no layout. New landing pages start here; the full landing starter is for a brief that asks for the standard page.
- **A five-line concept:** the layout is taken from the shape of the product's artifact, and one material (`data-device`) runs through the page.
- **A frame check** (`scripts/frame.mjs`): compares a page's skeleton with the landing starter and with sibling pages, and requires the material to run through.
- **Examples replaced.** The skill's text had used all three eval products as examples, and only the skilled arm read it. Corrected in the round 6 write-up too.
- **Round 7, and what it found.** The skilled pages **still did not beat the baseline**: judged more swappable in 6 of 8 judgements and remembered in 2 of 8, tied on ownability, ahead on design quality (4 against 2). All three judges grouped all four skilled pages as one hand: the base's typeface, button arrow and captions. The frame check passed them all, so it does not catch that. Details and limits in `evals/results/2026-11-26-r7.md`.
- **Fixes:** `--accent` on the base writes the colour given and warns when it is too faint; the base's first and last blocks no longer override a page's own layout.

## 0.8.0

Driven by the verdicts "good but replaceable" and "nothing sets this apart". The craft floor was solid; the weak point was that pages were their own skeleton and nothing else. The skill now makes an agent decide what is ownable before it builds, and gives it grounds and artwork that are not the default.

- **A concept step** inside step 3 (the run is still nine steps): the product's native artifact and its moment of value, the first screen described without the category word, and one signature (an artwork or an interaction) with everything else calm, written as three lines. The report and the log carry it.
- **The swap-the-name test** (`scripts/swap.mjs`, and a required one-line answer at the gate). With the product name removed, does the first screen still use the nouns of the product's own subject, and does its artwork name them? It refuses nouns that fit any product. It checks that, and only that: a pass is not a verdict on the picture, which is why the gate also asks for a sentence.
- **First-class grounds.** The soft grainy gradient is now described, everywhere it is taught, as the default of machine-built pages that needs a reason in the concept. `scaffold --ground flat` (one saturated colour: `--palette cobalt`, `mint` or `sand`) and `--ground frame` (a dark rounded panel set into the page) are built, tested and sit beside it in a choose-the-ground table in `directions.md`.
- **A card hero** (`--hero card`): a centred headline, then the product card cropped by the bottom of the first screen, with a thin traced diagram behind it and annotation chips with pointer arrows on it.
- **Duotone prints with no photograph** (`assets/recipes/duotone.mjs`): five computed subjects (column, vase, sphere, drape, strata) as a halftone, an engraving or a dither in two colours, or your own field. `scaffold --art` puts one in the split hero as a stand-in; `dotify.mjs --mode lines` engraves any picture. One subject drawn in testing (hills) read as a flat slab and was dropped.
- **Annotation and headline helpers** (`annotate.mjs`, `headline.mjs`): chips, a connecting-line diagram, a lighter-tint word inside a headline, and big figures with grey decimals.
- **Tracking follows size.** The starter set -0.055em on a 48 px phone headline, while `house-rules.md` said -0.02em from 40 px and `landing-craft.md` said -0.04 to -0.06em. `evals/tracking.mjs` now measures real letter gaps in Chrome, and the guidance is one table by size. Both numbers were right at their own size. Instrument Serif takes no tightening at all. The starter steps its tracking by width, and a test holds it to the measurement at six widths (it fails on the old CSS).
- **Round 6, and what it found.** `evals/mask.mjs` renders a page with the product name masked (and, optionally, the text blurred) for blind judging; briefs 13 (a product with an obvious native artifact) and 14 (a dull one). Two judge agents compared the skilled and baseline pages for three products. The skilled pages won on the mechanical checks (89 against 43 mean) and **lost on distinctiveness in all six judgements**: the three skilled pages shared one frame (pill nav, sand hero, steps, price band), while the baselines carried the product's own material through the whole page. `swap.mjs` passes every page, so it does not catch that. The write-up (`evals/results/2026-11-25-r6.md`) lists the limits and what to change next; none of those changes is in this release.
- **Fixes from the builders' reports.** `shoot.mjs --full` scrolls the page through first, so scroll-revealed sections are in the picture. `swap.mjs` counts a framed box built from HTML as artwork (it first failed two baselines whose picture was HTML). `direction.md` says its concept example is an example, because three of three agents copied its ground. `landing-craft.md` notes that the starter's mobile rules are overridden by a later rule with the same selector.

## 0.7.0

- **The website is rebuilt on the skill's own landing starter** and set in a type system (five working sizes, four display sizes, roles not sizes). It ships the same motion kit, fonts and lit ground it teaches, and passes `signs`, `check` and `craft` at all four widths.
- **The README is rewritten** in plain sentence-case copy with typographic punctuation, a defined term, a starters section and a tools table with flags.

Built from using the skill's own starters on real briefs and fixing what the tools found.

- **An app starter** (`scripts/scaffold.mjs <folder> --kind app`): sidebar that becomes a menu on a phone, header with one primary action, four key numbers, one chart with an "example data" label, a table whose status is a word and a dot, an empty state, hover, focus and press on every control. Dark and light, tested at 320, 390, 1440 and 2560.
- **`--minimal`** for the landing starter: a short brief keeps the hero, steps, closing call and footer, and nothing is left to delete. Cut sections take their links with them.
- **A seventh ground, `contour`**: topographic lines over a soft pool of light, high in the frame so the headline stays on quiet ground.
- On light grounds the counterpoint colour is a hint, so blob and pool grounds no longer read as paint. On a phone the split hero's object is a short wide card, so the headline starts higher.
- Tool fixes: a button or link saying "New record" is no longer called a "New" badge; the link to the current page may stay still under `craft`; `craft --shots` waits for the previous hover to settle before the rest picture; a flaky tilt test now polls.
- Docs: `shoot --slices`, `inline --out`, the two type tiers (working scale and display), and the stacking-context pitfall for grounds. Eval write-ups for rounds 4 and 5.

## 0.6.0

Driven by your note that the work was clean but static, with nothing that set it apart, and by a head-to-head on a brief about an AI product (see `evals/results/`).

- **Motion kit** (`assets/motion/`): masked headline entrance, ordered `data-enter`, scroll reveal, split text, count-up, magnetic and tilting elements, a pointer spotlight, marquee, drawn strokes, sweep buttons with a sliding arrow, link underlines that draw, a nav that settles. Every behaviour is proven in a browser, has a reduced-motion path, and a page whose script fails still reads. Two real bugs found by the tests and fixed: an element near the end of a page could never reveal, and a pointer that jumped into an element was ignored.
- **Grainients in code** (`assets/recipes/mesh.mjs`): six light shapes (pools, horizon, bowl with a luminous rim, blob, sweep, rays), motes, nine palettes, `fromAccent`, and an audit that refuses colour that reads as paint. Every shape is rendered and measured in a browser.
- **A tested landing starter** (`assets/starters/landing/`, `scripts/scaffold.mjs`): lit ground, floating nav, product frame, unequal bento, steps, one big number, closing call, footer; dark, light and a split hero with a slot for the one object only the product has. Driven end to end in a browser in three variants.
- **Open fonts** (`assets/fonts/`): Geist, Geist Mono and Instrument Serif under the Open Font Licence.
- **Real libraries** (`scripts/lib-add.mjs`): pulls Bencho, BoardUI, Aceternity or any shadcn-registry component as real source, files only, with the licence notice and the packages to install. Proven live against Bencho.
- **`scripts/inline.mjs`**: bundles a page into one self-contained file. **`evals/feel.mjs`**: measures entrance, scroll motion, hover, a lit ground and type scale, which the mechanical score cannot see.
- **`references/landing-craft.md`**: why the best landing pages work, ten decisions, with the kit piece that builds each and the script that catches each going wrong.
- Scanner and checker fixes: placeholders (`data-todo`), a pill badge above the headline, a gradient logo tile, aria-hidden decoration exempt from contrast, closed menus ignored by the hover audit; `check` defaults to four widths and `shoot` waits long enough for an entrance to finish.

## Unreleased

The skill taught rules but not reasons, and the site was clean and static. Both were rebuilt around why a screen feels made rather than assembled.

- `references/hover.md`: why a control has to answer the pointer, the mechanics of hover and press with exact values, the cheap-hover table, and how to test it.
- `references/materials.md`: surface, light and grain. The grainient recipe (radial stops, grain, mask) rebuilt in CSS rather than copied, plus glass, paper and metal, and what each costs to render.
- `references/devices.md`: fifteen structural moves that make a page memorable, each with the reason it works, the CSS to build it, and the way it fails. Read out of real pages and reduced to the mechanism, so they can be rebuilt in any palette.
- `references/surfaces/landing.md` rewritten around the argument a landing page has to make: the five-second test, the first screen, one thing, rhythm, proof, motion, material, the close.
- `references/motion.md`: landing and showpiece choreography, scroll reveals, marquee, parallax, and the one moment a page is allowed.
- `references/libraries.md`: how to take from a library (the mechanism, not the file), with Grainient and Construct as worked examples.
- `references/anti-slop.md`: licensed devices (a hue gradient, a radial wash, glass, parallax) and a hover-and-press section.
- `scripts/craft.mjs`: hovers every control with a real pointer and diffs the computed style, so a control that ignores the pointer fails rather than being missed. It also diffs the pixels, so a hover that changes a style nobody can see fails too. Also flags transitions on layout properties and motion that survives the reduced-motion setting. `--shots` writes a rest and hover crop per control.
- `scripts/lib/backdrop.mjs`: an icon beside the text is no longer sampled as the text's backdrop.
- `scripts/lib/chrome.mjs`: `screenshot()` honours a clip region.
- `scripts/lib/probe.mjs`: italic emphasis is only a tell below 24px, and `[data-loop]` licenses an infinite animation.
- The site is rebuilt as an editorial page: a lit ground, Instrument Serif for the statements, one accent, a choreographed entrance, scroll reveals, and a designed hover and press state on every control. It is published only after passing `signs`, `check` and `craft`.
- The site counts itself and prints the receipt under the hero: font sizes, text colours, radii and spacing values, measured with the same probe `drift.mjs` runs, so the page and the tool cannot disagree. The numbers are authored in the markup so they are right without JavaScript, and a test fails if either the markup or the probe drifts.
- The site's own review pass, done by eye at 1440 and 390: the gallery captions and the limits note are held to the page's measure, the two install cards line up their Copy buttons and their notes, the footer credit is set as a sentence instead of three lines of tracked caps, the hero frame crops between two table rows instead of through one, the nine steps carry serif numerals so the run reads as a sequence, and the questions section opens its first answer.

## 0.5.0

- Published to the skills directory: `npx skills add koryei/Inimitable` works, and the skill is listed on skills.sh. The `SKILL.md` description is now a YAML block scalar, because the skills CLI parses frontmatter strictly and rejected the old one. A test keeps it parseable.
- A website at koryei.github.io/Inimitable, built with the skill's own instrument kit and recipes and published only after it passes the skill's own checks (`site/`, `.github/workflows/pages.yml`).
- `dotify.mjs --invert` now draws the light parts of the picture; by default the dark parts become dots (it was effectively a no-op before).
- `check.mjs` hides text without transitions while sampling backgrounds, and skips pixel sampling on a page that scrolls sideways instead of adding false contrast flags.

## 0.4.1

From round 3 (`evals/results/2026-11-22-r3.md`).

- `dotify.mjs` handles bare SVGs and photos (a real wrapper file, not a `data:` page) and short subjects.
- Hex and halftone output is compact: dots share round-capped strokes by size.
- `dissolve()` makes a picture break into noise along an axis.
- `instrument.css` is in rem and scales on big screens with `html.inst-scale`.
- Build guidance for actions with nothing to connect to; type guidance per direction.

## 0.4.0

Driven by a reference set of technical landing pages (dotted and dithered hero objects, HUD annotation, corner brackets, isometric line art, gradient horizons).

- `references/directions.md`: a library of committed looks (Instrument dark and light, Blueprint, Horizon, Dithered data, Warm editorial), the grammar they share, the hero-object pipeline, an honesty rule for annotation and a legibility floor.
- `scripts/dotify.mjs` and `assets/recipes/dither.mjs`, `fields.mjs`: turn any image, drawn SVG or maths into ordered or error-diffusion dither, stipple, halftone, hex cells or ASCII.
- `assets/recipes/hud.mjs`, `iso.mjs`, `instrument.css`, `instrument-demo.mjs`: callouts, corner brackets, crosshairs, rulers, tags, readouts; isometric boxes and exploded stacks; a CSS kit for bracket buttons, micro type, stat strips, grid and hatch grounds, ticker and a grain-textured horizon; a dark and light demo.
- `signs.mjs --allow` and `score.mjs --allow`: a committed direction can license named devices. Display headlines may end in a full stop.
- Anti-slop now distinguishes habit (a tell) from a committed, named, consistent device (a choice).

## 0.3.0

Driven by two rounds of testing the skill against a no-skill baseline on eight briefs (`evals/results/`).

- `references/principles.md`: the reason under every rule (perception, grouping, type, colour, feedback, trust).
- `references/visual-craft.md` and `assets/recipes/`: how to find and draw the one rich moment in code. Generators for contour lines (stitched), stones, turned vessels, dot fields and grain, all tested.
- `scripts/score.mjs` and `evals/`: briefs, a mechanical score, a visual rubric, blind comparison, and the written results of each round.
- `check.mjs` now reads contrast from rendered pixels, so gradients, images and pseudo-element backgrounds are judged and sticky overlays are not mistaken for backdrops. It counts only visible headings.
- `shoot.mjs` gains `--eval`, `--wait` and `--slices`. `drift.mjs` allows a mono partner and treats code, accent and semantic colours fairly.
- Skill changes: a no-stall path when nobody can answer, big-screen scaling, system font stacks, state and preview-switcher guidance, never invent facts the brief omits.

## 0.2.0

- `references/feels-cheap.md`: a six-area checklist for what makes an app feel cheap (guidance and trust, feedback and errors, loading, data and retention, consistency, permissions and navigation).
- `references/components.md`: what a finished component does, state by state, for inputs, overlays, navigation, data display, feedback, chat and settings.
- `references/motion.md`: motion recipes with origin, timing, tokens and reduced-motion rules.
- `references/libraries.md`: a catalogue of component and motion sources and of places to study real products, with the rules for taking from them.
- `signs.mjs` now finds vague button labels and vague error messages. `check.mjs` now finds controls with no visible focus style and images that reserve no space.
- The Build and Look steps load the new references.

## 0.1.0

First release.

- The nine-step run in `SKILL.md`: read, decide the mode, fix the direction, branch, build, gate, look, report, log.
- Five modes: Persuade, Operate, Read, Experience, Terminal.
- Reference files for every step, eight repair layers, house rules, the list of machine-made tells, and rules for web apps, landing pages, reading, showpieces, terminal UI, iOS and Android.
- Five dependency-free scripts: `shoot`, `drift`, `signs`, `check`, `term-shot`.
- `install.sh` to link the skill into Claude Code, Codex or any `SKILL.md` folder.
- Two worked examples with measured before and after: a landing page and a terminal command.
