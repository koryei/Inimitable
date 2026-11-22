# Visual craft: the one rich moment

Removing the tells makes a screen clean. It does not make it memorable. In testing, pages built with the rules alone were tidy, honest and accessible, and still lost to a baseline page that simply **drew something**: a field of contour lines behind a note-taking app for ecologists, a cairn of stones for a habit tracker. A screen needs one moment of richness that only this product could have, and that moment has to be made, not skipped.

This file is how to make it without bringing the tells back.

## The idea first

Richness comes from an idea, not an effect. Find it in the subject inventory (`read.md`), then draw it.

1. **List what is native to the product's world**: objects, patterns, phenomena, materials, rituals. A field-research app has terrain, quadrats, contour lines, soil layers. A habit tracker has stacked stones, steps, a path. An invoicing tool has ledger rules, paper, stamps. An on-call tool has pulses, timelines, shifts. A recipe app has steam, plates, grain.
2. **Pick the one that can be drawn with a few shapes.** The test: could someone identify the product's world from the picture alone, with the name covered?
3. **Draw it quietly.** Same palette as the rest of the page (the ramp plus the accent), low contrast against content, and always behind or beside the content, never competing with it.
4. **Use it once, or as a system.** One hero object, or one motif repeated at different scales. Never a different decoration per section.

Avoid the generic: globes, abstract blobs, gradient orbs, floating cubes, circuit lines, stock robots. If it could be on any product's page, it is not an idea.

## Five ways to make it in code

| Family | What it is | Fits | Recipe |
| --- | --- | --- | --- |
| **Line fields** | Contours, flow lines, waveforms, grids that bend | place, terrain, data, sound, time | `assets/recipes/contours.mjs` |
| **Objects in tonal layers** | A thing drawn from smooth shapes, lit from one side with one hue shifting lighter to darker | cairns, pebbles, plates, hills, leaves | `assets/recipes/shapes.mjs` (blobs, stone stacks with flat bases, speckles) |
| **Turned objects** | A profile curve revolved into a silhouette, lit and cut with fine rings | pottery, glass, bottles, lamps, columns, lathe work | `assets/recipes/revolve.mjs` (presets: amphora, bowl, cup, jar, bottle) |
| **Dot and halftone fields** | A grid of dots whose size follows a function or data | maps, density, presence, print and craft | `assets/recipes/dots.mjs` |
| **Grain and light** | Fine noise to take flatness off a large field, soft light from one direction | any large colour area | `assets/recipes/grain.css` |
| **The product itself** | A true fragment of the real interface with plausible data, or the real output the product makes | software, tools, anything that produces a result | build in HTML with the project's components |

A sixth, quieter option is **type as the visual**: a headline or a single number set at a scale only this product can justify.

## Using the recipes

They are dependency-free Node modules that return SVG strings (or CSS). Generate once, then inline the result into the page. Same seed, same picture.

```js
import { contourSvg } from './assets/recipes/contours.mjs';
const svg = contourSvg({ width: 1440, height: 900, seed: 7, levels: 14, opacity: 0.22 });
// paste into the hero's background layer: position:absolute; inset:0; aria-hidden
```

```js
import { stoneStack } from './assets/recipes/shapes.mjs';
const stones = stoneStack({ count: 5, width: 300, seed: 3, centerX: 200, baseY: 330 });
// each stone: <path d="..." fill="url(#tone-i)"/> where tone-i is one neutral, lighter at the top
```

```js
import { vesselSvg, PROFILES } from './assets/recipes/revolve.mjs';
// Vessels drawn to one scale (same px per cm) beside a ruler make an honest picture of real sizes.
const vase = vesselSvg({ profile: PROFILES.amphora, height: 360, maxRadius: 100, base: '#7a5a4a', rings: 36, seed: 2, id: 'a' });
```

```js
import { dotField, fadeRight } from './assets/recipes/dots.mjs';
const dots = dotField({ width: 1440, height: 400, step: 14, radius: fadeRight(3) });
```

`node assets/recipes/demo.mjs > demo.html` shows each one. For a single self-contained HTML file, run the generator once and paste the output; do not ship the generator.

## Rules that keep it from turning into a tell

- **One neutral per object.** Shade with a small tone shift inside the same hue (a lighter top, a darker underside). Never hue-to-hue gradients, never glows, never coloured shadows.
- **Decoration stays behind.** Lines and dots at 8 to 25% of the text colour, masked to fade at the edges. Text over it must still pass contrast: check where the text actually sits, and move the pattern, not the contrast.
- **Draw once, not everywhere.** One hero moment. A second repeated motif at small scale is fine; a different effect in every section is not.
- **Real shapes, not filters.** Prefer drawn SVG paths to blur, noise and glow stacks. Grain is the one filter allowed, and it must be invisible as a pattern.
- **Static by default.** No looping animation. If it moves, it moves once, on load or on a real state change, and honours reduced motion.
- **Accessible and light.** `aria-hidden="true"`, `focusable="false"`, no external requests. A background pattern stays under about 50 KB; a detailed hero illustration may reach about 100 KB. Contour fields are already stitched into long smooth lines; raise `cell` or lower `levels` to shrink them. Give each inline SVG with gradients its own `id` prefix so two of them do not collide.
- **Responsive.** Use `preserveAspectRatio="xMidYMid slice"` for backgrounds, and on a phone keep the moment visible: move the subject of an illustration into the visible part and tune any edge mask at 390 px by eye, not only at 1440.
- **Let it reach the edge.** A pattern or object that stops at a hard line looks pasted on. Bleed it off the nearest edges, or pull the hero up under the navigation so there is no seam.
- **Styling an inline SVG.** CSS from the page does not reach inside an SVG `<symbol>` or `<use>` clone; style by an id on the original, or pass colours in as `currentColor`. Do not rely on `box-shadow` to stack cards: use a hard-offset second layer.
- **Grain on dark.** `grain.css` has a `.grain-dark` variant (light noise, screen blend). The default multiplies, which is invisible on a dark panel.
- **A brand wins.** If the project has an illustration style, use it. This is for when there is none.

## Judging it

Squint at the screenshot. The moment should read as one calm shape; the content should still be first. Cover the name: does the picture still say what world this is? Then run `signs.mjs` and `check.mjs`: a well-made moment adds no tells and no contrast problems. If `check.mjs` reports text on an image or gradient, look at that text by eye at 320 and 1440 px.

## Examples from testing

| Brief | Moment | Why it worked |
| --- | --- | --- |
| Notes for field researchers | Contour lines behind the hero, a note card with a position and time stamp in front | The world (terrain) and the product's one fact (every note is stamped with place) in one picture |
| Habit tracker | A cairn of stones, one per habit picked | The metaphor is the product: habits stack the way a cairn does |
| Invoicing | The invoice itself, with a paid dot | The product's output is its best picture |
