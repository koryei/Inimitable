# Why the best landing pages work

A good landing page is not a layout with a nice colour. It is a handful of decisions made together: **where the light comes from, where the type sits in it, what is big, what moves and in what order, and how everything answers the pointer.** This file explains each decision, why it works on a person, how to build it with the kits in this skill, and which script catches it when it is wrong.

Start every landing page with `node scripts/scaffold.mjs <folder> [--theme dark|light] [--palette name] [--shape rays|bowl|blob|...] [--hero split] [--motes]`. `--hero split` puts the headline beside the one object only this product has (a drawing, the real screen, a diagram). To deliver a single file, run `node scripts/inline.mjs <folder>`. It gives you a page that already makes these decisions and already passes every check. Your job is then to replace the placeholder content with the product's own and to push the direction until it could only be this product.

## The ten decisions

### 1. The ground is light, not colour

**What good pages do.** The first screen is a luminous gradient with grain: a bowl of blue light pouring from the top into dark, a warm cloud on one side of a cream page, a glowing horizon, an arc of atmosphere. It is the biggest thing on the page and it contains no content.

**Why it works.** A flat colour is read as a *fill*. A gradient that is lit from a direction is read as a *place*, because we spend our lives reading light to understand space. The edge of the light (a soft rim or lip) gives it an inside and an outside, which is what turns a smudge into a shape. Grain breaks up banding and gives the surface a tactile quality that flat digital colour lacks. The result is mood and depth at zero cost to clarity, because the ground carries no information.

**How.** `assets/recipes/mesh.mjs` builds it in four layers (base, light, grain, mask). Pick the shape by where the light should come from:

| Shape | The light | Use when |
| --- | --- | --- |
| `bowl` | pours down from the top, with a luminous rim | dark pages; the lower half stays calm for type |
| `horizon` | rises from the bottom edge | dark pages with type at the top, or a closing band |
| `blob` | one soft cloud to one side | light pages; the opposite side stays clean |
| `pools` | several soft pools, off-centre | a quiet, even ground; light or dark |
| `rays` | shafts of light falling from above, like sun through water or a window in a dark room | dark pages that want atmosphere: pair with `--motes` and the `abyss`, `dusk` or `coal` palette |
| `sweep` | a diagonal fold of colour | showpieces and section breaks |

Add `--motes` for faint specks that drift very slowly, like dust in a beam. Palettes: `ember`, `petal`, `glacier`, `moss` (light) and `dusk`, `midnight`, `abyss`, `coal`, `ink` (dark). They keep to **one temperature family plus a single counterpoint**; `fromAccent('#hex')` derives one from a brand colour and pulls it back until it reads as light, not paint. The audit refuses anything over the paint cap.

**Rules.** One ground per screen. No glow stacked on it. Never behind the busiest part of the type. Grain visible as softness, never as a pattern. It may drift once, very slowly (`.m-drift`), and stops under reduced motion.

**Caught by.** `check.mjs` reads contrast from the rendered pixels, so type placed on the bright part of a ground fails. `test/mesh-render.test.mjs` shows how every shape is verified (lit, grained, calm where type goes).

**Bitmap grounds.** For a richer, painterly ground use a downloaded image. Grainient's free collections allow commercial use and modification but not redistribution, so the project downloads from them directly and the skill never bundles their files. Convert to a lossy format at the display size, `loading="eager"` for the hero, and put the same dark or light scrim under the type. Prefer the code ground when the project cannot carry a 200 KB image.

### 2. Type sits in the calm part of the light

**What good pages do.** The headline is anchored to a corner (usually bottom-left) of the lit frame, large, with its supporting copy and actions under it and a row of figures opposite. The middle is left to the light.

**Why it works.** The eye goes to the brightest, highest-contrast thing first. If type sits on top of the bright part it fights it, and contrast fails. Anchoring to a corner uses the **reading order** (top-left to bottom-right) and leaves a large calm region, so the light and the words each get a clear job. It is also an asymmetric composition, which reads as designed; centred, evenly spaced content reads as a template.

**How.** The hero in the starter is `align-items: flex-end` with `.hero-foot` splitting copy and figures. For a bowl, text goes low; for a horizon, text goes high; for a blob, text goes opposite the blob.

