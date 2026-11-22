# Layer 6: Layout

## Rules

- **Keep the sections and their order.** Inside a section, alignment and proportions may change when it makes the screen clearer.
- **Apps keep real app proportions.** The shell fills the viewport, a sidebar of 240 to 280, fluid content capped near 1440 to 1600, and the page is as long as its content. Never shrink an app into a narrow centred column. A small window drawn on a backdrop stays visibly a window, but gets desktop proportions inside.
- **Landing hero options**:
  - A **scene**: one image fills the hero edge to edge, its subject on one side, the headline on the calm empty part of the same image, the product view rising from the bottom edge.
  - An **asymmetric split**: text on one side, the visual given at least half the width.
  - **Text over a large product view** below it.
  - Everything stacked and centred is the template default; keep it only for a short hero without a visual.
- **In a split**, centre the text block vertically against the visual. If the visual is much taller, shorten it instead of pushing the text down. Prefer one solid visual to floating cards.
- **Long headlines align left.** Centred text works for one or two short lines.
- **One primary action** and at most one secondary action. Everything else moves out of the hero.
- **Navigation is quiet**: logo, the existing links, one button. Log in is a text link. On small screens the links collapse into one menu.
- **Compose the first screen as a whole.** No dead empty band; if the content is short, centre it or let the product view start low and run past the bottom edge.
- **Equal outer margins.** No section huddled on one side with an empty far side: answer an off-centre heading with something at the far side of the grid.
- **No blank stretch** taller than about half a screen, unless it is one deliberate rest.
- **On small screens** everything stacks in reading order; the headline takes the mobile size; the visual comes after the actions. A dense preview gets simpler on mobile (fewer rows and columns) instead of being zoomed down.
- No horizontal scroll at any width.

## How

1. Open the 390, 1440 and 2560 screenshots side by side.
2. Mark regions where space is dead, uneven or unbalanced.
3. Rework the container and grid first, then the content within.

## Check

- `shoot.mjs` reports no sideways scroll at any width.
- The first screen reads as one composition at 1440 and at 390.
