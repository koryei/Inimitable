# House rules

Default numbers and rules for when a project has none of its own. If the project has a brand guide, tokens or a design system, those win and this file only fills gaps. These are starting points: the direction (see `direction.md`) may move them, but never without a reason you can state.

## The ten rules

1. **One spacing grid.** Every margin, padding, gap and fixed height is a multiple of 4. Scale: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128.
2. **One neutral ramp.** Background, raised surface, border and text all come from a single tinted grey ramp. Three text roles: primary, secondary, muted.
3. **One accent, used rarely.** It marks the primary action, the selection, or the one number that matters. If the brand has no accent, the star of a screen is made with size and contrast instead.
4. **Six type sizes or fewer** per screen, from the scale below. Two weights (400 and 500); 600 only for rare emphasis. Hierarchy comes from size and colour, not boldness.
5. **One family for the interface**, plus at most one partner (a display face for large headlines). A mono for code and tabular figures is extra and does not count. Three proportional families is too many.
6. **Radius by size, and nested radii add up.** Inner radius = outer radius minus the padding between them, never below 4.
7. **One icon set, one size, one stroke.** Icons take the colour of their text role and never have colours of their own.
8. **One easing curve, three durations.** Motion is feedback or explanation, never decoration. Only colour, background, border, opacity and transform animate.
9. **Contrast is a floor.** Body text 4.5:1, large text and UI parts 3:1, on the real background. Touch targets are at least 44 px on mobile.
10. **Equal things are equal.** Same kind of thing, same size, same gap, same padding, same format.

## Spacing

| Use | Value |
| --- | --- |
| Inside a control | 4 to 12 |
| Between related items (rows in a list) | 2 to 8 |
| Between groups (a label and its list, two cards) | 12 to 24 |
| Between sections in an app | 32 to 64 |
| Between sections on a landing page | 80 to 128 |
| Row height | 32 compact, 36 default, 40 to 44 touch |
| Page padding in apps | 24 to 32 (16 on phones) |

Space inside a group is always smaller than space between groups.

## Neutral ramps

Apps and dashboards may use any of the three ramps below (graphite, warm, ink): all are low-saturation, so the surface never reads as a colour and the content carries the colour. Choose the tint from the product's world (warm for paper, food, craft; ink for night, water, technical; graphite when neutral is right). Landing pages and showpieces may tint further. What is not allowed anywhere is a surface that reads as a colour on its own: orange, brown, blue or green backgrounds, or a saturated brand colour used as a page fill in an app.

### Dark

| Role | Graphite | Warm | Ink |
| --- | --- | --- | --- |
| Deepest (sidebar) | `#0f0f10` | `#12110f` | `#07080d` |
| Page | `#141415` | `#161513` | `#0b0d14` |
| Card | `#19191b` | `#1c1a18` | `#11141c` |
| Raised (active row, input) | `#232325` | `#262421` | `#1a1e28` |
| Primary text | `#ededed` | `#efe9de` | `#eef0f5` |
| Secondary text | `#a1a1a6` | `#aaa398` | `#a3a9b8` |
| Muted (meta, icons) | `#85858b` | `#8a847a` | `#7a8296` |

### Light

| Role | Graphite | Warm | Ink |
| --- | --- | --- | --- |
| Page | `#fafafa` | `#f7f4ee` | `#f5f7fa` |
| Card | `#ffffff` | `#fdfbf7` | `#ffffff` |
| Raised | `#f4f4f5` | `#efe9df` | `#eceff4` |
| Primary text | `#171717` | `#1f1b16` | `#111827` |
| Secondary text | `#525252` | `#5e554a` | `#4b5565` |
| Muted | `#737373` | `#7b7266` | `#6b7487` |

Hairlines are the primary text colour at 8% opacity. Muted text is for meta and captions only and stays near 4.5:1.

Semantic colour only carries meaning: positive `#4cc38a` (dark) / `#16a34a` (light), negative `#e5484d` (dark) / `#dc2626` (light).

## Accent

- A real brand colour becomes the accent and leaves the surfaces.
- No brand colour: take it from the product's world. Warm worlds suit amber, coral or ember; cool worlds suit cobalt, teal or clear sky; natural worlds suit moss or sage.
- Text on the accent reaches 4.5:1; if not, darken the accent or use dark text.
- The accent covers a few percent of a screen.

## Type

