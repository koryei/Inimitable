# Hover and press: the interface answering back

A hover state is the only moment an interface replies before the person commits. It is the difference between a control that looks like a picture of a button and one that behaves like a button. Most generated interfaces get this wrong in the same way: a colour change, no movement, no reply, and nobody ever looked at it.

This file is how to design the reply. It is the reason behind the hover rules in `motion.md` and `components.md`, and it is checked by `scripts/craft.mjs`.

## Why hover matters more than it looks

- **It is a promise.** Hovering says "this will do something". The reply tells the person *what*, before they spend a click. A button that only changes colour says "I am clickable" and nothing else.
- **It is evidence of care.** The eye reads a well-timed 4 px arrow travel as craft and a 300 ms colour fade as neglect, even when the person could not name either. This is the same mechanism as alignment: small, consistent signals compound into trust.
- **It is where the product's character lives.** A bank's button should feel solid and quick. A tool for designers can afford a little wit. The hover is the cheapest place to put that character, because it costs nothing when idle.
- **It is the state people see most.** Every pointer user passes over every control on the way to the one they want. The resting state is seen once; the hover is seen constantly.

## The three jobs

Every hover must do at least one, and a primary action should do two:

1. **Confirm** it is interactive (a change the eye catches in under 100 ms).
2. **Preview** the action (an arrow that moves the way the page will, a fill that shows the target state).
3. **Reward** attention (a small, specific pleasure that fits the product).

A colour change alone does job 1 badly and jobs 2 and 3 not at all.

## The mechanics

| Device | What it does | Exact values | Fits |
| --- | --- | --- | --- |
| **Fill sweep** | A block of colour grows from one edge to fill the control | `::before` with `transform: scaleX(0)` to `1`, `transform-origin: left`, 220 ms `cubic-bezier(0.22,1,0.36,1)`; text colour flips at 60% | Primary buttons, tabs, nav pills |
| **Arrow travel** | The arrow moves a few pixels in the direction of the action | `translateX(4px)`, 200 ms, same curve; the gap grows 2 px | Buttons that navigate or submit |
| **Underline draw** | A rule grows under a link from the left | `background-size: 0 1px` to `100% 1px`, `background-position: left bottom`, 180 ms | Text links, nav links, footer links |
| **Bracket expand** | Corner marks pull outward, as if the frame noticed you | `inset: -1px` to `-5px`, 200 ms; keep the arm length fixed | Instrument and technical directions |
| **Lift** | The card rises a little and its edge darkens | `translateY(-3px)`, border to `--ink` at 40%, 200 ms; never a scale on a card | Cards, tiles, list rows |
| **Image zoom** | The picture inside a fixed frame grows | `scale(1.03)`, 600 ms `ease-out`, `overflow: hidden` on the frame | Example cards, gallery tiles |
| **Cursor** | The pointer itself changes | `cursor: grab` on a drag handle, `cursor: pointer` on anything clickable | Drag handles, custom controls |
| **Magnetic** | The control leans toward the pointer | Max 6 px offset, spring back 300 ms | One hero control at most, never a whole page |

Rules that apply to all of them:

- **Fast in, faster out.** Hover in 160 to 220 ms; hover out 120 to 160 ms. A hover that takes 300 ms to appear feels broken.
- **Small distances.** 2 to 6 px of travel, 1.01 to 1.03 of scale. Big movement reads as slow and cheap.
- **One curve.** `cubic-bezier(0.22, 1, 0.36, 1)` for everything. A page with three easing curves feels nervous.
- **Compositor properties only.** `transform`, `opacity`, `color`, `background-color`, `border-color`. Never animate `width`, `height`, `top`, `left`, `margin` or `box-shadow` spread on hover; they cause layout or paint on every frame.
- **The layout must not move.** A hover that shifts neighbouring content is a bug, not a flourish.
- **The base state is complete.** Hover is an enhancement. On touch there is no hover, so the resting state must already say what the control is.

## Press

Press is the other half of the reply, and it is the one people forget.

- **Scale down 0.97 to 0.98** on `:active`, 100 to 120 ms, and return on release. This is the physical "click".
- **The fill deepens** one step on press, so the control feels pushed in.
- **No bounce.** A spring on a button press reads as a toy. Save springs for drag and drop.
- **The press must be visible on touch too**, which is why it lives on `:active` and not on `:hover`.

```css
.btn {
  transition: background-color 160ms var(--ease), color 160ms var(--ease), transform 120ms var(--ease);
}
.btn:hover { background: var(--ink); color: var(--bg); }
.btn:active { transform: scale(0.98); }
```

## Focus is a hover too

`focus-visible` is the keyboard user's hover, and it must be designed with the same care: a 2 px ring in the accent, offset 3 px, never removed. A control with a beautiful hover and `outline: none` is broken for the people who need it most.

## What makes a hover feel cheap

| Symptom | Why it reads as cheap | Fix |
| --- | --- | --- |
| Colour change only | No reply, no preview, no character | Add one movement: arrow, fill or underline |
| 300 ms fade | The interface feels asleep | 160 to 220 ms in |
| Card scales up | Text blurs and neighbours shift | Lift 3 px instead |
| Every element does the same thing | No hierarchy; the page has one volume | Primary gets the fill, secondary the underline, tertiary the colour step |
| Hover moves the layout | The page twitches under the pointer | Animate transform, not size |
| No press state | The click has no physical reply | `:active` scale 0.98 |
| Hover on a touch device | The first tap is eaten by the hover | Wrap hover rules in `@media (hover: hover)` |
| Hover that hides information | Content appears only on hover and is lost on touch | Keep the information visible; hover may emphasise it |

## Reduced motion and touch

```css
@media (hover: hover) and (pointer: fine) {
  /* hover rules here */
}
@media (prefers-reduced-motion: reduce) {
  .btn, .card, .link { transition-duration: 1ms; }
  .btn:hover .arrow { transform: none; }
}
```

Under reduced motion, keep the colour and surface change (it carries the information) and drop the travel and scale. On touch, the press state carries the reply instead.

## The test

1. **Screenshot the hover state.** Not the resting state: hover the control, then capture. Look at it at 100%. If it is a colour change and nothing else, it is not designed.
2. **Tab through the page.** Every control must show a focus ring that is as considered as its hover.
3. **Hover every control in one pass.** They should feel like one family: same speed, same curve, different weight by importance.
4. **Turn on reduced motion.** Nothing should travel or scale; everything should still change state.
5. **Run `node scripts/craft.mjs <page>`.** It reports interactive elements with no hover rule, transitions on layout properties, and a missing reduced-motion block.
