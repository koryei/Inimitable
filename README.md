<h1 align="center">Inimitable</h1>

<p align="center"><strong>Design that looks like it was made on purpose.</strong><br>
A skill for coding agents that builds and repairs interfaces until they look right the first time you see them.</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-Apache--2.0-24292f?style=flat" alt="Apache 2.0"></a>
  <img src="https://img.shields.io/badge/node-22%2B-24292f?style=flat" alt="Node 22+">
  <img src="https://img.shields.io/badge/dependencies-none-24292f?style=flat" alt="No dependencies">
  <a href="https://skills.sh/koryei/inimitable"><img src="https://skills.sh/b/koryei/Inimitable" alt="skills.sh installs"></a>
  <a href="https://koryei.github.io/Inimitable/"><img src="https://img.shields.io/badge/website-koryei.github.io%2FInimitable-24292f?style=flat" alt="Website"></a>
  <a href="CHANGELOG.md"><img src="https://img.shields.io/badge/changelog-view-24292f?style=flat" alt="Changelog"></a>
</p>

<p align="center">
  <img src="examples/landing/before-1440.jpg" width="49%" alt="A landing page as a model usually builds it: purple gradients, glowing pills, emoji">
  <img src="examples/landing/after-1440.jpg" width="49%" alt="The same page after Inimitable: calm, specific, one clear visual">
</p>
<p align="center"><sub>Same product, same content. Left: what you get when nobody decides anything. Right: after one run. <a href="examples/landing">Both pages and the measurements are in the repo.</a></sub></p>

---

Ask an agent for a screen and you usually get the same one: a purple gradient, a glowing badge, an emoji on every label, spacing nobody chose. It works, and it looks like everything else.

Inimitable changes what happens between your request and the result. The agent reads your project first, decides what the screen is for, builds it section by section, then **opens it in a real browser at four sizes, measures it, and fixes what it finds before it shows you anything.** What you get back is something you only have to give taste feedback on.

## What it does for you

- **Respects what you already have.** Your brand guide, tokens and design notes outrank its own taste. It never repaints a product in a style that isn't yours.
- **Decides, doesn't interrogate.** A vague request gets one stated reading and a start, not a list of questions.
- **Fixes in a fixed order.** Spacing, colour, icons, copy, type, layout, details, motion: each layer across the whole screen before the next, so fixes never fight each other.
- **Builds around one star.** Every new screen has one thing that is clearly the point, and everything else steps back. A brand with no accent colour makes its star with size and contrast.
- **Measures instead of guessing.** Included scripts count the font sizes, radii, colours and spacing values actually in use, find the tells of machine-made UI, and check contrast and touch targets.
- **Looks before it shows.** It renders the real screen at 320, 390, 1440 and 2560 px (terminal UI at 60 and 120 columns) and fixes up to three rounds of problems.
- **Knows what makes an app feel cheap.** Silent failures, dead-end empty states, vague errors, permission prompts before value, truncated text that matters: it walks a six-area checklist on the running screen, not just the pixels.
- **Knows where good parts live.** A catalogue of component, motion and design-system sources (Bencho, Transitions.dev, BoardUI, Astryx, Aceternity, ObsidianUI, HorizonX) and where to study real products (Mobbin, 21st.dev, react.dev), with the rules for taking from them: ask first, check the licence, re-skin to your tokens.
- **Reports in plain words.** Short, with real before and after numbers, and it names anything it could not fix.

## What it covers

| Surface | What it is tuned for |
| --- | --- |
| **Web apps and dashboards** | Density, scanning, familiar controls, and honest empty, loading and error states. |
| **Landing and marketing pages** | One clear promise, one visual that shows something true, one action. |
| **Reading and docs** | Comprehension first, then a reading experience worth staying in. |
| **Showpieces and portfolios** | The work leads from the first screen and the interface recedes. |
| **Terminal UI** | Result first, colour that means something, width discipline, works without colour. |
| **Native mobile** | iOS and Android conventions, touch targets, platform motion and accessibility. |

## See it work

