# Layer 2: Colour

## Rules

- **One neutral ramp**, tinted toward the product's world. Background, raised surfaces, borders and text all come from it (`house-rules.md` has ramps).
- **Apps stay neutral.** On app and dashboard screens surfaces, borders and text are grey; content carries the colour. A background that reads orange, brown, blue or green has gone too far. Landing pages and showpieces may tint surfaces further.
- **Three text roles**: primary, secondary, muted. Not ten lavenders.
- **One accent, used rarely**, on the primary action, the selection, or the one number that matters.
- **A real brand colour** becomes the accent and leaves the surfaces. No brand colour: take one from the world (warm → amber, coral; cool → cobalt, teal; natural → moss). Avoid the violet-to-blue family unless the brand really is violet.
- **Contrast is a floor**: text on the accent 4.5:1; accent as text on a light surface needs a darker shade of it.
- **Dark themes** may use an off-white primary button with dark text and keep the accent for a smaller place. It often looks more deliberate than a coloured button.
- **Semantic colour only carries meaning** (good, error, warning) and is toned down to sit in the palette.
- **Remove:** hue gradients on surfaces, gradient text, coloured glows and shadows, radial washes, blobs, neon borders.
- **Hairlines**: primary text colour at 6 to 10% opacity.
- **A gradient** is allowed only as a small tone shift within one neutral (an active row from `#2b2b2b` to `#1f1f1f`).
- **Moments are the exception.** Inside the star (a chart with real series, a rendered object, an image with its own light) colour can be rich, as long as each colour means something.

## How

1. List every colour in use (`drift.mjs` output). Group them into ramp steps.
2. Define the ramp as tokens if the project has none; map every colour to a token.
3. Choose the accent, check its contrast, apply it to at most the primary action, selection and one figure.
4. Delete gradients, glows and washes; set surfaces to solid steps.

## Check

- At most two hue bands in the drift report (accent and semantic).
- Text colours: three roles. Contrast passes in `scripts/check.mjs`.
