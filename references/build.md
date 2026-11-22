# Step 5: Build

## Principles

- **Reuse first.** Use the project's components, tokens and icon set. Add a new piece only when nothing fits, and name it in the report. A screen that matches its own app beats a prettier one that does not.
- **One section at a time.** Build a section, render it, check it, then the next. A mistake in the grid found at section one costs minutes; found at section six it costs the whole screen.
- **Real content.** Real copy, plausible data, real states. A section is not built until its empty, loading and error states exist.
- **Tokens, not values.** Colours, spacing, radii and type come from tokens. A raw value in a component is a defect.
- **Semantic markup.** Real headings in order, landmarks, buttons that are buttons, labels tied to inputs, one `h1`.
- **Small units.** Components do one job. Repeated structure is one component.
- **No scaffolding left behind**: no commented-out experiments, no `lorem`, no dead styles.

## Per section loop

1. Write the section's copy.
2. Build the markup and styles.
3. Render at 390 and 1440 with `scripts/shoot.mjs --widths 390,1440`.
4. Look at the pictures: grouping, alignment, hierarchy, the star.
5. Fix. Move on only when the section is right.

## Parts and motion

Before you write a component, read `components.md` for the states and behaviours it needs, and `motion.md` for how it should open, close and swap. Before you add anything from outside the project (a component, a kit, a transition), read `libraries.md`: ask first, check the licence, and re-skin it to the project's tokens.

## Accessibility is part of building

- Contrast 4.5:1 body, 3:1 large text and UI parts.
- Visible focus ring on every interactive element; logical tab order.
- Touch targets 44 px (iOS 44 pt, Android 48 dp).
- Text resizes to 200% without loss; layout reflows at 320 px.
- Motion respects `prefers-reduced-motion`.
- Colour is never the only signal (add text or an icon to status colours).
- Images have alt text or are marked decorative; icon-only buttons have names.

## Performance basics

- Fonts: one or two families, `font-display: swap`, subset if self-hosting.
- Images sized to their slot, modern formats, lazy below the fold, explicit width and height to avoid layout shift.
- No animation of layout properties.

## Respect the stack

Match the project's framework, styling approach and file layout. A Tailwind project gets Tailwind classes; a CSS-modules project gets modules. Do not introduce a new library to build one screen unless nothing in the project can do the job.
