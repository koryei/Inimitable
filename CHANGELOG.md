# Changelog

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
