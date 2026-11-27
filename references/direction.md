# Step 3: Fix the direction

The direction is a five-line concept and five short lines, written before anything is edited or scaffolded. It is what keeps forty small decisions pointing the same way. Write it from the product in front of you, never from what is fashionable.

## First: the concept (five lines)

A page is replaceable when only its words and its picture are its own. A strong picture inside the usual frame (a thin nav with one dark button, a headline beside a card, three steps, a closing panel) still reads as one more template: in round 6 of the evals, judges called every skilled page interchangeable for exactly that reason, while pages that carried the product's own material from top to bottom were the ones they remembered. Decide what the page shows, **how it is laid out and what it is made of**, from the subject inventory, before the scaffold and before any colour.

Answer in order:

1. **Native artifact.** What does this product actually produce or handle? A tide table, a firing schedule, a sewing pattern, a receipt, a message that dissolves. Not "a dashboard", not "insights", not "your data". Name the moment the person gets what they came for, as it would look on a screen.
2. **Without the category word.** Describe the first screen without "AI", "platform", "CRM", "workflow", "dashboard", "all-in-one" or the product's category. What is on it? If the answer is "a headline and a product card", you have nothing yet.
3. **Signature.** Choose **one**: an artwork (the artifact drawn large, a ground made from it, a duotone of its subject) or an interaction (one thing that answers the pointer in a way only this product would).
4. **Layout.** Take it from the shape of the artifact. Which way does it run, what repeats, where does the eye land?

   | The artifact | The page can |
   | --- | --- |
   | runs down (a record that grows) | run it down the page, with the sections hanging off it |
   | runs across (a span of time or distance) | run it across the full width, with the copy above and below |
   | is a grid | use that grid as the page's own columns and rows |
   | is a sheet | be the sheet, with notes in the margin |
   | is one object | stand it in the middle and set the words around it |
   | is only words | set them large and let type be the layout |

5. **Material.** One thing the artifact is made of: its scale, rule, unit, mark or texture. Draw it in the page itself, on the first screen and in at least two more places, or as one line that runs down the page. Mark each with `data-device="name"`. It has to mean something (a scale that reads real or example values, a rule that separates real parts). A texture sprinkled for decoration is not a material.

Then pick the **ground on purpose**: lit (the soft grainy gradient), flat colour, a dark framed panel, a duotone, or the artifact itself. The lit gradient is the default of machine-built pages now, so it needs a reason of its own (`landing-craft.md` decision 1, `directions.md`).

Write it as five lines and keep it where the run can see it (the top of the report, and the project's notes in the Log step). An example, for a harbour tide app:

```text
Artifact: a tide curve for one day, at the moment the water is high enough to launch.
Without the category word: one curve across the whole screen, the launch window shaded on it, the headline riding above.
Signature: the curve answers the pointer with the depth at that hour. Ground: flat deep water blue, because the curve is the picture.
Layout: across. Every section sits on the same hour axis; there is no card and no panel.
Material: the hour ticks, on the curve, under each section heading and along the footer.
```

The example is not a template. Agents have copied an example's ground before and made unrelated products look alike. If your reason is the example's reason, check that it is also true here.

**Keep what people need, change the frame.** Visitors still have to learn what the product is, see how to act and find their way, on the first screen and at every width. Those conventions stay. The nav's shape, where the headline sits, the order of the sections and how the page closes are yours to decide.

How much of this applies depends on the mode (`modes.md`). Persuade and Experience need all of it. Operate needs the artifact and the material in miniature: they decide the key figure, the chart's scale and the empty state, and the layout follows the work. Read and Terminal need only line one. When the project has design rules they set the colours, type and ground; the concept still decides what the page shows and where.

**The test comes at the gate** (`gate.md`): remove the product name and check that the first screen still says something only this product could say, then check that the frame is not the starter's or a sibling page's and that the material runs through. If you cannot name the artifact in one line, the page will fail, so do not scaffold yet.

## When the project has design rules

Take the direction **from them**. State it in one sentence (what the screen should feel like, and what it must never look like), name the signature if there is one, and proceed. Do not invent a new direction over a real brand.

> Example: *Calm and exact, like a good instrument. Never glowing, decorated or loud. Accent only on the cursor and live states.*

## When it has none

Draft a direction and a few rules from the subject inventory (`read.md`), **show them, and wait for a yes** before building. Changing the direction later means redoing everything, so the wait is cheap. Skip the wait only if the person has already said to just do it, **or nobody can answer** (a one-shot or non-interactive run). In that case write the five lines, state them at the top of the report as assumptions, and build. Do not stall.

## Start from a proven direction

`directions.md` is a library of committed looks (Instrument dark and light, Blueprint, Horizon, Dithered data, Warm editorial) with their palettes, devices and recipes. Pick the closest to the product, then make it this product's own with the subject inventory. When a direction commits to a **device** that the anti-slop list would normally remove (small uppercase mono labels, a gradient surface), name it in the direction. Name at most four devices, use them consistently, and pass them to the scanner with `--allow` when you run the gate.

## The five lines

The concept said what the page shows and how it is built. These five say how it should feel.

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