**Technical landing pages in the instrument style.** A dotted, annotated hero object, corner brackets, `//` labels, one accent, and every label marked as an example. Two briefs with strict no-invention rules: [encrypted messaging](examples/instrument-messaging) (68 → 100) and [an AI accelerator chip](examples/instrument-chip) (43 → 94).

<p align="center">
  <img src="examples/instrument-messaging/with-skill-1440.jpg" width="49%" alt="An encrypted messaging page: an example message in dotted letters dissolves into noise, with numbered pins">
  <img src="examples/instrument-chip/with-skill-1440.jpg" width="49%" alt="An AI accelerator page: a halftone M.2 card with callouts and a ruler">
</p>

**A dashboard.** 75 tells (9 kinds) down to none. Spacing values off the 4 px grid 15 → 0, weights 3 → 2, colour hues 6 → 2, and it no longer scrolls sideways on a phone. The first attempt failed three of the skill's own checks; the look step caught and fixed them. [Open the example.](examples/dashboard)

<p align="center">
  <img src="examples/dashboard/before-1440.jpg" width="49%" alt="A dashboard with glowing gradient cards, emoji navigation and rainbow bars">
  <img src="examples/dashboard/after-1440.jpg" width="49%" alt="The same dashboard: graphite, one main chart, numbers that carry their comparison">
</p>

**A landing page.** 12 kinds of machine-made tell (36 in all) down to none. Font sizes 9 → 6, weights 4 → 2, spacing values off the 4 px grid 15 → 0. [Open the example.](examples/landing)

**A terminal command.** Same information, result first: 13 lines to 7, 14 emoji to none, no wrapped lines at 60 columns, readable with colour switched off. [Open the example.](examples/terminal)

<p align="center">
  <img src="examples/terminal/before-60.jpg" width="49%" alt="Deploy output with a banner box, emoji and wrapped lines">
  <img src="examples/terminal/after-60.jpg" width="49%" alt="The same output, result first, no emoji, nothing wrapped">
</p>

## Install

```bash
npx skills add koryei/Inimitable
```

