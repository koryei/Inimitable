# Motion recipes

Layer 8 (`references/layers/motion.md`) says what motion to remove. This file says what to build when a surface needs motion. The patterns come from studying well-made motion libraries (see `libraries.md`); the numbers are starting points, restated here, and the project's own motion tokens win where it has them.

## Principles

1. **Motion answers or explains.** It confirms a press, shows where something came from or went, or carries attention to a change. Motion that does neither is decoration.
2. **Origin-aware.** Things open from where they were summoned. A dropdown grows from its trigger's edge (`transform-origin` at the trigger), a modal from the centre or the control that opened it, a toast from the edge it lives on.
3. **Enter slower than exit.** Opening is felt; closing is in the way. Open about 250 ms, close about 150 ms.
4. **Small distances, small scales.** Start near the end state: scale 0.96 to 0.98, rise 6 to 12 px, a hint of blur (2 to 4 px) at most. Big movement reads as slow.
5. **One curve, a few tokens.** `cubic-bezier(0.22, 1, 0.36, 1)` for entrances; a plain `ease-out` or a shorter duration for exits. Durations live in CSS custom properties so they are changed in one place.
6. **Interruptible.** Opening then closing mid-flight reverses from the current state instead of snapping.
7. **Reduced motion is a first-class path.** Under `prefers-reduced-motion: reduce`, replace travel and scale with a plain fade or nothing, and keep any information the motion carried (a state change still shows).
8. **Only compositor properties move**: transform and opacity (and filter sparingly). Height reveals use the grid-rows trick or `interpolate-size`, not animated `height`.

## Recipes

| Surface | Behaviour | Starting values |
| --- | --- | --- |
| **Menu or dropdown** | Opens from its trigger edge, fades and scales up; closes faster | open 250 ms, close 150 ms, pre-scale 0.97, closing scale 0.99 |
| **Modal or dialog** | Backdrop fades; panel fades and scales up from 0.97; focus moves in; closing reverses faster | 200 to 300 ms in, 150 ms out |
| **Drawer or sheet** | Slides from its edge with the backdrop; swipe to dismiss on touch | 300 to 400 ms in |
| **Toast** | Rises in with fade and a slight scale and blur; stacks three deep with the older ones peeking; pauses on hover; a new one pushes the rest | 250 ms in, auto-dismiss 5 to 6 s (longer with an action) |
| **Tooltip** | Delayed in (about 400 ms) the first time, instant between neighbours, travels to the next target, instant out | delay 400 ms, travel 120 ms |
| **Tabs** | A pill or underline indicator slides to the active tab; panel cross-fades | 200 ms |
| **Accordion** | Height via grid rows, chevron rotates, content fades slightly behind | 250 ms |
| **Card or panel resize** | Animate the container's size, fade content in after it settles | 250 to 350 ms |
| **Page change** | Forward slides left, back slides right, a small distance with fade | 250 to 300 ms |
| **Skeleton to content** | Skeleton pulses gently; content cross-fades in over it with no jump in layout | 200 ms cross-fade |
| **Text or icon swap** | Old out and new in with a few pixels of blur and a small scale; icons swap in place | 150 to 200 ms |
| **Number change** | Changed digits cross-fade in place; large jumps roll digits like a drum; use tabular figures | 250 to 400 ms |
| **Success** | A check draws on with its stroke path after a short fade and rotate; the button or row settles | 300 to 400 ms |
| **Error** | A short horizontal shake of a few pixels on the field with the message fading in; it then returns to neutral | 300 ms, 4 px |
| **Toggle** | The thumb slides with a slight overshoot; the track colour changes with it | 200 ms |
| **Press** | Scale to 0.97 to 0.98 on press; return on release | 100 to 120 ms |
| **Hover** | Colour or surface step only, never a size change on cards | 120 to 180 ms |
| **Thinking or generating** | A shimmer on the status text, then swap to the next step; no endless spinner | shimmer 1.5 to 2 s, swap 200 ms |
| **Drag and drop** | The item lifts on pick-up, neighbours part, it settles with a small spring on drop | spring, no bounce beyond 4 px |

## Tokens

Define once and reuse:

```css
:root {
  --ease-out: cubic-bezier(0.22, 1, 0.36, 1);
  --dur-press: 120ms;
  --dur-hover: 160ms;
  --dur-open: 250ms;
  --dur-close: 150ms;
  --dur-enter: 350ms;
}
@media (prefers-reduced-motion: reduce) {
  :root { --dur-open: 1ms; --dur-close: 1ms; --dur-enter: 1ms; }
}
```

## Check

- Each animated element opens from where it was summoned.
- Close is faster than open.
- With reduced motion on, nothing travels or scales, and state is still visible.
- No animated `height`, `width`, `top`, `left` or large `blur`.
- A rapid open-close-open does not break the state.
