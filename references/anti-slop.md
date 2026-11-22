# Machine-made tells

Interfaces made without decisions fail in the same predictable ways. This is the list. Every item pairs the tell with the fix. When you find one on a screen you are working on, **remove it and fix it as part of the work**; mention it in the report only if it mattered.

Items marked `[scan]` are found automatically by `scripts/signs.mjs`. The rest need your eyes on the screenshots.

A third caution: a tell can be a **choice**. When the project's direction (`directions.md`) commits to a device on purpose, names it, and uses it consistently where it belongs, it is part of the look, not a tell, and you keep it (passing it to `signs.mjs --allow` and naming it in the report). Habit is a tell. A committed device is a decision. What is never a choice: gradient text, emoji as icons, stock imagery, and proof you cannot back up.

Two cautions. First, removing a tell leaves space: never fill that space with a different trend (glass, grain, neon, bento boxes). Fill it with scale, real content or nothing. Second, a tell that is part of the project's own brand guide is not a tell for that project. Keep it and say so.

## Surfaces and colour

- `[scan]` Violet-to-blue, violet-to-pink or any hue-to-hue gradient on backgrounds, cards, buttons or the active nav item → one neutral surface, accent only where it means something. **Exception:** a lit ground in one temperature family with grain, licensed by the direction (`materials.md`), is a material, not a tell. A rainbow is still a rainbow.
- `[scan]` Gradient text in headings, figures or the logo → solid primary text colour.
- `[scan]` Coloured glows (`box-shadow: 0 0 20px rgba(139,92,246,.5)`, `drop-shadow` on emoji, glowing pills) → remove; depth from surface steps and hairlines.
- Radial colour washes or blurred blobs behind content → remove. A ground with a light direction, one family and grain is not a wash (`materials.md`); a blob with no direction is.
- `[scan]` Neon or high-contrast coloured borders → hairline at 6 to 10% opacity.
- Five near-identical tints of one hue for text → three text roles from one neutral ramp.
- Everything highlighted, so nothing stands out → one accent, once or twice per screen.
- Glass cards: translucent fill, blur, white inner highlight, coloured shadow → a plain raised surface with a hairline. Glass over a real image or a lit ground is depth (`materials.md`); glass over a flat fill is a tell.
- A background that reads as brown, orange, blue or green on an app screen → neutral surfaces; the world shows in the accent, the charts, the moments.

## Type

- `[scan]` Headings at weight 800 or 900 → 400 to 500, and size for hierarchy.
- `[scan]` Uppercase labels with wide tracking (`NAVIGATION`, `PAID THIS MONTH`) → sentence case at normal tracking.
- `[scan]` More than six sizes or three weights on one screen → a few sizes from the scale.
- `[scan]` Text under 12 px (or under 11 px on mobile) → raise it.
- Numbers in mixed formats (`$48,210` beside `$124,860.40`, `07`) → one format, tabular figures.
- Negative letter spacing on small text → zero or slightly positive.
- Italic as emphasis in UI text → colour or size. Italic in a display face at 24 px or more is typography, not emphasis.
- A headline broken to three or more lines at desktop width → cut words, then widen the measure, then reduce size.

## Icons

- `[scan]` Emoji as nav icons, label decoration or status (🏠 📥 🚀 💰 ⚠️ 📈 🔥) → one line-icon set, or nothing.
- Emoji inside pills and counts → the plain number.
- Icons in several sizes and colours → one size, one stroke, text-role colour.
- Icons nudged off their column → one icon box width in every row.
- `[scan]` A sparkle ✨ standing for "AI" → remove, or a plain icon where it explains something.

## Spacing

- `[scan]` Off-grid values (`13px`, `7px`, `31px`) → steps from the scale.
- Rows in one list with different heights or gaps → one height, one gap.
- Groups closer to their neighbours than to their own items → smaller gaps inside, bigger between.
- Sibling cards with unequal padding → one padding.
- Big gap above a section and a cramped one below → one rhythm.

## Copy

- Greeting headlines (`Welcome back, Sam! 👋`) → the page or period as the title.
- `[scan]` Exclamation marks in interface text → a plain statement.
- Changes with no reference (`+12%!!`) → `+12% vs last month`.
- Wordy placeholders (`Search anything...`) → `Search`.
- `[scan]` Hype words (supercharge, seamless, unlock, magic, revolutionize, game-changing, effortless) → what the thing does.
- Trailing periods on labels, buttons and headlines → none (paragraphs keep theirs).
- `[scan]` Claims nobody can check (`Loved by 10,000+ teams`, `10x faster`, five stars with no source) → ask whether they are real; if not, remove.
- Fake-looking data (`$123,456`, `[X]`, `John Doe`, `Lorem ipsum`) → plausible numbers and names.
- `[scan]` `PRO`, `New ✨`, `Beta 🚀` badges everywhere → remove, or one quiet text badge.
- `[scan]` Errors that blame or shrug (`Oops! Something went wrong`) → say what happened and what to do next.
- `[scan]` Buttons that say nothing about what happens (`Submit`, `OK`, `Click here`, `Yes`) → name the action: `Save and continue`, `Add this machine`.

