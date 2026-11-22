# Step 6: Gate

Run the checks before anyone looks at the screen. The gate has two halves.

## Half one: the project's own checks

Find them (`package.json` scripts, `Makefile`, CI config, `CLAUDE.md`): usually lint, typecheck, tests, build. Run them all.

- **A check fails:** fix what your work broke and run again. Move on only when green.
- **It fails for a reason that is not yours** (it failed before you started): say so, and show that by the same check on the clean tree. Do not hide it and do not fix unrelated things.
- **You cannot get it green:** stop and say what is failing and why.

## Half two: design checks, measured

| Check | Command | Passes when |
| --- | --- | --- |
| Drift | `node scripts/drift.mjs <screen> --against before.json` | font sizes, weights, radii, colour hues and off-grid values are the same or lower than before, and within the scale |
| Contrast and targets | `node scripts/check.mjs <screen>` | every text and control pair meets contrast; touch targets are at least 44 px on mobile |
| Tells | `node scripts/signs.mjs <screen>` | no `[scan]` tells remain, except ones the project's own rules require |
| Overflow and errors | `node scripts/shoot.mjs <screen>` | no sideways scroll at any width, no console errors |

For a terminal UI, the gate runs `scripts/term-shot.mjs` at 60 and 120 columns instead (no line over the width, no lost colour meaning when colour is off).

## After the gate

Keep the gate's output: the drift comparison is the "after" half of the report.

## If the project has no checks

Say so in one line and rely on the measured half. Do not add a test framework to a project to satisfy this step.