**Caught by.** `check.mjs` (contrast at the text's real position), `look.md` step 5 (balance at every width).

### 3. Scale contrast is the hierarchy

**What good pages do.** A headline of 100 to 130 px at tight tracking next to metadata in 12 to 14 px mono. Nothing in between does much work.

**Why it works.** Hierarchy is relative (see `principles.md` 2). A very large step is decisive: the page has one thing to read first, and everything else is clearly secondary. Tight tracking (-0.04 to -0.06em) at display size makes the word one shape, so it reads at a glance. Small mono for metadata separates *facts* from *voice*.

**How.** `.display` is `clamp(3rem, 8.4vw, 8.25rem)`, line-height 0.94, letter-spacing -0.055em, light weight (400). The two-tone headline (second line in `--ink-3`) adds a second level without a second size. Use a serif once, large, for a number or a numeral (`.big`, `.step .n`, `.proof b`).

**Rules.** Never tighten small text. Two weights at most. The headline is two lines on desktop, three on a small phone.

### 4. The product is the hero object, and it looks inhabited

**What good pages do.** A large framed picture of the product's real screen, with a couple of small floating elements: a cursor with a name, a chip saying someone approved something, a note pinned to a number.

**Why it works.** People decide whether a product is real by seeing it. A large, well-lit, believable screen answers "what is this" instantly. Floating names and chips imply other people are using it, which carries the feeling of social proof **without making a claim you cannot back up**. Motion in the chips (a slow bob) makes the frame feel live.

**How.** `.stage`, `.window`, `.float` in the starter, with a drawing line chart (`data-draw`). Replace the example screen with the real one. If you have no real screen, say it is illustrative (the starter's note line does).

**Rules.** Example data is labelled as example data. Never invent a customer, a count or a rating. If the product has real numbers, use them; if it does not, show the product doing its job.

### 5. Rhythm, not repetition (the bento)

**What good pages do.** A grid of cards in different sizes: one tall hero card, a card that is one huge numeral, a list card, three small ones. Each holds exactly one idea.

**Why it works.** Equal cards read as a list; unequal cards read as a composition with a hierarchy of importance, so the eye knows which feature matters most. One idea per cell keeps each scannable. A giant numeral or a drawn diagram gives the grid texture without decoration.

**How.** `.bento` is a 12-column grid with `.c1` (7 wide, 2 tall) down to `.c6`. Use `data-spot` for a pointer light, `data-tilt` on the one hero card only, and stagger the reveal with `--i`.

**Rules.** Six cells is plenty. Do not fill a cell with an icon in a circle and a vague line.

### 6. Material as a counterpoint (when the product is digital)

**What good pages do.** Torn paper, folded sheets, halftone, grain, a physical surface under the software screenshot.

**Why it works.** Software is weightless; matter is not. Putting a screen on a material makes the product feel substantial and human. It also differentiates, because most competitors show a screen floating in nothing.

**How.** See `materials.md` and `devices.md` (the sheet on the table, same composition on different materials). Build in CSS first: a sheet is a surface with a hairline, a shadow and a slight rotation.

**Rules.** One material per page. It must be believable (consistent light direction and shadow). Do not use it when the brand is already a precise instrument.

### 7. One accent, two buttons

**What good pages do.** One accent colour on the primary action and a few points of interest; a second, quiet button; a nav with four links and one button.

**Why it works.** Choice slows decisions (Hick's law). One accent makes the action unmistakable. A quiet secondary lets someone explore without competing.

**How.** `.m-btn` (filled) and `.m-btn.glass` / `.ghost`. The accent comes from the palette's counterpoint, so it already harmonises with the ground.

### 8. Motion arrives in order

**What good pages do.** Headline lines rise out of a mask one after another, then the copy, then the actions, then the frame settles last. Sections reveal as you scroll. Figures count up.

**Why it works.** The eye reads top to bottom and big to small; arriving in that order means the page is *understood in the order it appears*. Everything at once reads as a page load; staggered reads as composition. A reveal on scroll gives a long page a reason to keep going.

**How.** The motion kit (`assets/motion/`): `.m-line > span` (masked rise), `data-enter` with `--d` (delay in ms), `data-reveal` with `--i` (stagger), `data-count`, `data-split`, `data-draw`. Timings and the reasons are in `motion.md`.

**Rules.** One entrance, at most five things. Never hide content when the script fails (the kit only hides under the `m-js` class). Reveal what is below the fold, not the first screen. Under reduced motion everything is simply there.

**Caught by.** `test/motion-kit.test.mjs` proves every behaviour; `craft.mjs` reports loops that do not stop under reduced motion.

### 9. Every control answers back

**What good pages do.** A button fills with colour from below and its arrow slides through; a link draws its underline; a card lifts and a soft light follows the pointer; the nav pill settles on scroll; the logo turns.

**Why it works.** A control that gives no feedback feels dead, and a page where nothing answers the pointer reads as a picture of a page. A reply within 100 ms feels instant. Different replies for different controls (fill, draw, lift, light) make the page feel crafted rather than themed.

**How.** `.m-btn` (sweep, arrow, press), `.m-link` (draw), `.m-card`, `[data-spot]`, `[data-magnet]`, `[data-tilt]`. Detail and numbers in `hover.md`.

**Caught by.** `craft.mjs` hovers every control with a real pointer and diffs both the computed style and the **pixels**, so a hover that changes nothing visible fails.

### 10. Honest proof and one real number

**What good pages do.** A strip of short true statements, a single large figure with its source, a quiet footer.

**Why it works.** Trust is built from specifics and lost to a single false claim. A ticker of what the product does is true by construction; a customer-logo strip is only true if they are customers.

**How.** The starter's `.ticker` carries statements, not logos. The `.proof` band carries one number: say where it comes from.

**Caught by.** `signs.mjs` finds unverifiable claims and hype words, and reports every `data-todo` left on the page.

## Reading a reference without copying it

When you study a page you admire, ask these in order. If you cannot answer, you are about to copy.

1. **Where does the light come from?** (Which `mesh.mjs` shape would draw it?)
2. **Where is the calm region, and what sits in it?**
3. **What is the biggest thing, and what is the smallest, and how big is the step?**
4. **What is the one object that could only belong to this product?**
5. **What moves, in what order, and what answers the pointer?**
6. **What does it refuse to do?** (No second accent, no icon grid, no stock photo.)

The answers are the transferable part. The colours, the exact gradient and the layout are the skin, and the skin is always the project's.

## Checklist before you show it

- [ ] The ground has a shape, an edge and grain, and type sits in the calm part.
- [ ] One thing is clearly first; the step down to the metadata is large.
- [ ] The product is shown large and real (or plainly labelled as an example).
- [ ] The cards are unequal and each holds one idea.
- [ ] The entrance runs once in order; reveals fire; counters end on the real number.
- [ ] Every control has a visible hover and a press; `craft.mjs` is clean.
- [ ] Nothing says `data-todo`; `signs.mjs` is clean; `check.mjs` is clean at 320, 390, 1440 and 2560.
- [ ] Reduced motion shows everything and moves nothing.
