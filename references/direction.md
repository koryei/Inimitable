# Step 3: Fix the direction

The direction is a three-line concept and five short lines, written before anything is edited or scaffolded. It is what keeps forty small decisions pointing the same way. Write it from the product in front of you, never from what is fashionable.

## First: the concept (three lines)

A page is replaceable when only its skeleton is its own. For a landing page the skeleton is now a genre: a thin nav with one dark button, a small trust line, a centred two-line headline, a muted subhead, two buttons, a product card cropped at the fold, a logo strip. Nearly every product in a category has it, which is why it is safe to keep. What a visitor remembers is what sits behind and beside it: the artwork, the ground, one thing that moves. Decide that first, from the subject inventory, before the scaffold and before any colour.

Answer in one line each:

1. **Native artifact.** What does this product actually produce or handle? A marked-up contract, a strip log of drill cores, a tide table, a receipt, a rota, a message that dissolves. Not "a dashboard", not "insights", not "your data".
2. **Moment of value.** The one instant the person gets what they came for, as it would look on a screen: the clause that deviates, the layer boundary at 14 m, the shift that has no cover.
3. **Without the category word.** Describe the first screen without "AI", "platform", "CRM", "workflow", "dashboard", "all-in-one" or the product's category. What is on it? If the answer is "a headline and a product card", you have only the skeleton.
4. **Signature.** Choose **one**: an artwork (the artifact drawn large, a ground made from it, a duotone of its subject) or an interaction (one thing that answers the pointer in a way only this product would). Everything else stays calm: the skeleton, the type, the scale.

Then pick the **ground on purpose**: lit (the soft grainy gradient), flat colour, a dark framed panel, a duotone, or the artifact itself. The lit gradient is the default of machine-built pages now, so it needs a reason of its own (`landing-craft.md` decision 1, `directions.md`). One clause is enough: *lit, because the product is about light on water*.

Write the concept as three lines and keep it where the run can see it (the top of the report, and the project's notes in the Log step):

```text
Artifact: a core-sample strip log, at the moment a layer boundary is marked.
Without the category word: a strip log drawn large, depth ticks down the side, the headline set beside it.
Signature: the strip log, drawn in code and set in one colour. Ground: flat, because the log is the picture. Everything else calm.
```

The three lines above are an example, not a template. In round 6 of the evals all three agents copied the example's ground (flat sand) for three different products, which makes the three pages look alike. Take the tone and the ground from this product's own world, and if your reason is the example's reason, check that it is also true here.

How much of this applies depends on the mode (`modes.md`). Persuade and Experience need all of it. Operate needs the first two lines in miniature: the artifact decides the key figure and the empty state. Read and Terminal need only line one. When the project has design rules they set the colours, type and ground; the concept still decides what the page shows and where.

**The swap-the-name test comes at the gate** (`gate.md`): remove the product name and check that the first screen still says something only this product could say. If you cannot name the artifact in one line, the page will fail it, so do not scaffold yet.

## When the project has design rules

Take the direction **from them**. State it in one sentence (what the screen should feel like, and what it must never look like), name the signature if there is one, and proceed. Do not invent a new direction over a real brand.

> Example: *Calm and exact, like a good instrument. Never glowing, decorated or loud. Accent only on the cursor and live states.*

## When it has none

Draft a direction and a few rules from the subject inventory (`read.md`), **show them, and wait for a yes** before building. Changing the direction later means redoing everything, so the wait is cheap. Skip the wait only if the person has already said to just do it, **or nobody can answer** (a one-shot or non-interactive run). In that case write the five lines, state them at the top of the report as assumptions, and build. Do not stall.

## Start from a proven direction

`directions.md` is a library of committed looks (Instrument dark and light, Blueprint, Horizon, Dithered data, Warm editorial) with their palettes, devices and recipes. Pick the closest to the product, then make it this product's own with the subject inventory. When a direction commits to a **device** that the anti-slop list would normally remove (small uppercase mono labels, a gradient surface), name it in the direction. Name at most four devices, use them consistently, and pass them to the scanner with `--allow` when you run the gate.

## The five lines

The concept said what the page shows. These five say how it should feel.

- **Product.** What it does and for whom, in one plain sentence.
- **Character.** Two or three concrete words (*calm, exact, a little warm*; *fast, technical, playful*). Not allowed: clean, modern, sleek, minimal, premium. They describe every template.
- **World.** The place or material the product naturally belongs to: paper and ink for notes, instruments and night shifts for monitoring, maps and window light for travel. The world sets the tint of the neutrals, the accent, and the star.
- **Moments.** One or two places where the screen gets rich colour, material or detail, chosen from what the product shows: a rendered object, a chart whose colours each mean a series, a figure set beautifully.
- **Signature.** One small detail only this product would have, used consistently: a live status dot, keycaps, a route line. One, not five.

## Checks on the direction

- **Swap test.** Replace the product name with a competitor's. Does the direction still fit? Then it is too generic.
- **Costume test.** A world taken from a tool or an artifact (a terminal, a cockpit, a newspaper) lends type, palette, density and one signature move. It never supplies the layout or controls of a working screen.
- **Brand test.** Does it fit the brand guide? If it fights it, the guide wins.

## The negative half

Say what it must **not** look like in one clause. "Not a dashboard template", "not a crypto landing page", "not a chat bubble UI". The negative keeps the passes honest when the positive is vague.
