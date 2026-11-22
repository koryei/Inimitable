# Step 4A: Fix an existing screen, layer by layer

Work like a designer doing a redline pass: **one layer at a time, across the whole screen**, then the next. Never polish one card to perfection while the rest is untouched.

## The order

1. [Spacing](layers/spacing.md)
2. [Colour](layers/colour.md)
3. [Icons](layers/icons.md)
4. [Copy](layers/copy.md)
5. [Type](layers/type.md)
6. [Layout](layers/layout.md)
7. [Details](layers/details.md)
8. [Motion](layers/motion.md)

Why this order: spacing first, because everything reads differently once the rhythm is right. Copy before type and layout, because the length of a headline decides its size and position. Motion last, because it must fit a screen that already works without it.

## First decide how much to change

Read the before images and the drift numbers honestly.

- **Heavy:** many tells across colour, type, icons and copy. Run every layer.
- **Light:** mostly designed, a few tells left. Polish: fix only what the audit found, keep the palette, type, layout and visual, take the direction from the existing brand. Bigger ideas go into the report as suggestions, not changes.
- **Clean:** say so plainly, suggest at most three small refinements with exact values, and apply them only if asked. Never change a good screen just to make it different.

## Audit first

Run `scripts/signs.mjs` on each screen and read `anti-slop.md` against the screenshots. Write one line per tell with where it lives. This list drives the passes.

## Rules for every pass

- Keep the product: its features, content and section order stay. What changes is that every size, colour, word and image becomes deliberate.
- Do not rename the product. Keep a real logo. If the logo itself is a tell (an emoji, a sparkle in a gradient tile), redraw it flat: wordmark alone, or a simple glyph in one solid colour.
- Do not replace removed decoration with new decoration.
- Do not invent features, claims or data. Placeholder content that means nothing may become content that does, using facts already on the page.
- When nearly every line changes, plan the passes in order and then write the new screen in one go, provided every pass is applied.
- Edit in the project's own stack and conventions: its components, tokens, class names. Never leave story scaffolding or one-off values behind.

## After the eighth pass

Run the template check in `anti-slop.md` ("The template look"): a clean screen that could belong to any product is the next template. If so, push the direction harder through copy, the star, and the signature detail.
