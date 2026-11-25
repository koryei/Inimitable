# Directions: finished looks you can commit to

A direction (step 3) is a committed look: a character, a palette, a type pairing, and a short list of **devices** used consistently. This file is a library of proven ones. Pick the closest to the product, then make it this product's own with its subject inventory and its one accent. If the project has brand rules, they win and this file only supplies technique.

A device that `anti-slop.md` would remove on a default screen (small uppercase mono labels, a gradient surface, a glow) is a **choice** when a direction commits to it, names it, uses it everywhere it belongs, and nowhere else. Name the devices in the report and pass them to the scanner with `--allow`. What stays a tell in every direction: gradient text, violet-to-pink washes with no idea behind them, emoji as icons, stock imagery, invented proof.

## How to choose

| The product is | Start from |
| --- | --- |
| AI, infrastructure, security, data, defence, developer tools, anything technical and serious | **Instrument, dark** |
| The same, but calmer, more hardware or print, or for a buyer who wants clarity over drama | **Instrument, light** |
| CAD, hardware, engineering software, B2B tools with a physical or structural story | **Blueprint** |
| A platform or model where the feeling is scale and the future | **Horizon** |
| Anything about sound, signal, trends or time series | **Dithered data** |
| A product for people (notes, habits, craft, food, places) | **Warm editorial** (see `surfaces/landing.md`, and the earlier examples) |
| A working screen people use all day | none: **Operate** rules (`surfaces/web-app.md`) with one quiet signature |

Reference leaning: when the person's taste runs technical, default to Instrument or Blueprint for technical products.

## Choosing the ground

The ground is the largest thing on the first screen, so it is the first thing a visitor remembers, and the soft grainy gradient (the lit ground) is now what most machine-built pages reach for. It is a good ground. It is also a default, and a page whose ground, skeleton and type are all defaults is replaceable. Choose the ground on purpose and write the reason in the concept (`direction.md`): one clause.

| Ground | It says | Use it when | Build with |
| --- | --- | --- | --- |
| **Lit** (soft grainy gradient) | atmosphere, calm, a place | the product is about light, space, mood or the future, or the picture on top has to feel part of a scene. Say why: "lit, because the product is a night-shift monitor" | `scaffold` default; `mesh.mjs` |
| **Flat colour** | a decision: one colour carries the nav, the ground and the buttons | the product has a colour it owns, or the type and the product card have to carry the page | `scaffold --ground flat --palette cobalt\|mint\|sand`; `flat.mjs` |
| **Frame** (a dark panel set into a light page) | a stage: the product is shown inside a room of its own | the product card is the point and needs contrast against a quiet page | `scaffold --ground frame --palette sand --hero card`; `flat.mjs` |
| **Duotone print** | craft: a picture made in one ink, tied to the interface by its texture | there is a subject worth drawing, a real artifact, drawn from the product | `duotone.mjs`, `dotify.mjs --mode lines`; `scaffold --art strata` |
| **The artifact itself** | the page is made of what the product makes | the artifact is visual (a strip log, a score, a map, a receipt, a waveform) | draw it in code, large, as the hero object (`visual-craft.md`) |

A flat or framed ground hides nothing, so use it only when the layout and the type are good; the checks read contrast from the pixels, so it is also the easiest ground to get right. These grounds are first-class: the lit gradient is not the safe choice, it is one choice.

## The grammar of the instrument family

The most distinctive pages share eight habits. A direction in this family uses most of them.

1. **The star is a processed picture of the subject.** Never a plain stock photo. The subject (an aircraft, a chip, a planet, a face, a waveform, a part) is turned into dots, halftone, dither, hex cells, ASCII or isometric line art, so very different subjects share one texture. See "The hero object" below.
2. **Annotation.** Callout boxes with leader lines, coordinates, a version, a status line, small mono readouts. They make the object look measured.
3. **Registration furniture.** Corner brackets on buttons and frames, crosshairs, edge rulers, numbered tags, barcodes, hatch strips.
4. **Visible structure.** A hairline grid, dashed modules, frames within frames, a stat strip at the foot.
5. **Type with two voices.** A big, tight display face, and tiny mono for metadata. The key word of the headline in `[brackets]`, labels prefixed with `//`.
6. **One accent.** Near-black or paper grey, plus a single accent (orange, red, pink, blue, green, violet) on the primary action and one or two points of the object. Imagery in duotone.
7. **Texture.** Grain, scanlines, diagonal hatching, noise, so large fields never look flat.
8. **Confidence.** A big object, few words, one or two actions, a stat strip.

### Honesty rule

