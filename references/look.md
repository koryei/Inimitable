# Step 7: Look

Numbers do not catch everything. Open the real screen and look at it as a person would. Fix what shows, then look again.

## The four widths

Always render at **320** (small phone), **390** (phone), **1440** (desktop) and **2560** (big screen) with `scripts/shoot.mjs`. A terminal UI is checked at its narrow and wide column counts (60 and 120) with `scripts/term-shot.mjs`. A native screen is checked on the smallest and largest device sizes the project supports.

Also look at: dark and light themes if both exist; the empty, loading and error states; long and short content; the browser at 200% zoom.

## What to look for

Go through the images in this order and write down every problem:

1. **The star.** Is it the first thing you see? Is the second thing obviously second?
2. **Grouping and rhythm.** Do groups read as groups? Does space have a pattern?
3. **Alignment.** Do icons, labels, numbers and edges line up?
4. **Hierarchy.** Could you tell what is a title, a label, a value, a hint by size and colour alone?
5. **Balance at every width.** Dead bands, huddled sections, lopsided heroes, text hanging over images.
6. **Small screens.** Wrapping, overlaps, cut-off text, unreachable controls, text under 12 px.
7. **Big screens.** Lines of text too long, content floating in a sea of space, blown-up UI.
8. **The tells.** Read `anti-slop.md` against the picture one more time.
9. **The template check.** Would this screen still fit a competitor if the name were swapped?

## Rounds

Look, fix, look again until nothing is wrong, **at most three rounds**. After the third, show the screen and list honestly what is left over. Do not pretend a known flaw is fine, and do not keep polishing past three rounds: the person's taste feedback is worth more than a fourth pass.

Checking the screens does not count toward the rounds. Re-run `shoot.mjs` as often as you need.

## Finding the flaw

When something looks off and you cannot name why, measure: gaps, widths, alignment lines. Draw the lines on the screenshot mentally: left edges, baselines, centres. The flaw is nearly always a number that is not what it should be.
