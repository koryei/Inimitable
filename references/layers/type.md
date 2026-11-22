# Layer 5: Type

## Rules

- **Choose type for the character** in the direction (families table in `house-rules.md`). Keep the project's font when it is part of a real brand. A default nobody chose (Inter on everything) may be swapped when another family fits better.
- **One family for the interface**, plus at most one partner: a mono for figures and meta, or a display face for large headlines. A display serif belongs to large headlines only, never labels or buttons.
- **A few sizes from a scale, two weights** (400 and 500; 600 at most for rare emphasis). No 700 to 900 headings. No gradient text.
- **Hierarchy comes from size and colour, not weight.**
- **Sentence case.** `NAVIGATION` and `PAID THIS MONTH` with wide tracking become `Navigation` and `Paid this month`.
- **Small text never gets negative tracking.** If small text is hard to read, make it bigger, a little heavier, or looser. Tight tracking is for display text only.
- **Numbers use tabular figures** and one format across the screen.
- **No italic for emphasis.**
- **Line length 45 to 75 characters** for running text; line height 1.45 to 1.6 for body.
- **Headlines break to two lines or fewer** at every width. Cut words first, widen the measure second, reduce size last.
- Font loading: no flash of invisible text; set `font-display: swap` and a close fallback stack.

## How

1. From `drift.mjs`: the list of sizes and weights. Map each to the nearest scale step.
2. Set the type scale as tokens or utility classes. Replace per-element font sizes.
3. Check every headline at 320 px and 2560 px for line count.

## Check

- Six sizes or fewer; weights 400 and 500 (600 rare); no tiny uppercase labels.
- No text under 12 px (11 px on mobile at the very smallest).
