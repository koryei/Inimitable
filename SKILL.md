---
name: inimitable
description: Designs and repairs interfaces so they look made on purpose and right on first show. Builds new screens around one star, or fixes existing ones layer by layer (spacing, colour, icons, copy, type, layout, details, motion). Renders the real screen at 320, 390, 1440 and 2560 px, measures it, and fixes what it finds before showing the result. Use whenever the work is design or visual quality: build, redesign, restyle, polish, review or "make it look better" for web apps, dashboards, landing pages, docs, portfolios, terminal UI and native mobile (iOS, Android), or when a UI looks generated, templated, generic, or shows tells like purple gradients, glows, emoji labels, "New ✨" badges, uppercase tracked labels, uneven spacing or hype copy.
license: Apache-2.0
---

# Inimitable

Make the screen look decided. Not decorated: decided. Every size, colour, word and image is there on purpose, the product's own rules come first, and the result is checked in a real browser before the person sees it.

The bar: **it looks right on first show.** The person should only ever have to give taste feedback, never report a bug you could have seen yourself.

## The run

One fixed run for every request. Do the steps in order. Each step names the file to read; read it when you reach the step, not before.

| # | Step | What happens | Read |
| --- | --- | --- | --- |
| 1 | **Read** | Find the project's design rules, establish what is real, see the screens running, measure the drift | [references/read.md](references/read.md) |
| 2 | **Decide the mode** | Persuade, Operate, Read, Experience or Terminal: what the person is doing here | [references/modes.md](references/modes.md) |
| 3 | **Fix the direction** | Five lines: product, character, world, moments, signature. From the project's rules if it has them | [references/direction.md](references/direction.md) |
| 4 | **Branch** | Existing screen: repair layer by layer. New screen: build around one star | [fix.md](references/fix.md) or [build-new.md](references/build-new.md) |
| 5 | **Build** | One section at a time, from the project's own parts, with every state | [references/build.md](references/build.md) |
| 6 | **Gate** | The project's checks, then measured design checks | [references/gate.md](references/gate.md) |
| 7 | **Look** | Render at four widths, fix what shows, up to three rounds | [references/look.md](references/look.md) |
| 8 | **Report** | Short, plain, honest about what is left | [references/report.md](references/report.md) |
| 9 | **Log** | Project lessons into the project; skill lessons proposed, never self-applied | [references/lessons.md](references/lessons.md) |

Also load, as the work needs them: the surface file for the mode ([web-app](references/surfaces/web-app.md), [landing](references/surfaces/landing.md), [reading](references/surfaces/reading.md), [showpiece](references/surfaces/showpiece.md), [terminal](references/surfaces/terminal.md), [iOS](references/surfaces/native-ios.md), [Android](references/surfaces/native-android.md)); [house-rules.md](references/house-rules.md) for default numbers; [anti-slop.md](references/anti-slop.md) for the tells to remove.

## Rules that always hold

1. **The project's own rules win.** A brand guide, tokens, a design system or `DESIGN.md` outrank this skill's taste. Where they are silent, use `house-rules.md`. Where there are none at all, propose rules and a direction and wait for a yes.
2. **What exists is evidence, not approval.** Sloppy styling already in the code is never a rule.
3. **Decide, do not interrogate.** A vague request gets a one-line reading and a start. Ask only when a missing fact blocks the work. Never ask about colours, fonts or vibe.
4. **Keep the product.** Features, content and section order stay. Do not rename it, invent features, claims, data or customers.
5. **Never replace decoration with decoration.** Removing a tell leaves space; fill it with scale, real content, or nothing.
6. **Remove the tells** in `anti-slop.md` as part of the work. Say so only if it mattered.
7. **Reuse first.** The project's components, tokens and icon set. Add a new piece only when nothing fits, and name it.
8. **Look before you show.** Render the real screen at 320, 390, 1440 and 2560 px (terminal: 60 and 120 columns). Do not claim a width looks fine if you did not render it.
9. **Measure, do not guess.** Run the scripts. The report's numbers come from them.
10. **Be honest.** If a check fails, say so with the output. If a step was skipped, say that. If something is left over, list it.

## Tools

Plain Node 22+ scripts in `scripts/`, no installs, using the Chrome on the machine. Paths below are relative to this skill's folder.

| Script | Use |
| --- | --- |
| `scripts/shoot.mjs <url or file> --out shots --label before` | Screenshots at the four widths; flags sideways scroll and console errors |
| `scripts/drift.mjs <url or file> --save before.json` | Counts font sizes, weights, radii, colours, spacing in use; later `--against before.json` |
| `scripts/signs.mjs <url or file>` | Finds machine-made tells in the rendered page |
| `scripts/check.mjs <url or file>` | Contrast, touch-target size, small text, missing names |
| `scripts/term-shot.mjs -- <command>` | Runs a terminal command at a given width and captures text and image |

A page needs a URL or file path. For a project with a dev server, use its address; otherwise open the built HTML file.

## When something is missing

- **No browser found:** say which of Chrome, Edge or Chromium to install (or `CHROME_PATH`); until then, work from code and state plainly that nothing was rendered.
- **App cannot run:** reproduce the screen as one static HTML file and treat that as the original, saying so in the report.
- **Only a screenshot or a live URL:** rebuild it as static HTML first; the result is code for whoever owns the real site.
- **No image tool:** build visuals in code, write prompts for the rest, leave labelled slots.

## Scope of a run

Quick, not rushed. Render the work to check it at most three rounds (checking the files and scripts does not count). Start any long task (an image to generate, a dev server to boot) early and carry on with the first steps while it runs.

For small asks (one component, one tweak) run the same steps in miniature: read the local rules, measure the piece, fix, look at it, report in two lines.
