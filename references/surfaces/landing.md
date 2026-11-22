# Surface: landing and marketing pages (Persuade)

A landing page is not a brochure. It is an **argument** made in a fixed order, to someone who is deciding whether to keep reading. Design is the product here: the page has to earn attention, then belief, then action, and it has about five seconds to earn the first one.

This file gives the rules and the reason under each. When a case is not covered, reason from `principles.md`.

## The argument, in one line

Before designing, write: *who arrives, what they must believe by the end, what they do next.* Every section either moves that belief or goes. A section that only fills space is the most common reason a page feels long and says nothing.

## The five-second test

**Why it matters.** A visitor's first fixation lands on the largest, highest-contrast thing in the first screen. In that fixation they answer three questions: *what is this, is it for me, what do I do.* If any answer is missing, they leave. This is not a metaphor; it is what eye-tracking on landing pages shows.

**What it means.** The first screen must contain, in this order of visual weight:

1. **What it is**, in the product's own nouns, in a headline of two lines or fewer on desktop.
2. **Who it is for**, in the subhead or the headline itself.
3. **What to do**, as one primary action.

Everything else, including the logo, the nav and the social proof, is quieter than those three.

## The first screen

| Rule | Why |
| --- | --- |
| **A headline that says what the product does for whom** | The headline is read before anything else. A clever line that does not say the thing costs a fixation and buys nothing. Specific and plain beats short and mysterious. |
| **Two lines on desktop, three at most on a phone** | A headline that wraps to four lines stops being a shape and becomes a paragraph. Shorten the words before you shrink the type. |
| **One subhead, at most about 25 words** | The subhead answers the question the headline raised. A second paragraph is read by almost nobody. |
| **One primary action, at most one secondary** | Two equal buttons split the decision and reduce both. The secondary is quieter: an outline, a text link, or a play control. |
| **One visual that shows something true** | The visual is the fastest carrier of "what is this". A product view, its output, or one concrete metaphor from the product's world. Filler (a gradient orb, a stock team, a floating cube) is read as "they had nothing to show". |
| **A quiet navigation** | The nav is a map, not a message. It should be findable and never louder than the headline. On phones, one menu control. |
| **It composes as a whole at 1440 and 390** | The first screen is one picture. No dead band, no orphaned element, and the next section should hint below the fold so the page reads as continuing. |

## Hero compositions, and why each works

- **Scene.** One image edge to edge, subject on one side, headline on the calm part, product view rising from the bottom. *Why:* the image sets the world, the empty area gives the type contrast, and the rising product says "this is software" without a caption.
- **Asymmetric split.** Text one side, visual at least half the width, text centred against it. *Why:* the imbalance creates a reading path (text, then image) and avoids the dead centre.
- **Text over product view.** Headline and actions, then a large preview that runs past the fold. *Why:* the crop implies more, which invites the scroll.
- **Statement.** Large type alone, left-aligned. *Why:* for a product whose name is the idea, the type is the visual. It only works when the line is genuinely good.

These four are the *arrangements*. The move that makes one of them memorable is a separate decision, and it is the one people skip: light from a direction, a masked edge, a sheet on a table, the product's own control as the hero, a number set at scale. `devices.md` has fifteen of them with the reason each works and the way each fails. Pick one as the spine of the page before you write any markup.

## The one thing

Every page needs **one thing the visitor remembers**: a hero object, a number set at scale, a single interaction, a line of type. It is the reason the page is not interchangeable with the next one. `visual-craft.md` is how to make it; `materials.md` is how to give it a surface.

The test: cover the logo and the nav. Can you still tell what world this page is from? If not, the page has no one thing.

## Sections and rhythm

- **4 to 7 sections.** More than that and the argument repeats. Fewer and it is not made.
- **Each section has a different job and a different composition.** A page of four identical card grids has one section repeated four times. Alternate: full-bleed, split, centred statement, dense proof, quiet close.
- **Space between sections 80 to 128 px; inside a section far less.** *Why:* the ratio between outer and inner space is what makes sections read as separate thoughts. Equal spacing everywhere flattens the page into a list.
- **Left-align long text. Centre at most one moment.** *Why:* centred paragraphs lose the left edge the eye returns to, and centring everything removes the contrast that makes the one centred moment feel deliberate.
- **Alternate density.** A dense proof section after a calm statement section gives the eye rest and then work. Two dense sections in a row read as a wall.