## Components

- Glowing pills for counts, plans, shortcuts, status → quiet mono or muted text; keycaps for shortcuts.
- Every element a full pill (search, buttons, cards) → radius by size.
- Charts with rainbow bars, glowing bars, pill bars, uppercase axis labels → one or two series, muted grid and labels, one highlight colour.
- Every stack in several shades of the accent → neutral steps; accent only on the one thing that matters.
- Sparklines, tallies or mini bars bolted onto every stat card → the label, the number, its change.
- A row of equal cards with the same chart or layout → one main chart, compact stats, varied widths.
- Logo as a gradient tile with a sparkle, or a glossy orb → the product name as text, plus a simple flat mark.
- Icon-topped feature cards with a bold title and a vague line each → fewer features, concrete copy, no icons.

## Landing pages and heroes

- A pill badge above the headline (`✨ Introducing X 2.0`) → remove, or a quiet link if it is real news.
- A headline that fits any product (`Supercharge your workflow with AI`) → say what this product does, for whom.
- Floating blobs, orbs, glowing grids or lines behind the hero → a plain background or one real product visual.
- Everything stacked and centred (headline, subhead, buttons, picture) → an asymmetric split, or text over a large product view.
- Three or more buttons, or chips and avatars stacked under the buttons → one primary action, at most one secondary.
- Parallax and floating elements on scroll → static layout. One element at 8 to 12% travel is depth (`motion.md`); every section drifting is a theme-park ride.
- A visual in every section → one visual where it helps, usually the hero.
- Stock robots, glowing brains, circuit lines, holograms for anything AI → show what the AI actually produces.
- Text, fake buttons or a fake logo baked into an image → real text in the page.

## Motion

- `[scan]` `animate-pulse`, `animate-ping` or breathing glows on things that are not live → static.
- `[scan]` `transition: all` and `hover:scale` on cards → colour or surface step on hover; a tiny scale on press.
- Bouncy springs and overshoot on ordinary UI → one ease-out curve.
- Everything flying in on load from different directions → one short fade and rise with a small stagger.
- Animating width, height, top, left or margins → transform and opacity.
- Infinite shimmer on headings or decorative elements → remove.
- A marquee or drifting ground that cannot be paused → mark it `data-loop`, pause it on hover and focus, and stop it under reduced motion (`motion.md`).

## Hover and press

- A control whose hover is a colour change and nothing else → add one movement: fill sweep, arrow travel or underline draw (`hover.md`).
- A hover that takes 300 ms to appear → 160 to 220 ms in, 120 to 160 ms out.
- A card that scales up on hover → lift 3 px; scaling blurs text and shifts neighbours.
- Hover rules that move the layout → animate transform, never size.
- No press state → `:active` scale 0.98, 100 to 120 ms.
- Hover rules outside `@media (hover: hover)` → the first tap on a phone is eaten.
- `outline: none` with no replacement → a 2 px focus ring, offset 3 px.
- Every control doing the same hover → weight by importance: primary fills, secondary underlines, tertiary steps colour.

## Terminal UI

- Rainbow output: every line a different colour → two or three colours with meaning.
- Emoji as bullets or status → plain symbols (`✓`, `✗`, `•`) or words, in a colour that means something.
- Box-drawing frames around everything → whitespace and one rule where it helps.
- Spinners that never resolve to a result line → replace the spinner with the outcome when it ends.
- Output that wraps badly at 80 columns → wrap at the real width; test narrow and wide.
- Walls of text with no hierarchy → bold for the one thing to read first, dim for the rest.
- ASCII-art banners on every run → at most on first run or `--version`.

## Native mobile

- A web layout squeezed onto a phone → the platform's navigation (tab bar, back gesture), not a hamburger.
- Targets under 44 pt (iOS) or 48 dp (Android) → enlarge.
- Custom controls where a standard one exists (switch, picker, sheet) → the standard control, styled to the brand.
- Bottom actions hidden behind the home indicator or keyboard → respect safe areas and insets.
- Text that does not scale with the system size setting → dynamic type, scalable pixels.

## The template look

Not slop, but what a cleaned-up screen falls back to when nobody decides anything. Check for it after every pass.

- Pure grey page, Inter, white text, the old brand colour on one button, on a product whose world is warm or bright → a ramp tinted toward the world and an accent from it.
- A headline that would still fit if you swapped in a competitor's name → use this product's own nouns.
- A hero visual that is an empty box or a generic picture → a product preview in code, or an image from the product's world.
- Every product getting the same layout, type and palette → let the direction decide.

---

The first six sections adapt the "signs of slop" list from unslop by Damir Sokolovsky ([@heydamir](https://x.com/heydamir)), CC BY 4.0, reorganised and extended. See `NOTICE.md`.
