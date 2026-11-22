# Layer 1: Spacing

## Rules

- **Everything sits on a 4 px grid.** Margins, paddings, gaps and fixed heights are multiples of 4. 28 or 104 are fine even if not in the scale. A 2 px nudge inside a small control is fine, and an odd value that exactly centres something stays.
- **Same thing, same size.** All rows in a list share one height and one gap. All cards in a row share one padding.
- **Space shows grouping.** Space inside a group is smaller than space between groups, so a list reads as one block and sections read as separate ones.
- **Things line up.** Icons in one column, labels on one line, numbers right-aligned in one column. No stray `translate` or odd margin to nudge something into place.
- **Padding follows density.** Compact panels and sidebars 16, cards 20 to 24, page edges 24 to 32 (16 on phones).
- **Navigation is the densest part.** Rows 32 to 36 tall, 2 to 4 between, icons in one column, labels on one line. A section label is closer to its own items than to the section above (about 24 above, 8 below). Measure the sidebar after the pass: it is where spacing breaks first.
- **Remove one-offs** (`mt-[13px]`, `py-[11px]`, `h-[31px]`) and replace with scale steps.

## How

1. Run `scripts/drift.mjs`; the list of off-grid values is your worklist.
2. Search the code for those values and arbitrary Tailwind brackets.
3. Replace each with the nearest scale step, choosing by grouping, not by closest number: if two items are in one group, the gap should be among the smaller steps.
4. Fix repeated structure first (a list row component fixes every row at once).

## Check

- `drift.mjs` reports 100% on grid (or the remainder is justified).
- Equal elements measure equal. Screenshot at 390 and 1440: groups read as groups.
