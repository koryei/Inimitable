# Materials: surface, light and texture

A screen is made of surfaces, and every surface in the real world has two things a flat CSS fill does not: **light falling on it** and **texture at the micro scale**. That is why a page built from `#fff`, `#f5f5f5` and `#111` reads as unfinished even when the spacing and type are right. The eye is not looking for decoration. It is looking for evidence that someone decided what the surface is made of.

This file is how to give a surface a material without bringing back the tells. It is the reason behind the gradient, grain and glass rules in `anti-slop.md`, and the source of the ground recipes used by `directions.md`.

## The one idea

**A gradient is light, not colour.** A gradient that changes hue while keeping lightness flat is decoration, and the eye reads it as a CSS effect. A gradient that changes lightness, in one temperature family, with grain on top, reads as a surface lit from somewhere. Same CSS. Different result. The difference is whether the stops describe a light source or a rainbow.

So before adding any gradient, answer: **where is the light coming from, and what is the surface made of?** If you cannot answer in one sentence, you are decorating.

## Why flat fills fail

- **Bandwidth of the eye.** Human vision is far more sensitive to edges and micro-contrast than to large flat areas. A 1440 px field of one colour gives the eye nothing to resolve, so it reads as empty rather than calm.
- **Banding.** A large flat or smoothly graded area on an 8-bit display shows visible steps. Grain dithers those steps away. This is why film grain and paper tooth exist, and why every good gradient ground has noise on it.
- **Material memory.** Paper, stone, glass and metal all have a micro-texture. A surface with none reads as a rendering, not a thing.
- **Depth.** A surface that is slightly lighter at the top reads as lit from above, which the brain interprets as a physical object. A perfectly even fill reads as a hole.

## The four materials worth knowing

| Material | What it is | Where it belongs | How to make it |
| --- | --- | --- | --- |
| **Paper** | A warm off-white with a faint tooth | Reading, docs, editorial, light landing pages | `#f2f0ea` to `#faf9f5`, never `#fff`; grain at 3 to 5% multiply |
| **Grainient** | A soft mesh of light in one temperature family, with grain | Hero grounds, showpiece pages, section breaks | 3 to 5 large radial gradients plus grain, masked to the content |
| **Glass** | A translucent pane over something real | Navigation over imagery, panels over a scene | `backdrop-filter: blur(12px) saturate(1.2)` plus a 1 px light edge; only over a real image or gradient |
| **Metal** | A hard surface with a specular band | Instrument and technical directions | A narrow light band across a dark ramp, plus fine horizontal lines |

Pick **one** material for the page and let the others appear only as small accents. A page that is paper in one section, glass in the next and metal in the third has no material at all.

## The grainient, built properly

It is also the default ground of machine-built pages now, so choose it on purpose (`directions.md`, "Choosing the ground"): a flat colour, a framed panel or a duotone print are equal options, and `scaffold --ground` builds them.

A grainient is not a linear gradient with pretty colours. It is a **mesh of soft light** with grain on top. Build it in four layers, back to front:

1. **Base.** The page's own background colour, so the ground never fights the content.
2. **Light.** Three to five large radial gradients, each a soft pool of one colour, placed off-centre so the light has a direction. Keep them in one temperature family (all warm, or all cool) and add **one** counterpoint at low strength. That counterpoint is what makes it feel lit rather than tinted.
3. **Grain.** The `grain.css` noise at 4 to 6%, multiply on light and screen on dark. This is not optional: without it the gradients band.
4. **Mask.** Fade the ground into the page background at the edges, so it has no hard seam. A ground that stops at a rectangle looks pasted on.

```css
.ground {
  position: absolute;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  background:
    radial-gradient(55% 70% at 12% 18%, #f7cdb2 0%, transparent 62%),
    radial-gradient(45% 60% at 88% 8%,  #dcc6ef 0%, transparent 66%),
    radial-gradient(70% 80% at 72% 92%, #f0a9a2 0%, transparent 60%),
    radial-gradient(50% 55% at 38% 55%, #b9cbe6 0%, transparent 70%),
    var(--bg);
  -webkit-mask-image: linear-gradient(#000 55%, transparent 100%);
  mask-image: linear-gradient(#000 55%, transparent 100%);
}
```

