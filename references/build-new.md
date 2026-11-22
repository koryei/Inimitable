# Step 4B: Build a new screen around one star

A new screen is built around **one bright element**: the one thing that is clearly the star, with everything else stepping back so it reads instantly. Decide it before drawing anything.

## What "bright" means

The brand decides. It does not have to be a colour. A brand that is black and grey makes its star with size, contrast, weight, a photograph or empty space around it. An accent colour is used for the star only if the project's rules allow one.

| Mode | Usual star |
| --- | --- |
| Persuade | one visual that shows something true, or a headline set at scale |
| Operate | what the person must act on: the composer, the primary action, the key figure, the approval |
| Read | the content itself, set well |
| Experience | the artifact, edge to edge |
| Terminal | the result line |

## Steps

1. **Name the star** in one sentence, and say why it belongs to this product (use the subject inventory from Read).
2. **Write the screen's argument**, one line: who arrives, what they need to leave with, what they do next.
3. **List the sections** needed to deliver that argument, in order. Fewer is better: each section must earn its place with a different job and a different composition from its neighbours.
4. **Choose the composition** for the first screen (see `layers/layout.md` for hero options; `surfaces/*.md` for the others). The star sits at the optical centre of attention; supporting content aligns to a shared grid.
5. **Write the real copy first**, to the standard in `layers/copy.md`. Layout follows words, not the reverse.
6. **Choose what is real**: use only images, logos and data that exist. A true product preview in code beats a generic picture; no image beats a decorative one. Never invent a customer, a number, a testimonial or a feature.
7. **Plan every state** the screen can be in: empty, loading, error, success, long content, one item, a thousand items.
8. **Then build** (step 5), one section at a time.

## The star check

- Squint at the screenshot. Is the star the first thing you see? Is the second thing obviously second?
- Cover the product name. Is there still something here that only this product would have?
- Count the competing bright things. More than one means the star is not decided.

## Moments

A clean screen is not yet a memorable one. Each new Persuade or Experience screen needs one rich moment that only this product could have, and Operate screens benefit from one too (a signature detail, a well-drawn chart, a true object). `visual-craft.md` says how to find the idea in the subject inventory and draw it in code, with generators in `assets/recipes/`.

Beyond the star, a screen can have one or two **moments**: places where colour, material or detail gets richer than the quiet chrome: a rendered object, a chart whose colours each mean a series, a figure set beautifully. Chrome stays quiet so moments read. Never spread richness evenly over everything.

## Visuals

- A visual shows something true: the product, its output, or one concrete metaphor for what it does.
- Dashboards and app screens almost never need generated images. Their moments come from content: a chart drawn with care, figures set beautifully, a status that feels alive.
- If an image generation tool is available, a hero scene from the product's world with calm empty space where the text goes works well. Otherwise build what you can in code, write the prompt for the rest, and leave an empty slot of the right size, labelled in the report.
- Text, fake buttons and logos are never baked into images. Images blend with the page: matched background, soft mask at the edges.
