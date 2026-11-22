<h1 align="center">Inimitable</h1>

<p align="center"><strong>Design that looks like it was made on purpose.</strong><br>
A skill for coding agents that builds and fixes interfaces until they look right the first time you see them.</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-Apache--2.0-24292f?style=flat" alt="Apache 2.0"></a>
  <img src="https://img.shields.io/badge/node-22%2B-24292f?style=flat" alt="Node 22+">
  <img src="https://img.shields.io/badge/dependencies-none-24292f?style=flat" alt="No dependencies">
  <img src="https://img.shields.io/badge/surfaces-web%20%C2%B7%20landing%20%C2%B7%20terminal%20%C2%B7%20mobile-24292f?style=flat" alt="Surfaces">
</p>

---

Ask an agent for a screen and you usually get the same one: a purple gradient, a glowing badge, an emoji on every label, spacing nobody chose. It works, and it looks like everything else.

Inimitable changes what happens between your request and the result. The agent reads your project first, decides what the screen is for, builds it section by section, then **opens it in a real browser at four sizes, measures it, and fixes what it finds before it shows you anything.** What you get back is something you only have to give taste feedback on.

```text
> Redesign the Activity screen so it stops looking generated.

  Read     found your brand guide and tokens; 31 font sizes, 9 radii, 64% of spacing off-grid
  Mode     Operate
  Direction  calm and exact; never glowing or decorated
  Fix      spacing → colour → icons → copy → type → layout → details → motion
  Gate     lint, types, tests green; drift 31 → 6 sizes, 9 → 3 radii, 100% on grid
  Look     320 · 390 · 1440 · 2560 px, two rounds, nothing left over
```

## What it does for you

- **Respects what you already have.** Your brand guide, tokens and design notes outrank its own taste. It never repaints a product in a style that isn't yours.
- **Decides, doesn't interrogate.** A vague request gets one stated reading and a start, not a list of questions.
- **Fixes in a fixed order.** Spacing, colour, icons, copy, type, layout, details, motion. Each layer across the whole screen before the next, so fixes never fight each other.
- **Builds around one idea.** Every new screen has one thing that is clearly the star, and everything else steps back. For a brand with no accent colour, the star is made from size and contrast.
- **Measures instead of guessing.** Included scripts count the font sizes, radii, colours and spacing values actually in use, and check contrast and tap-target size.
- **Looks before it shows.** It renders the real screen at 320, 390, 1440 and 2560 px (terminal UI at its narrow and wide column counts) and fixes up to three rounds of problems.
- **Reports in plain words.** Short, and it names anything it could not fix.

## What it covers

| Surface | What it is tuned for |
| --- | --- |
| **Web apps and dashboards** | Density, scanning, consistent controls, honest states: empty, loading, error. |
| **Landing and marketing pages** | One clear promise, one visual that shows something true, one action. |
| **Reading and docs** | Comprehension first, then a reading experience worth staying in. |
| **Showpieces and portfolios** | The work leads from the first screen and the interface recedes. |
| **Terminal UI** | Colour and type only, narrow and wide columns, no images. |
| **Native mobile** | iOS and Android conventions, touch targets, platform motion. |

## Install

```bash
git clone https://github.com/koryei/Inimitable.git
cd Inimitable && ./install.sh
```

`install.sh` links the folder into `~/.claude/skills/inimitable`, so `git pull` updates it in place. For other agents that read `SKILL.md` skills, link or copy the folder into their skills directory.

**Needs:** Node 22 or newer, and an installed Chrome, Edge or Chromium (set `CHROME_PATH` if it is somewhere unusual). No packages to install and no API keys.

## Use it

Just describe the job. The skill loads itself when the work is design.

```text
Build a pricing page for this app.
Fix the settings screen. It looks generated.
Make the CLI output look designed.
Polish the onboarding flow on phone and desktop.
```

## The tools

Plain Node scripts, no dependencies. The agent runs them for you, and you can run them yourself.

| Script | What it does |
| --- | --- |
| `scripts/shoot.mjs <url or file>` | Screenshots at 320, 390, 1440 and 2560 px. Flags sideways scrolling and console errors. |
| `scripts/drift.mjs <url or file>` | Counts the font sizes, weights, radii, colours and spacing values in use, and flags drift. `--save` and `--against` give a before and after. |

More are coming: a contrast and tap-target check, a scan for machine-made tells, and a terminal screenshot tool.

## License

Apache 2.0. See [`LICENSE`](LICENSE) and [`NOTICE.md`](NOTICE.md) for credits.
