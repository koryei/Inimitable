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
| Contrast, targets and states | `node scripts/check.mjs <screen>` | every text and control pair meets contrast; touch targets are at least 44 px on mobile; every control shows a visible focus style; images reserve their size |
| Tells | `node scripts/signs.mjs <screen> [--allow "Tell,Tell"]` | no `[scan]` tells remain, except devices the committed direction licenses (pass them with `--allow` and name them in the report) |
| Hover, press and motion | `node scripts/craft.mjs <screen>` | every control answers the pointer with a visible change; loops stop under reduced motion; no layout transitions |
| Overflow and errors | `node scripts/shoot.mjs <screen>` | no sideways scroll at any width, no console errors |
| Swap the name (new Persuade or Experience screens) | `node scripts/swap.mjs <screen> --nouns "<nouns from the concept>" --name "<product>"` | with the name removed, the first screen still uses at least two of the product's own nouns and its artwork names the artifact |

### The swap-the-name test

Take the product name off the first screen and ask: does it still say something only this product could say? Two parts, and both are required for a new Persuade or Experience screen.

1. **The script.** `swap.mjs` takes the nouns you wrote in the concept (the native artifact and its parts: *clause*, *redline*, *core sample*, *depth*) and checks the first screen at 1440 px. It strips the name, counts how many of your nouns remain, and requires that the artwork (text in a drawing or product frame, its `aria-label`, `alt` or caption) uses at least one. It refuses nouns that fit any product (*platform*, *team*, *data*, *AI*). If the headline is the signature, pass `--typographic`. It reports a headline that leans on category words, without failing it.
2. **The sentence.** The script cannot see a picture. Write one line in the report: *what does this first screen say that only this product could say?* If the honest answer is "nothing, but it is clean", the gate has failed: go back to the concept and push the signature, then render again.

A pass from the script means the first screen names the product's own things. It does not mean the page is distinctive, and a weak list of nouns can pass it. The sentence is the real test.

For a terminal UI, the gate runs `scripts/term-shot.mjs` at 60 and 120 columns instead (no line over the width, no lost colour meaning when colour is off).

## After the gate

Keep the gate's output: the drift comparison is the "after" half of the report.

## If the project has no checks

Say so in one line and rely on the measured half. Do not add a test framework to a project to satisfy this step.
