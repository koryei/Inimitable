# Step 1: Read

Before changing anything, learn what is real. This step produces notes for yourself and one line for the person: *what you found and what you did not*. It never asks about colours, fonts or vibe. Those come from the project's own rules and the direction step.

## 1. Find the project's own design rules

Look, in this order, and stop collecting once you have enough:

- Brand guide, style guide, `DESIGN.md`, `PRODUCT.md`, design notes in `README`, `CLAUDE.md`, `AGENTS.md`
- Token files: CSS custom properties, `tokens.css`, `theme.ts`, Tailwind config, Figma exports
- Existing components, an icon set, a font setup
- Past screenshots and checklists in `docs/`

Say in one line what you found. **Found rules win** over everything in this skill. Where they are silent, use `house-rules.md` and record that you did.

What the code already does is evidence about the product, never approval of its look. Sloppy styling already in the project is not a rule.

## 2. Establish what is real

- What the product does, and for whom
- The one thing this screen must get the person to do
- The stack, and which components, icons, fonts and images actually exist
- Never plan around a picture, logo or font that does not exist

## 3. Inventory the subject

List eight to twelve things that belong to this client and to no competitor: its name and what it means, its places, numbers, constraints, materials, rituals, vocabulary. This list is where a distinctive idea comes from later. A screen that could belong to any product skipped this list.

## 4. See it running first

If the app can run, run it. Capture **every affected screen** at 390 px and 1440 px with `scripts/shoot.mjs` before touching anything. These are the "before" images. Include empty, loading and error states where they exist. If it cannot run, build a static page that reproduces the screen faithfully and treat that as the original.

Only a screenshot or a live URL given? Reproduce it as one static HTML file first (fonts, colours and spacing as close as you can measure), and say in the report that the result is code for whoever owns the real site.

## 5. Measure the drift

Run `scripts/drift.mjs` on each affected screen and save the result (`--save before.json`). Note the number of font sizes, weights, radii, colour hues, and the share of spacing on the grid. This is the "before" in your report. Compare it with the project's scale if it has one, with `house-rules.md` if not.

## 6. Decide, do not interrogate

A vague request ("make it look better") gets one stated reading and a start: "Reading this as: fix the Activity screen layer by layer, keep its content and the brand guide." Ask a question only when a missing fact blocks the work and cannot be found (which of two products is meant; whether a claim on the page is true).

## What this step produces

- A line: *found brand guide and tokens in X; none for Y.*
- Before screenshots and `before.json`.
- The subject inventory.
- The stated reading of the request.
