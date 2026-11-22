# Layer 8: Motion

## Rules

- **Remove motion that loops for no reason**: `animate-pulse` or `animate-ping` on things that are not live, shimmer on headings, breathing glows, floating elements, parallax.
- **Remove** `transition: all`, bouncy springs, `hover:scale` on cards, and anything that moves more than a few pixels on hover.
- **Keep motion that explains**: a hover is a quick colour or surface change, a press is a tiny scale down, a menu fades and rises a few pixels from where it opened, a changed number tweens, a new item enters where it will live.
- **Name what transitions**: colour, background, border, opacity, transform (`transition-colors`, `transition-[transform,opacity]`). Never width, height, top, left, margins or large blurs: they stutter on weak devices.
- **One easing curve** and a few durations across the screen (`house-rules.md`): short for feedback, a little longer for entrances.
- **At most one entrance on load**: a short fade and rise of the main content with a small stagger (at most six items). Not every card from a different side.
- **Respect `prefers-reduced-motion`**: replace movement with a fade or nothing.
- Live things (a running task, a connection) may have a small continuous signal; nothing else loops.

## Check

- `signs.mjs` finds no infinite animations except on elements marked live.
- No `transition: all`.
- With reduced motion on, nothing moves.