That uses the [skills CLI](https://skills.sh) and installs into Claude Code, Codex, Cursor and the other agents you have (add `-g` to install for every project, `-a claude-code` to pick one agent). It is listed on [skills.sh](https://skills.sh/koryei/inimitable).

Prefer a clone you can `git pull`?

```bash
git clone https://github.com/koryei/Inimitable.git
cd Inimitable && ./install.sh
```

`install.sh` links the folder into `~/.claude/skills/inimitable`. Use `--codex` for Codex, `--dir <path>` for any agent that reads `SKILL.md` folders, `--check` to test your setup, `--uninstall` to remove it.

**Needs** Node 22 or newer and an installed Chrome, Edge or Chromium (set `CHROME_PATH` if it is somewhere unusual). Terminal screenshots also use Python 3, which macOS and most Linux already have. No packages to install and no API keys.

## Use it

Describe the job. The skill loads when the work is design.

```text
Build a pricing page for this app.
Fix the settings screen. It looks generated.
Make the CLI output look designed.
Polish the onboarding flow on phone and desktop.
Review this screen against our brand guide.
```

## How a run goes

| | Step | What happens |
| --- | --- | --- |
| 1 | **Read** | Finds your design rules, sees the screens running, measures the drift. |
| 2 | **Decide the mode** | Persuade, Operate, Read, Experience or Terminal: what the person is doing here. |
| 3 | **Fix the direction** | Five lines on what it should feel like and what it must never look like. |
| 4 | **Branch** | Repair an existing screen layer by layer, or build a new one around one star. |
| 5 | **Build** | One section at a time, from your own components, with every state designed. |
| 6 | **Gate** | Your lint, types and tests, then measured contrast, target size and tell checks. |
| 7 | **Look** | Renders at four widths, fixes what shows, up to three rounds. |
| 8 | **Report** | Short and honest, with real before and after numbers. |
| 9 | **Log** | Lessons go into your project's notes. The skill never changes itself. |

## The tools

Plain Node scripts, no dependencies. The agent runs them for you, and you can run them yourself on any page or file.

| Script | What it does |
| --- | --- |
| `scripts/shoot.mjs <url or file>` | Screenshots at 320, 390, 1440 and 2560 px. Flags sideways scrolling and console errors. `--eval` puts the page in a state first, `--slices` captures every screenful, `--wait` lets animations finish. |
| `scripts/drift.mjs <url or file>` | Counts the font sizes, weights, radii, colours and spacing values in use and flags drift. `--save` and `--against` give a before and after. |
| `scripts/signs.mjs <url or file>` | Finds machine-made tells in the rendered page: hue gradients, glows, emoji, hype words, unverified claims, looping animation and more. `--allow` licenses devices a committed direction uses on purpose. |
| `scripts/check.mjs <url or file>` | WCAG contrast read from the rendered pixels (so gradients, images and pseudo-element backgrounds are judged too), touch-target size, small text, missing names, visible focus styles, images that cause layout shift, and document basics, at phone and desktop widths. |
| `scripts/craft.mjs <url or file>` | Hovers every control with a real pointer and diffs the computed style, so a control that ignores the pointer is caught rather than missed. Also flags transitions on layout properties and motion that keeps running when the reduced-motion setting is on. `--shots` writes a rest and hover crop for each control. |
| `scripts/dotify.mjs <image or svg>` | Turns any picture or drawn SVG into dithered, halftone, hex-dot or ASCII art for a hero object. |
| `scripts/score.mjs <url or file>` | Runs every check and prints one score out of 100 with what cost points. |
| `scripts/term-shot.mjs -- <command>` | Runs a terminal program at a set width in a real pseudo-terminal and captures text and an image. |

`shoot`, `signs`, `check`, `craft` and `term-shot` exit non-zero when they find a problem, so they also work as gates in CI.

## What is in the box

```text
SKILL.md                 the nine-step run
references/
  read.md … lessons.md   one file per step
  house-rules.md         default numbers for projects with no rules of their own
  anti-slop.md           the tells, each with its fix
  principles.md          why design works: perception, grouping, type, colour, feedback, trust
  visual-craft.md        finding and drawing the one memorable moment in code
  directions.md          committed looks: instrument dark and light, blueprint, horizon, dithered data
  devices.md             fifteen structural moves that make a page memorable, each with the reason it works
  feels-cheap.md         trust, feedback, loading, retention, consistency, permissions
  components.md          what a finished component does, state by state
  motion.md              recipes for menus, modals, toasts, tabs and state changes
  hover.md               why a control has to answer, and the mechanics of hover and press
  materials.md           surface, light and grain: the ground a screen sits on
  libraries.md           where to take parts from, and the rules for taking them
  layers/                spacing, colour, icons, copy, type, layout, details, motion
  surfaces/              web app, landing, reading, showpiece, terminal, iOS, Android
assets/recipes/          generators and kits, all tested: contours, stones, vessels, dither and halftone, HUD callouts, isometric art, the instrument CSS kit
scripts/                 the measuring tools above, plus score.mjs and craft.mjs
evals/                   briefs, scoring and the protocol used to test and improve the skill
examples/                real before and after runs
```

## Questions

**Will it override my brand?** No. Your own rules win over everything in the skill. Where a tell is part of your brand (a gradient in your logo), say so once and it is kept.

**Does it need an image generator?** No. It builds visuals in code, and where an image would help it writes the prompt and leaves a labelled slot.

**Does it work on existing apps?** Yes, that is the main use. It repairs a screen in your own stack and components, and leaves your product, content and order of sections alone.

**Does it work without a browser?** It can edit code, but then it says plainly that nothing was rendered. The look step and the measuring scripts need Chrome, Edge or Chromium.

**What does it cost?** Nothing to run: no services, no keys. It uses the tokens your agent already spends.

## Contributing

Found a tell it misses, a surface it handles badly, or a rule that backfired? Open an issue with a screenshot. See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

Apache 2.0. See [`LICENSE`](LICENSE) and [`NOTICE.md`](NOTICE.md) for credits.
