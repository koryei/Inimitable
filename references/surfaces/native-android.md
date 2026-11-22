# Surface: native Android

Follow Material and platform conventions. People expect the system back gesture, the system share sheet, and settings that behave like every other Android app.

## Structure and navigation

- **Navigation bar** (3 to 5 destinations) on phones, **navigation rail** on tablets and foldables, **drawer** for many destinations. **Top app bar** with title and actions; **FAB** for the one primary action.
- **System back** (gesture or button) works everywhere and does the expected thing; predictive back animation honoured.
- Edge-to-edge layout with proper **window insets**: content clears the status bar, gesture bar and keyboard.

## Layout

- Responsive across **window size classes** (compact, medium, expanded); foldables and tablets get adaptive layouts (list-detail), not stretched phone screens.
- Grid of 4 dp; common margins 16 dp; list rows 56 dp or more for two lines.

## Touch

- Targets **at least 48 × 48 dp**, with room between.
- Primary actions in thumb reach; ripple feedback on every tappable surface.

## Type and colour

- **Scalable pixels (sp)** for text so system font size applies; layouts reflow at the largest size.
- Material type scale roles (display, headline, title, body, label).
- **Dynamic colour** (Material You) where the brand permits; otherwise a fixed scheme with semantic roles. **Light and dark** both supported, contrast checked in both.

## Controls

Use Material components, themed to the brand: switches, sliders, chips, sheets, dialogs, snackbars (for confirmations with undo), menus, date and time pickers. Dialogs are for decisions; a snackbar is for "done".

## Motion

Material motion: container transforms and shared axis transitions that keep spatial context; durations 150 to 400 ms; honour the system "remove animations" setting.

## Content

Empty states with one action; shimmer or content-shaped placeholders while loading; inline errors with a retry. Ask for permissions at the moment of need, with a short reason, and handle denial gracefully.

## Accessibility

TalkBack: content descriptions, focus order, roles and states for custom views; touch exploration works; no meaning only in colour; text contrast 4.5:1.

## Verify

Render on a small phone, a large phone, and a tablet or foldable size; in light, dark, and the largest font scale.