Rules that keep it from becoming a tell:

- **One family plus one counterpoint.** Warm peach, rose and sand with a single cool blue is a material. Peach, violet, cyan and lime is a rainbow.
- **Low saturation.** Keep every stop under about 55% saturation. A grainient is light, not paint.
- **No glow.** Do not add `box-shadow` or `filter: blur()` to fake softness. Large radial gradients are already smooth, and a blur on a full-width element costs frames.
- **Text never sits on the busiest part.** Put the headline on the calmest area, or fade the ground under the text. Check contrast where the text actually is, not on the average.
- **Grain is invisible as a pattern.** If you can see the noise as a texture, it is too strong. 4 to 6% is the range.
- **It moves once, or not at all.** A slow drift (30 to 40 s, `transform` only, 2 to 3% travel) is allowed on a hero and must stop under reduced motion. Never animate `background-position`.

## Glass, earned

Glass is a pane, so it needs something behind it. Over a real image or a grainient it reads as depth. Over a flat fill it reads as a frosted rectangle, which is the tell.

```css
.pane {
  background: color-mix(in srgb, var(--surface) 62%, transparent);
  backdrop-filter: blur(14px) saturate(1.15);
  border: 1px solid color-mix(in srgb, var(--ink) 10%, transparent);
  box-shadow: inset 0 1px 0 color-mix(in srgb, #fff 45%, transparent);
}
```

The inset top edge is the part people forget. It is the light catching the top of the pane, and without it the glass looks like a grey box.

## Paper, not white

`#fff` is the colour of a screen, not of paper. A warm off-white (`#f2f0ea`, `#faf9f5`) with a faint grain reads as a surface and is easier on the eye over a long page. Keep pure white for one thing only: a card that must lift off the paper. If everything is white, nothing is.

## Metal, for instruments

A metal surface is a dark ramp with one narrow specular band and fine horizontal lines. It belongs to technical and hardware directions, not to a general product page. The band is what sells it: a single light streak at 20 to 30% opacity, not a full-width gradient.

## Performance and fallbacks

- **No `filter: blur()` on a full-width element.** Use radial gradients; they are smooth for free.
- **Grain is a 400-byte data URI**, not an image request. It is already in `assets/recipes/grain.css`.
- **Animate `transform` and `opacity` only.** A drifting ground is a `transform: translate3d()` on a layer, never `background-position`.
- **Static fallback.** Under `prefers-reduced-motion: reduce`, the ground is a still image of itself. Under `prefers-contrast: more`, drop the ground and use the flat background.
- **Print.** Gradients and grain do not print. Set the ground to the base colour in `@media print`.

## Sources worth studying

| Source | What it is | What to take | Licence |
| --- | --- | --- | --- |
| **[Grainient](https://grainient.supply/collections)** | A large library of grain and mesh gradient backgrounds, organised by family (noisy, smooth, dither, hero, light and dark) | The **families and the light logic**, not the files: which temperature pairs read as a material, how much grain each family carries, how a hero ground is composed. Download a texture only when the project can carry a bitmap; otherwise rebuild the mechanism in CSS as above | Check each collection's page before shipping a file; the site mixes free and paid sets. Never subscribe on the person's behalf |
| **[Construct · Material](https://www.tobiadonadon.com/projects/construct/material)** | A free guide to the basics of interface material, done properly | The reasoning: why surfaces need light and texture, and how the basics compound | Read it; do not copy its wording |
| **`assets/recipes/grain.css`** | The skill's own grain, light and dark | Use directly | Apache-2.0, this repo |

## Judging it

1. **Squint.** The ground should read as one calm field with a direction of light, not as several coloured blobs.
2. **Cover the content.** Does the ground alone say what kind of place this is? A warm paper field says editorial; a cool mesh says technical; a metal band says hardware.
3. **Look at a 6-bit display or a screenshot at 60% brightness.** Banding shows there first. If it bands, add grain.
4. **Run `check.mjs`.** Text over a ground must pass contrast where it sits. If it fails, move the text or fade the ground; do not lighten the text.
5. **Run `signs.mjs`.** A hue-to-hue gradient will be flagged. If the direction licenses it, name it with `--allow "Hue-to-hue gradient"` and say so in the report. If it does not, you have a rainbow, not a material.
