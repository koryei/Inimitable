# Devices: the moves that make a page memorable, and why each works

A page is not memorable because it has a nice gradient. It is memorable because of **one or two structural moves** that a reader feels before they can name. This file is a set of those moves, each with the reason it works, the way to build it, and the way it fails.

Read this when the direction is fixed and you are choosing *how* the page is composed. It is the bridge between `direction.md` (what the page is) and `build.md` (how to write it). Every device here is a mechanism, not a look: the same move works in a different palette, a different typeface and a different product.

**The rule for using this file:** pick **one** device as the page's spine and at most two as support. A page that uses eight of these is a page with no idea. The test is the cover test in `surfaces/landing.md`: cover the logo and the nav, and the device should still tell you what world you are in.

## Light

### 1. Light from a direction

**What.** The ground is not evenly lit. There is one implied source: a corner bloom, a glow rising from the bottom edge, a spotlight behind the headline.

**Why it works.** Human vision assumes a single light source and uses it to infer shape and position. A surface with a direction of light reads as an object sitting in a space. An evenly lit surface reads as a hole in the screen. This is the single cheapest way to stop a page looking like a rendering.

**How.** One large radial gradient, off-centre, in the page's own temperature, plus grain. Never a linear gradient across the full width: that reads as a band, not a light.

```css
/* Light from the top-right corner, kept away from the text column. */
.ground {
  background:
    radial-gradient(60% 70% at 88% 6%, color-mix(in srgb, var(--warm) 55%, transparent) 0%, transparent 64%),
    var(--bg);
}
```

**Where the source goes.** Top-left or top-right for a calm, editorial page. Bottom-centre when the page should feel lit from below, which reads as stage or screen. Directly behind the headline when the headline is the only object.

**Fails when.** The light lands under the text (contrast drops where it matters), or there are two sources of equal strength (the eye cannot place either), or the bloom is saturated enough to read as colour rather than light.

### 2. Mask the edge

**What.** Nothing has a hard rectangular edge against the ground. Images fade into the page, logo rows fade at both ends, the ground fades before the next section.

**Why it works.** A hard edge is a claim that two different materials meet. A fade is a claim that they are the same material. Photographs, screenshots and logo rows all arrive as rectangles, and a rectangle on a page is the loudest possible "this was pasted here". Fading the edge dissolves the seam and the object becomes part of the surface.

**How.** `mask-image` on the element, not a gradient overlay on top of it. An overlay tints the content; a mask removes it.

```css
/* A photograph that dissolves into the paper at its bottom edge. */
.figure img {
  -webkit-mask-image: linear-gradient(#000 62%, transparent 100%);
  mask-image: linear-gradient(#000 62%, transparent 100%);
}

/* A logo row that fades out at both ends instead of being cut off. */
.logos {
  -webkit-mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent);
  mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent);
}
```

