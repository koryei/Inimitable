# Evals

How Inimitable is tested and improved. A design skill is only as good as the screens it produces, so the skill is measured on real briefs, against the same agent with no skill, and fixed wherever it loses.

## The loop

1. **Briefs.** `briefs/` holds realistic requests with real content and constraints: landing page, dashboard, settings form, pricing, sign-up flow, docs, terminal output.
2. **Two arms.** For each brief, one agent builds with **no skill** (the baseline) and one builds **with the skill** (told to read `SKILL.md`, follow the run, and use the scripts). Same model, same brief, same output format.
3. **Mechanical score.** `node scripts/score.mjs <file>` runs every measuring script and prints one number out of 100 and the list of what cost points. It is a floor: it sees tells, accessibility and state problems, drift and overflow. It cannot see taste.
4. **Visual score.** Each page is rendered at 390 and 1440 px and rated against the rubric below, blind to which arm made it.
5. **Learn.** For every loss, or every place the skilled page is merely fine, find the instruction that was missing, unclear or wrong, and fix it in `SKILL.md` or `references/`. Agents are also asked what was unclear.
6. **Repeat** on the same briefs and on new ones. A change is kept only if it helps and breaks nothing.

Results are written to `results/` with the date, the scores and the changes they led to.

## Mechanical score

`scripts/lib/score.mjs`. Starts at 100 and subtracts:

| Cost | Per |
| --- | --- |
| 3 | each distinct kind of machine-made tell found |
| 0.25 | each further instance of a kind (capped at 10 in total) |
| 2 | each distinct contrast, target, name, focus or layout-shift problem |
| 2 | each drift flag (too many sizes, weights, radii, off-grid spacing, hues) |
| 10 | scrolling sideways at 320, 390, 1440 or 2560 px |
| 5 | console errors |

A score of 100 means the scripts found nothing, not that the page is good.

## Visual rubric

Rate each from 1 (poor) to 5 (excellent) from the screenshots. Judge the page, not the intentions.

| # | Criterion | 5 looks like |
| --- | --- | --- |
| 1 | **The star** | One thing is clearly first and belongs to this product; the second thing is clearly second |
| 2 | **Hierarchy** | The squint test passes; sizes and colours step decisively |
| 3 | **Grouping and rhythm** | Space groups things without lines; spacing follows a visible rhythm |
| 4 | **Type** | A clear scale, comfortable measure and leading, no more than two weights |
| 5 | **Colour restraint** | Neutral ramp plus at most one accent; contrast comfortable |
| 6 | **Copy** | Specific to the product, no hype, nothing invented, buttons say what happens |
| 7 | **States and honesty** | Empty, error, loading, success and long content are designed where relevant |
| 8 | **Responsive craft** | Both phone and desktop look designed, not squeezed or stretched |
| 9 | **Details** | Alignment, radii, icons, focus, hover and controls are finished |
| 10 | **Distinctiveness** | It does not look like a template; swapping the name would not fit |

A page's visual score is the sum (out of 50). Judge blind where possible: shuffle the files, do not look at which arm made them.

## Running a round

1. Copy `briefs/` to a scratch folder so the baseline agent cannot wander into the skill.
2. Launch one baseline and one skilled agent per brief. Baseline: "do not use any skills". Skilled: "read `SKILL.md`, follow the run, use the scripts, report what was unclear".
3. Score each file mechanically, then rate screenshots against the rubric, blind.
4. Write the round in `results/YYYY-MM-DD-rN.md`: scores per brief and arm, what the skilled arm still did badly, what in the skill caused it, and the edits made.
5. Re-run the briefs where the skill changed.

## Judging distinctiveness blind

`mask.mjs <page> --name <product> --out dir --label A` renders a page with the product name removed from its text, labels and title (add `--blur-text` to blur every word, so a judge sees only composition, ground and artwork). Give a fresh judge agent, one that built neither page, the masked shots of both arms with a plain description of the product, and ask which page could more easily belong to a different product, which is more memorable, and for an ownability score from 1 to 5. Randomise A and B for each judge, keep the key outside the folder the judge can read, and run more than one judge. `tracking.mjs` measures how tight display type can be set before letters touch.

## Why two arms

Without the baseline you cannot tell whether the skill helped or the model is simply good. Without the skilled arm's own report you cannot tell why it fell short. Both are needed to improve the skill rather than admire it.