Annotation is the easiest place to lie. A callout points at something real and says something true. Never invent a spec, a number, a certification or a customer. Where a reading is illustrative, label it ("Example reading"). If the product has real numbers, use those. Ask the person for them rather than making them up.

### Legibility floor

The look leans on tiny type. Keep micro labels at 12 px or larger, give them 4.5:1 contrast, keep controls 44 px tall, and make sure every callout is also in the page's text or marked decorative (`aria-hidden`). The kit (`assets/recipes/instrument.css`) already follows these.

## The hero object

1. **Choose the subject's visible form.** What does the product act on or produce? The thing in the picture is the one true thing: a planet for Earth observation, a die for a chip, a waveform for audio, a vessel for pottery.
2. **Get a picture.** In order of preference: the product's own real image or render; a drawing made in code (`assets/recipes/revolve.mjs`, `shapes.mjs`, `iso.mjs`, `fields.mjs` such as `sphere`); an image the person supplies. No stock photography.
3. **Process it.** `node scripts/dotify.mjs <image or .svg or .html> --mode hex --dots 70 --cell 8 --fill '#e8e6e1' --bg '#0f0f10'` (the dark parts of the picture become dots; add `--invert` when the subject is the bright part). Modes: `fs` (organic grain), `ordered` (graphic, regular), `stipple` (spray), `halftone` (print dots), `hex` (cells), `ascii`. For a drawn object the recipes in `dither.mjs` can also be called directly.
4. **Annotate.** `assets/recipes/hud.mjs`: callouts, brackets, crosshairs, rulers, tags, readouts.
5. **Frame it.** Corner brackets, a hairline or dashed frame, a ruler on one edge, a caption.
6. **Colour it.** One tone on one ground. Add the accent to one point of interest.
7. **Check it.** At 390 px the object must still read: crop to the best part, simplify the annotation, and make sure the headline and actions come first.

Budget: halftone and hex output is compact (dots share round-capped strokes), about 70 KB for 56 dots across; an organic-grain (`fs`) picture merges runs and is smaller still. Use fewer dots or a larger `--cell` for backgrounds. To dot a headline, a message or a logo, put it in a small HTML file and run `dotify` on that; `dissolve()` in `dither.mjs` makes it break into noise along an axis, which is how a product claim like "encrypted" or "decaying" can be drawn.

### Type in a file with no web fonts

Use the system stacks in `house-rules.md`. By direction: **Instrument** pairs the neutral sans stack for display (tight, `-0.03em` from 56 px) with the mono stack for metadata; **Blueprint** pairs the editorial serif stack for display with the neutral sans for body; **Horizon** takes the neutral sans in a heavy weight or the editorial serif, large and centred; **Warm editorial** takes the editorial serif with a humanist sans. Check the render on the machine you have: the first available face wins.

---

## Instrument, dark

**Feel:** a control room at night. Precise, expensive, quiet until you look closely.
**Palette:** ground `#0f0f10` and its ramp, text `#ededed`, one accent. **Type:** a tight grotesk for display, mono for metadata. **Mode:** Persuade.
**Devices (pick 3 to 5):** dotted hero object, HUD callouts, corner-bracket buttons, `//` labels, `[bracket]` key word, stat strip, grid ground, hatch strip.
**Layout:** a split (copy left, object right) or the object behind a centred headline; a nav of four links and one button; the stat strip pinned to the foot.
**Build with:** `instrument.css` (`inst inst-dark`), `dotify.mjs`, `hud.mjs`.
**Don't:** glow the whole page, add a second accent, fill the ground with particle noise, let callouts overlap the headline.

## Instrument, light

**Feel:** a technical drawing or a datasheet. Grey paper, black ink, one red or green mark.
**Palette:** `#e6e5e1` ground, `#141414` ink, one accent (red, green or blue). **Type:** a grotesk or a geometric display; mono for tags.
**Devices:** halftone or print-dot object (dark dots build shadow), edge rulers, numbered tags `[01]`, crosshairs, a circular text stamp, framed modules, a ticker of short facts.
**Build with:** `instrument.css` (`inst inst-light`), `halftoneSvg` (dark dots on paper), `hud.mjs`.
**Don't:** use a dark glow, photographs, or a gradient.

## Blueprint

**Feel:** calm, exact, explanatory. A well-drawn manual.
**Palette:** white or near-white, hairline greys, **one accent** (orange is common) used on the part that matters. **Type:** a refined serif display with a plain sans for body.
**Devices:** isometric line illustrations with tonal fills in neutrals and the accent on one component, a faint isometric grid floor, dashed module borders, small square bullets, a simple dark pricing card among light ones.
**Build with:** `iso.mjs` (`isoBox`, `isoPlate`, `isoGrid`, `explodedStack`, `isoPin`), `hud.mjs` for pins.
**Layout:** a headline left, an illustration right that connects its parts with a thin line; then alternating sections each with one illustration; a plain close.
**Don't:** use shading to fake 3D realism, add many colours, or make the diagrams so busy they stop explaining.

