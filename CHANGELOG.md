# Changelog

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