**Fails when.** The mask eats content (a face, a word, a logo's mark), or it is used on a card that is meant to read as a card. A card's edge is information; a photograph's edge is not.

### 3. The sheet on the table

**What.** The content sits in a bordered column of paper, and the world shows at the margins: a texture, a grid, a photograph, a colour field.

**Why it works.** It gives the page a physical situation. The reader is not looking at a screen, they are looking at a document on a desk. It also solves the full-bleed problem: the margins carry the material, so the content column can stay calm and narrow without the page feeling empty.

**How.** A max-width column with a hairline border and the page's paper colour, on a body that carries the texture. The texture must be visible on all four sides, or it reads as a mistake.

```css
body { background: var(--table); }        /* the texture lives here */
.sheet {
  max-width: 78rem;
  margin: 0 auto;
  background: var(--paper);
  border: 1px solid var(--line);
}
```

**Fails when.** The margins are too thin to read as a margin (under about 24 px), or the texture is loud enough to compete with the content.

## Composition

### 4. Same composition, different material

**What.** A row of cards with identical internal layout, each on a different ground: leather, paper, black, a photograph.

**Why it works.** Variety without chaos. The eye compares the materials instead of re-learning the layout three times, so the row reads as one idea with range rather than three ideas. It is also the honest way to show a product that works on many surfaces.

**How.** One card component, one internal grid, a `--ground` custom property per card. Nothing else changes.

```css
.card { background: var(--ground); }
.card:nth-child(1) { --ground: #6d2b2b; }
.card:nth-child(2) { --ground: #efe9dc; }
.card:nth-child(3) { --ground: #14110f; }
```

**Fails when.** The layouts also differ, which turns the row into a collage, or one ground is so loud it wins the section.

### 5. Variety within a system

**What.** A grid of small tiles, each a different hue, all with the same radius, the same padding, the same type treatment.

**Why it works.** The system is the calm, the hue is the interest. Because every other property is identical, the colour variation reads as data or category rather than decoration. This is how a dashboard can be colourful without being a rainbow.

**How.** One tile class, a hue per tile, and a rule that the hue is the *only* thing that varies.

```css
.tile { border-radius: 14px; padding: 1rem; background: var(--hue); }
.tile:nth-child(1) { --hue: linear-gradient(160deg, #2b1b4d, #6b3fa0); }
.tile:nth-child(2) { --hue: linear-gradient(160deg, #0f3b3a, #2f8f7a); }
```

**Fails when.** The hues are not in one family (see the grainient rules in `materials.md`), or the tiles also vary in size, radius or type, which removes the system and leaves noise.

### 6. Concentrate the colour

**What.** One saturated object on the page. Everything else is near-black, near-white or neutral.

**Why it works.** Saturation is attention. Spread it and the eye has nowhere to land; concentrate it and the eye lands exactly where you decided. A page with one coloured object also reads as more expensive, because restraint is the signal of a decision.

**How.** Pick the object that carries the idea (the device, the product view, the one card) and give it the colour. Everything else uses the neutral ramp.

**Fails when.** The accent is also used for links, buttons, icons and headings, which is the same as having no accent.

### 7. Overlapping floating cards

**What.** Small panels of real data overlapping the edge of a product view.

**Why it works.** Depth by overlap, not by shadow. Two objects that overlap are unambiguously at different distances, and the brain reads that as space without needing a drop shadow. It also lets you show detail that would be unreadable inside a screenshot.

**How.** Absolute positioning over the product view, each card with a real label and a real value, and a small offset so no two cards align.

**Fails when.** The cards are decorative (a fake "12% up" with no source), or they cover the part of the product view that explains the product.

### 8. Stacked bands as layout

**What.** Full-width horizontal bands, each a different hue, each with a label and a value.

**Why it works.** The layout *is* the content. Each band is one reading, and the stack says "these are peers". It is the fastest way to make a set of equal measurements feel like a designed object rather than a table.

**How.** A flex column of full-width rows, each with its own ground, a label top-left and a value set large.

**Fails when.** The bands have no order or grouping, so the stack reads as a list of unrelated things.

## Emphasis

### 9. The number as graphic

**What.** One statistic set at display size, with a small label beneath it.

**Why it works.** A number at 80 px is a shape before it is a value, so it does the job of an image while carrying information. It also gives the page a second focal point without a second image.

**How.** The display face, tight tracking, tabular figures, and a label at 12 to 14 px in the mono or the sans. For a figure with decimals, set the decimals back (`<span class="dec">.50</span>`, or `numeral(56498.5, { prefix: '£' })` from `assets/recipes/headline.mjs`): the whole part is the message, the cents are precision, and it still tells the truth. The label sits under the number, not beside it.

```css
.stat b { font: 400 clamp(3rem, 6vw, 5.5rem)/0.9 var(--display); letter-spacing: -0.03em; font-variant-numeric: tabular-nums; }
.stat span { display: block; margin-top: 0.5rem; font: 400 0.75rem/1.3 var(--mono); color: var(--ink-3); }
```

**Fails when.** There are four of them competing, or the number is invented. A stat is proof; see `surfaces/landing.md`.

### 10. Two-tone headline

**What.** One sentence, two tones: the setup in full ink, the payoff in a lighter weight or a muted colour.

**Why it works.** It gives a long headline a reading rhythm and a hierarchy inside a single line of thought. The eye reads the loud part, then the quiet part, which is the order the argument should land in. It also lets a headline be longer than two lines without becoming a paragraph.

**How.** A `<span>` with a muted colour or a lighter weight. Keep the size identical; the change is weight and colour only. One word can carry it, not only a whole line ("Smarter *Financial* Management"): `<span class="dim">` in the starter, or `tintWord(text, word)` from `assets/recipes/headline.mjs`. The tint is the page's `--ink-3`, so it always passes contrast; do not pick a new colour for it.

```html
<h1>Design and drafting software for architects. <span>From site to client-ready design.</span></h1>
```

**Fails when.** The quiet part carries the actual claim, or the two tones are two different colours rather than two weights of one.

### 11. Highlight chip

**What.** A block of colour behind one word of the headline, sometimes with a small icon inside it.

**Why it works.** It marks the word the sentence turns on, and because it is a filled shape it reads as an object rather than as emphasis. It is also a place to put a mark or an icon without adding a separate element.

**How.** An inline element with padding, a background, and a small negative margin so the block does not disturb the line rhythm.

```css
h1 mark {
  background: var(--highlight);
  padding: 0.04em 0.18em;
  margin: 0 -0.04em;
  color: inherit;
}
```

**Fails when.** More than one word is marked, or the highlight colour is the accent used everywhere else.

### 12. Hierarchy by weight and colour, not size

**What.** A label, a value and a caption at nearly the same size, separated by weight and ink level.

**Why it works.** Size is the crudest hierarchy tool and the one that inflates a type scale. Weight and colour give three levels inside one size, which keeps the page calm and the scale short. It is also how print has always worked.

**How.** Three ink levels (`--ink`, `--ink-2`, `--ink-3`) and two weights (400, 500). Reserve size changes for real jumps.

**Fails when.** The muted level drops below contrast (see `check.mjs`), or weight is used for decoration rather than rank.

## Control

### 13. The split button

**What.** A button in two parts: the label tile and a separate arrow tile, each with its own fill.

**Why it works.** The arrow tile is a second surface, so the button has somewhere to move on hover: the arrow tile can shift, invert or slide without the label moving. It also makes the direction of the action explicit, which a bare arrow glyph does not.

**How.** A flex row with a gap of 0, two children, and the arrow tile with its own background. On hover, translate the arrow tile and invert it.

```css
.btn { display: inline-flex; align-items: stretch; padding: 0; }
.btn span { padding: 0.9rem 1.25rem; }
.btn i { display: grid; place-items: center; width: 3rem; background: var(--accent); transition: transform 180ms ease; }
.btn:hover i { transform: translateX(2px); }
```

**Fails when.** The two tiles have the same fill, which makes it a button with a seam.

### 14. The product's own control as the hero

**What.** The first screen's centrepiece is the thing the product actually is: an input, a search field, a canvas, a command line.

**Why it works.** It answers "what is this" faster than any headline, because the reader can see the interaction. It also makes the page honest: the hero is not a picture of the product, it is the product's primary affordance.

**How.** Build the real control, styled, with a real placeholder and real affordances. It does not need to work, but it must look operable and be keyboard-reachable.

**Fails when.** The control is fake in a way the reader can feel (a dead caret, a button that does nothing on a page that claims to be the product), or the product's real control is not interesting enough to carry a screen.

### 15. The inline legend

**What.** The key to an encoding sits next to the encoding, not in a separate block: a row of swatches labelled "less … more", a scale under the chart.

**Why it works.** It removes a lookup. The reader learns the encoding at the moment they need it, which is the only moment they will. It also fills the space under a dense graphic with something useful instead of padding.

**How.** A small flex row, the same swatch component as the data, and two words at the ends.

**Fails when.** The legend is bigger than the graphic, or it repeats what the labels already say.

## Judging a device

Before you commit to one, ask:

1. **Does it survive the cover test?** Cover the logo and the nav. Does the device still say what world this is?
2. **Is it one move or three?** If you cannot name the spine in one sentence, there is no spine.
3. **Does it carry content, or only mood?** A device that would look the same with different words is decoration.
4. **Does it hold at 390 px?** Most of these are desktop moves. Name what happens on a phone before you build it: usually the device simplifies to its strongest half.
5. **Does it survive reduced motion and `prefers-contrast: more`?** If the device is only legible while it moves, it is not a device.
6. **Would it look wrong on a competitor's page?** If it would fit anywhere, it is not a decision.

## Where these come from

These are mechanisms, not files. They were read out of real pages and reduced to the reason each one works, so they can be rebuilt in any palette:

| Source | Device taken |
| --- | --- |
| Vellmont Partners | Mask the edge; hierarchy by weight and colour |
| Voca, Metricly | Light from a direction; frosted control over a gradient |
| goop | Light from the bottom edge; the product's own control as the hero |
| Luceo | Spotlight behind the headline; two-tone headline |
| Ailix | A gradient masked by a texture, faded to calm where the type sits |
| Synaps | The sheet on the table; highlight chip; same composition, different material |
| Goit | Overlapping floating cards; the number as graphic; edge-faded logo row |
| Opero | The split button; an inset dark band as a card |
| Vesper, Outside | Variety within a system; stacked bands as layout; concentrate the colour |
| GitHub contributions | The inline legend; a data grid where colour is the only colour |

Do not copy the pages. Copy the reason, then rebuild it in the project's own material. `libraries.md` has the rule for taking from a source without shipping its files.
