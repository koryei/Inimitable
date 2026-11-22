# Layer 7: Details

## Rules

- **Nested radius.** Inner = outer minus the padding between them, never below 4. Controls 8 to 10, cards 12 to 16, panels 14 to 20. Not everything is a pill.
- **Counts and meta** become quiet text (often mono, muted), not glowing pills.
- **Keyboard shortcuts** are small keycaps.
- **Charts**
  - Muted grid, muted mono labels. No rainbow bars within one series, no glowing bars, no uppercase day labels.
  - One main chart is clearly the biggest thing on the screen, drawn with care. Anything else showing data is smaller and different in kind (a ranked list with thin bars, a short table), never a second chart of the same size.
  - One accent per chart: the thing that matters (the current month, the tracked line) gets it; the rest is neutral steps. Several hues only when series must be told apart, and one still leads.
  - Pick the chart for the data: a trend is a line, a comparison is bars, a share is one stacked bar or a bar list, a single goal is a progress bar.
  - If the chart is placeholder noise, replace it with data that tells something true.
- **Stat cards are numbers.** A label, a big figure, a change with its comparison. No sparklines, tallies, mini bars or icons added to fill them. A card may hold a real-looking object when it is the thing its number counts (a receipt beside paid revenue).
- **Vary sizes.** Equal cards with the same kind of content read as a template. Three or four compact stats above one wide chart, or a wide chart beside a narrow list.
- **Active state** is a small surface step with a hairline highlight, not a gradient with a glow.
- **Hover and focus states exist**, stay inside the palette, and a visible focus ring marks keyboard focus.
- **The logo** is the product name in the main family, plus a simple mark if there is one.
- **The signature detail** from the direction appears where it belongs and nowhere else.
- **States are designed**: empty (says what goes here and how to start), loading (skeleton that names what is loading), error (what happened, what next), success (confirms the result).

## Check

- Radii in the drift report are few and nest correctly.
- Every interactive element has hover, focus and pressed states; tab through the page once.
