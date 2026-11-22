# Layer 3: Icons

## Rules

- **Emoji are never icons.** Every emoji used as an icon or label decoration becomes a line icon from one set, or goes away.
- **One set.** Use the project's set; otherwise Lucide. One size (16 or 18 px) and one stroke (1.5) everywhere.
- **Icons take the colour of their text role**, usually secondary or muted. They never get their own colours.
- **The icon box is the same width in every row** and the gap to the label is fixed (8 or 10), so labels align.
- **Drop icons that add nothing**: an emoji in every card title, an icon before every section label. Categories that need colour get a small status dot instead.
- Icon-only buttons have an accessible name and a 44 px target on touch.
- A sparkle for "AI" is removed unless it explains something.
- The logo mark is flat: a wordmark, or a simple glyph in one solid colour.

## How

1. Search the screen's code and content for emoji (`signs.mjs` finds them).
2. For each, ask whether the icon helps. If not, delete it; if yes, pick the closest icon in the set.
3. Set size, stroke and colour once, in the icon component, not per use.

## Check

- No emoji in the interface (user content aside).
- Icons align in one column per list; one size and stroke across the screen.
