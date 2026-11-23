# Step 7: Look

Numbers do not catch everything. Open the real screen and look at it as a person would. Fix what shows, then look again.

## The four widths

`shoot.mjs` captures the first screen of each width by default. Pass `--slices` (every screenful) or `--full` to see the rest of a long page; a hero that looks right says nothing about the footer.

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

## Feels cheap

For Operate screens and anything with state, also walk `feels-cheap.md` against the running screen: trust, feedback and errors, loading, retention, consistency, permissions and navigation. Break the screen on purpose (bad input, no network, empty account) and see what it says.

## States and interaction

A screen has more than one picture. Look at each state it can be in, not only the one it loads in: a menu open, a tab or toggle switched, an empty list, an error, a long name, a selected item. Use `shoot.mjs --eval 'js'` to put the page in a state before the shot (wrap anything that waits in an async function: `--eval "(async () => { document.querySelector('#yearly').click(); })()"`), or give the page a `#hash` or `?state=` that sets it and shoot that URL.

A single page that shows several states for review (sign-up, error, first step) needs a **preview switcher**: a small control kept clear of the real interface (a strip at the top or a dock at a corner that does not overlap the form at any width), labelled as a preview, and easy to delete. Never let it cover content, and say in the report that it is scaffolding.

## Hover, with your eyes

A screenshot of the resting page cannot tell you whether the page feels alive. Run `scripts/craft.mjs <url> --shots shots/hover` and look at the pairs it writes: every control, at rest and under the pointer. Then judge them, because the script only proves something changed:

- Does the change suit the control? A link takes the accent and thickens its rule; a button fills; a card lifts a little. A control that changes colour for no reason reads as a bug.
- Is it quick enough to feel like a reply? Around 150 to 250 ms. Slower feels sticky, instant feels dead.
- Does anything jump? Text that reflows, a box that grows, a neighbour that shifts. Hover must not move the layout.
- Is it too loud? A whole row turning red on hover is a shout. If five of them are on screen, it is five shouts.

If a control has no hover state, that is a defect, not a preference: the page stops feeling like software.

## Rounds

Look, fix, look again until nothing is wrong, **at most three rounds** of the whole-screen look. This is separate from the quick render-and-check after each section in the Build step, which is free: build one section, glance at it, move on. Rounds count only the full looks at the finished screen. After the third, show the screen and list honestly what is left over. Do not pretend a known flaw is fine, and do not keep polishing past three rounds: the person's taste feedback is worth more than a fourth pass.

Checking the screens does not count toward the rounds. Re-run `shoot.mjs` as often as you need.

## Finding the flaw

When something looks off and you cannot name why, measure: gaps, widths, alignment lines. Draw the lines on the screenshot mentally: left edges, baselines, centres. The flaw is nearly always a number that is not what it should be.
