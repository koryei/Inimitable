# Surface: native iOS

Use Apple's conventions. People already know how an iPhone app behaves; do not make them learn yours.

## Structure and navigation

- **Tab bar** (3 to 5 destinations) at the bottom for top-level areas; **navigation stack** with a large title and a back button for depth; **sheets** for self-contained tasks. Never a hamburger menu.
- Back works with the edge-swipe gesture. Do not override it.
- Titles name the screen; actions live in the navigation bar (trailing) or a bottom toolbar.

## Layout

- Respect **safe areas** and the home indicator. Nothing important behind the status bar, the dynamic island or the home indicator.
- Margins 16 (20 on larger phones); standard list rows 44 pt minimum.
- Support the smallest and largest current phones, landscape where the app warrants, and iPad if shipped there.

## Touch

- Targets **at least 44 × 44 pt**, with room between them.
- Primary actions reachable by thumb (bottom half of the screen).
- Swipe actions on rows where natural; long press for secondary menus; never hide the only path to an action in a gesture.

## Type and colour

- **Dynamic Type**: text scales with the system setting; layouts reflow at the largest accessibility size without truncating critical content.
- System font (SF) unless the brand has one; semantic styles (title, headline, body, caption) rather than fixed sizes.
- **Light and dark**: both, using semantic colours; test contrast in both. **Increase Contrast** and **Reduce Transparency** respected.
- Accent colour (tint) is used for interactive elements; do not rely on colour alone for status.

## Controls

Use the standard ones, styled to the brand: switch, picker, segmented control, stepper, date picker, context menu, action sheet, alert (for decisions, not announcements). Standard haptics for success, warning, error, selection.

## Motion

Spring animations that follow the system feel; transitions keep spatial context (a pushed screen comes from the right, a sheet from the bottom). **Reduce Motion** replaces movement with a fade.

## Content

Empty states give one clear action. Loading shows content-shaped placeholders or a progress indicator, never a blank screen. Errors say what to do, inline where possible. Permission prompts are asked in context, after a sentence of why.

## Accessibility

VoiceOver labels, traits and reading order for every element; custom controls expose the right traits; no meaning only in colour or gesture.

## Verify

Render in the simulator at the smallest and largest supported devices, in light and dark, at the default and the largest Dynamic Type size.