| Use | Size | Line height | Weight |
| --- | --- | --- | --- |
| Meta, counts | 12 | 16 | 400 |
| Secondary text, captions | 13 to 14 | 20 | 400 |
| Body, navigation | 14 to 15 | 20 to 22 | 400 to 500 |
| Card figures | 28 to 32 | 1 | 500, tabular |
| Page title | 28 to 36 | 1.15 | 400 to 500 |
| Hero headline | 56 to 72 desktop, 36 to 44 phone | 1.02 to 1.08 | 400 to 500 |

Letter spacing is 0 under 16 px. Tight tracking (-0.02em from 40 px, -0.03em from 56 px) is for display text only. Numbers use tabular figures and one format across the screen. Sentence case everywhere.

Families by character:

| Character | Interface family | Partner |
| --- | --- | --- |
| Precise, technical, calm | Geist, Inter, IBM Plex Sans | Geist Mono, JetBrains Mono, IBM Plex Mono |
| Warm, friendly, human | Instrument Sans, DM Sans, Figtree | Instrument Serif or Newsreader for the hero only |
| Editorial, literary | Inter or Instrument Sans | Newsreader, Instrument Serif, Fraunces for headlines |
| Playful, bold | Space Grotesk, Bricolage Grotesque | a mono for small labels |

## Fonts when there is no network

A single self-contained file or a project with no web fonts still has good faces on every device. Use stacks that resolve to them, and name the character you want first:

| Character | Stack |
| --- | --- |
| Neutral sans | `ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", sans-serif` |
| Warm, humanist sans | `"Avenir Next", "Segoe UI", "Helvetica Neue", ui-sans-serif, sans-serif` |
| Editorial serif (display) | `"Iowan Old Style", "Palatino Linotype", Palatino, "Book Antiqua", Georgia, serif` |
| Modern serif | `Charter, "Bitstream Charter", "Sitka Text", Cambria, serif` |
| Mono | `ui-monospace, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace` |

Set `font-optical-sizing: auto` and `font-kerning: normal`. Check the render on the machine you have: the first available face wins, so the look differs by platform. Name a web font first only if the project loads it.

## Radius

| Element | Radius |
| --- | --- |
| Keycap, tag, small button | 4 to 6 |
| Row, input, button | 8 to 10 |
| Card | 12 to 16 |
| Panel, window | 14 to 20 |

Not everything is a pill.

## Depth

- Dark themes: depth from surface steps and hairlines. A floating menu may carry a soft neutral shadow.
- Light themes: `0 1px 2px rgba(0,0,0,.05)` for small things, `0 8px 24px rgba(0,0,0,.06)` for floating ones.
- Nothing glows. No coloured shadows.

## Motion

Easing for everything: `cubic-bezier(0.22, 1, 0.36, 1)`.

| Use | Duration |
| --- | --- |
| Hover, press, toggle | 120 to 180 ms |
| Menu, popover, tooltip | 160 to 220 ms |
| Entrance, sheet, layout change | 300 to 500 ms |
| Stagger between items | 40 to 60 ms, at most six items |

Rise on enter 6 to 12 px. Press scale 0.97 to 0.98. At most one entrance on load. Respect `prefers-reduced-motion`.

## Big screens (above about 1800 px)

A fixed-pixel layout floats small in a sea of space at 2560 px. Scale it instead of stretching it:

- Keep the content width capped (apps near 1440 to 1600) and let the **root size grow**: `html { font-size: clamp(16px, 0.62vw + 6px, 24px); }` with sizes, spacing and widths in `rem`, so everything scales together.
- Prefer `rem` and `lvh` or `svh` for heights. **Do not use CSS `zoom` on the root**: it breaks `vh` and `dvh` minimum heights, so a screen meant to fill the viewport ends up short or long by the zoom factor. If you must use `zoom`, divide viewport-based heights by the factor.
- Apps still fill the width with their shell; landing pages scale their type and keep generous margins.
- Always render at 2560 px: it is where unscaled layouts look wrong.

## Layout

- Apps fill the viewport: sidebar 240 to 280, fluid content capped near 1440 to 1600, top bar 56 to 64. Never shrink an app into a narrow centred column.
- Navigation rows 32 to 36 tall, 2 to 4 apart; a section label sits 24 above and 8 below.
- Stat cards in a row share one height; 3 or 4 per row on desktop.
- The main chart spans at least two thirds of the content width, 280 to 360 tall. A second data block beside it is a list or table, never a second chart of the same size.
- Heroes: 96 to 128 from the navigation to the headline on desktop, 48 to 64 on phones. Primary button 44 to 48 tall.

---

Spacing scale, ramps, type scale, radii and motion values adapt unslop by Damir Sokolovsky ([@heydamir](https://x.com/heydamir)), CC BY 4.0. See `NOTICE.md`.