## Horizon

**Feel:** the edge of the atmosphere. Scale and calm.
**Palette:** black into one saturated horizon (deep blue to warm red through a pale band), with fine grain. **Type:** a wide or serif display, large, centred; a floating nav.
**Devices:** one big gradient surface as the star, grain (`grain-dark`), a quiet outlined button, a short row of logos only if they are real.
**Build with:** `.horizon` in `instrument.css`, `grain.css`.
**Rule:** the gradient is the **object**, the one rich moment. It is never on text, buttons or cards. Everything else is flat and neutral.
**Don't:** also add glows, blobs or a second gradient.

## Dithered data

**Feel:** raw signal. A single-colour picture made of the data itself.
**Devices:** a waveform, a skyline of bars or a trend drawn as dithered cells (`fields.bars` plus `orderedDither`, then `ditherSvg`), a stark dark ground, one orange action.
**Build with:** `fields.mjs`, `dither.mjs`.
**Use for:** audio, monitoring, markets, anything where the data is the product. Use real or clearly example data.

## Warm editorial

**Feel:** paper, ink, a window. Human and quiet.
**Palette:** warm neutral ramp, one muted accent. **Type:** a refined serif display, a humanist sans.
**Moment:** a drawn object from the product's world (`visual-craft.md`): a contour field, vessels, stones, an invoice.
**Don't:** go instrument on a product that is about people and warmth.

## Flat colour

**Feel:** a decision. One saturated colour for the whole first screen, so the type, the product card and the one picture on it do the work.
**Palette:** `flat.mjs` has cobalt, mint and sand, each with its own ink, tinted text, accent and a darker panel of the same hue, all checked for contrast. The accent is for hover fills, focus and one chip, never for body text on the ground. **Type:** the sans at display size, with one word in the lighter tint.
**Devices:** the product card as a darker panel on the colour; a thin traced diagram behind it; one or two annotation chips; the closing call as a dark inset panel.
**Build with:** `scaffold --ground flat --palette cobalt --hero card`.
**Don't:** add a gradient to "warm it up" (that is the lit ground again), or use a second saturated colour.

## Framed panel

**Feel:** a stage. The page stays quiet; the hero is a dark rounded panel set in below the nav, with the product on it.
**Build with:** `scaffold --ground frame --palette sand --hero card`, or `--hero split --art strata`. A frame with nothing in it is just a large dark rectangle, so it needs the card or a print.
**Mixed radius is a decision:** a rounded nav and panel with sharp-cornered buttons or chips reads as deliberate; round everything or keep two radii and name them.

## Duotone print

**Feel:** printed. One subject, one ink, one paper, with a halftone, a line screen or a dither that ties the picture to the interface.
**Devices:** the subject at large scale, cropped by its frame; the same ink as the page's ground colour (the scaffold uses `var(--bg)` for ink and `var(--ink)` for paper, so it follows the theme); the grain of the ground over the top.
**Build with:** `duotone.mjs` (`duotoneSvg({ subject, mode: 'halftone' | 'lines' | 'dither' })`), `dotify.mjs --mode lines` for the product's own artifact rendered to HTML, `scaffold --art column|vase|sphere|drape|strata`.
**The stand-ins are stand-ins.** A column or a vase is the technique, not the idea: unless the product is about columns, replace it with the product's own artifact (a clause, a core, a tide chart) before the swap test (`gate.md`). The built-in subjects are drawn by computation, so there is no photograph, no licence and no stock image.

## Annotations (a technique, not a direction)

A product picture explains itself when it is annotated: a **chip** says what to look at, its **arrow** says where, a **thin traced line** shows how the card connects to the rest of the product. `annotate.mjs` makes the chips (`chip()`, styles from `annotationCss()`) and the diagram (`heroDiagram()`); `scaffold --hero card` places them. Rules: three chips at most; a chip points at something real in the picture; one plain statement, never a number the product cannot back; diagram nodes name the product's own parts; hide both on a phone rather than shrink them.

---

## Making any of these the product's own

The finished looks above are starting points. What makes one feel *made for this product*:

- The **subject inventory** from Read: its real nouns, objects, constraints.
- The **hero object** drawn from its world, not a generic sphere or chip.
- **Real labels** from its real facts.
- **One accent** from its world or brand.
- **One signature** (a status dot, a unit, a typeface detail, one artwork, one interaction) used everywhere, with everything else calm.

If you could swap the product name and the page still fits, it is a template. Go back to the inventory.
