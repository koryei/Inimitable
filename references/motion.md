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

## Landing and showpiece motion

A landing page is the one surface where motion is part of the argument. It is read as aliveness and care, and it is the fastest way to look like a template when it is wrong. The rule is the same as everywhere: **motion answers or explains.** On a landing page it also has to *arrive in order*, because order is what makes it feel composed rather than triggered.

### Entrance choreography

The first screen arrives as one gesture, not as a set of independent animations.

| Element | Delay | Duration | Movement |
| --- | --- | --- | --- |
| Headline lines | 0, 70, 140 ms | 700 ms | Each line rises from a mask: `translateY(105%)` to `0`, `overflow: hidden` on the line |
| Subhead | 220 ms | 600 ms | `translateY(12px)` and fade |
| Actions | 300 ms | 600 ms | `translateY(12px)` and fade |
| Visual or frame | 380 ms | 900 ms | `translateY(32px)`, `scale(0.985)` to `1`, fade |
| Ground | 0 ms | 1200 ms | Opacity 0 to 1, no movement |

Why this order: the eye reads top to bottom and largest to smallest, so the headline lands first and the visual settles last, which is the order the page is understood in. Everything at once reads as a page load; staggered reads as a composition.

Rules:

- **One curve for the whole entrance.** `cubic-bezier(0.16, 1, 0.3, 1)` is the long, soft settle that suits a hero.
- **Mask the headline, do not fade it.** A line rising out of a mask reads as type being set; a fade reads as a slide deck.
- **Never animate more than five things.** Beyond that the eye cannot follow the order and it becomes noise.
- **The entrance runs once.** No replay on scroll back, no loop.

### Scroll reveal

- **Trigger once**, when the element is about 12% into the viewport (`IntersectionObserver`, `threshold: 0.12`, `rootMargin: '0px 0px -8% 0px'`).
- **Rise 16 to 20 px and fade**, 600 to 700 ms, `cubic-bezier(0.22, 1, 0.36, 1)`.
- **Stagger children by 50 to 70 ms**, capped at about 300 ms total. A grid of nine cards that takes 1.5 s to appear is a wait, not a reveal.
- **Never hide content that matters.** If JavaScript fails, the content must be visible. Set the hidden state from a class added by script, or use `@media (scripting: enabled)`.
- **Do not reveal the first screen on scroll.** It has its own entrance.

```js
const io = new IntersectionObserver((entries) => {
  for (const e of entries) {
    if (!e.isIntersecting) continue;
    e.target.classList.add('in');
    io.unobserve(e.target);
  }
}, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
for (const el of document.querySelectorAll('[data-reveal]')) io.observe(el);
```

```css
[data-reveal] { opacity: 0; transform: translateY(18px); transition: opacity 650ms var(--ease-out), transform 650ms var(--ease-out); transition-delay: calc(var(--i, 0) * 60ms); }
[data-reveal].in { opacity: 1; transform: none; }
@media (prefers-reduced-motion: reduce) { [data-reveal] { opacity: 1; transform: none; transition: none; } }
```

### Marquee

A strip of real examples that drifts sideways is a good way to show breadth without a grid. It is also the easiest thing to make cheap.

- **Slow.** 40 to 60 s for a full loop. Faster reads as a stock ticker.
- **Pause on hover and on focus.** A moving strip that cannot be stopped is hostile.
- **Duplicate the track once** and translate by exactly `-50%` for a seamless loop.
- **Never behind text.** A marquee is a band, not a background.
- **Mark it `data-loop`.** That tells `signs.mjs` the loop is a licensed device rather than a tell, and `craft.mjs` checks that it pauses and stops.
- **Reduced motion:** static row, horizontally scrollable, no animation.

### Parallax

- **Max 8 to 12% of the element's height** of travel across the whole scroll. More reads as a theme-park ride.
- **Transform only**, on a layer, driven by `scroll` with `requestAnimationFrame` or a scroll-driven animation.
- **Disable on touch and under reduced motion.** Parallax on a phone is jitter, not depth.
- **One element per page.** The hero visual, or the ground. Not every section.

### The one moment

A landing page gets **one** purposeful moment beyond the entrance: a product preview that demonstrates its real function, a divider that sweeps to reveal before and after, a counter that counts to its real number. It must be tied to the product's actual behaviour, not to a generic effect. If it could be on any page, it is decoration.

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
- On a landing page, the first screen arrives in one order, once, and the entrance is finished within about 1.5 s.
- Scroll reveals fire once, never replay, and leave the content visible if the script does not run.
- A marquee pauses on hover and focus, and is still under reduced motion.
- `node scripts/craft.mjs <page>` reports no transition on a layout property and no missing reduced-motion block.