## Proof

**Why:** a claim is believed in proportion to how checkable it is. "Trusted by thousands" is worth nothing; "used by 4,200 teams, up 18% this year, source: our billing system" is worth something. Specificity is the signal of honesty, and the reader knows it.

- Real numbers with their comparison and their source.
- Named customers who agreed to be named.
- Product screenshots of the actual thing.
- If it cannot be verified, it does not go on the page. An invented stat is the fastest way to lose a technical reader.

## Motion

**Why:** motion is read as aliveness and care. A page that appears fully formed is a document; a page whose parts arrive in a considered order is a product. But motion is also the easiest thing to overdo, and a page that animates everything reads as a template.

- **One entrance, choreographed.** The headline, then the subhead, then the actions, then the visual, 60 to 90 ms apart. Not everything at once, not a different effect per element.
- **Scroll reveals, once.** A small rise and fade as a section enters, staggered by 40 to 60 ms. Never re-trigger on scroll up.
- **One or two purposeful moments.** A product preview that demonstrates its real function, a counter that counts, a divider that sweeps. These are the page's character.
- **Nothing loops in the reading path.** A marquee is allowed as a strip, never behind text.
- **Reduced motion is a first-class path.** Under `prefers-reduced-motion: reduce`, everything is present and still.

Exact values and recipes: `motion.md`.

## Hover

**Why:** the hover is the interface answering before the click. It is the cheapest place to show craft and the most common place to lose it. A page with a beautiful hero and a colour-only button hover feels unfinished the moment the pointer moves.

Every interactive element gets a designed hover and a press state. `hover.md` has the mechanics and the values.

## Material

**Why:** a flat fill reads as a rendering. Light and grain read as a surface. A landing page is the one place where a ground can carry the mood of the whole product, so it is worth building properly.

One material for the page, one accent, one light direction. `materials.md` has the grainient recipe and the rules that keep it from becoming a rainbow.

## The close

- **Repeat the one action.** The visitor who read to the end has decided; do not make them scroll back.
- **The footer is a designed close, not a sitemap.** A short line, the licence, the links that matter. A footer with 40 links undoes the calm of the page above it.

## What makes a page feel expensive

Not decoration. These, in order of effect:

1. **One clear idea**, visible in the first screen.
2. **Type set with intent**: a display face with real character, a body face that disappears, a mono for metadata, and a scale with decisive steps.
3. **A surface with light and grain**, not a flat fill.
4. **Motion that arrives in order** and stops when it is done.
5. **Hover states that reply**, on every control.
6. **Generous, rhythmic space**, with the star given more room than the rest.
7. **One accent**, used on one thing.
8. **Specific proof**, with numbers that carry their comparison.
9. **A close that is designed**, not a link dump.

## What makes a page feel cheap

- A headline that could belong to any product.
- Four identical cards.
- A gradient orb, a glowing brain, a stock team photo.
- Everything centred.
- A colour-only hover.
- Motion on everything, or on nothing.
- A footer with 40 links.
- A claim with no number, or a number with no source.

## Performance and SEO basics

One `h1`; a descriptive title and meta description; a social preview image; a hero image under about 200 KB; LCP under 2.5 s on a mid-range phone; real `<a>` links; alt text on every image; reserved sizes so nothing shifts.

## Judging it

1. **The five-second test.** Show the first screen for five seconds, then ask what it is, who it is for, and what to do. If any answer is missing, fix the first screen before anything else.
2. **The squint test.** Blur the page. One shape should dominate each screen.
3. **The cover test.** Cover the logo. Can you tell what world this is?
4. **The hover pass.** Hover every control. Do they feel like one family?
5. **The reduced-motion pass.** Turn it on. Is everything still there and still clear?
6. **The scroll pass.** Scroll the whole page at 1440 and 390. Does any section repeat its neighbour? Is there a dead band?
