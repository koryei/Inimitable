# Why design works

Rules get you to "not wrong". Understanding gets you to good, and lets you decide when a rule does not apply. This file gives the reason under each rule in the skill. When a situation is not covered anywhere else, reason from here.

Each entry has four parts: **the principle**, **why it works** (what the eye or mind is doing), **how to use it**, and **how it looks when broken**.

---

## 1. People scan, they do not read

**Principle.** Attention is scarce. Within a second or two a person decides where to look first, what to ignore, and whether this is for them.

**Why.** Vision gathers the whole scene at a glance and fixates only on what stands out (size, contrast, colour, motion, position). Reading is slow and optional. The brain skips anything that does not look like it is for it.

**Use.** Build a clear order of importance: one first thing, a clear second, then the rest. Put the answer where the eye lands (top left of content in left-to-right languages, near the thing just acted on). Make labels and headings meaningful alone.

**Broken.** Everything the same weight. Eyes wander, people give up or click the wrong thing. The squint test fails: blur the screen and no shape stands out.

## 2. Hierarchy comes from contrast between things

**Principle.** Something is important because it differs from what is around it, not because it is big or bold in absolute terms.

**Why.** Perception is relative. Brightness, size and weight are judged against neighbours. One bold thing among quiet things reads as loud; ten bold things read as noise.

**Use.** Make differences decisive: a large step in size (about 1.25 to 1.5 times between levels, much more for display), a clear step in colour (primary, secondary, muted text), one accent. Spend contrast on one or two things per screen. Von Restorff effect: the item that differs from its group is remembered and noticed first. That is the reason for **one star per screen**.

**Broken.** Timid steps (14 against 15 px), several accents, every card highlighted, bold labels and bold values together.

## 3. Proximity and grouping (Gestalt)

**Principle.** Things near each other are seen as belonging together. Things that look alike, share a boundary or line up are also seen as groups.

**Why.** The visual system groups automatically, before conscious thought, using proximity, similarity, common region (a shared background or border), continuity (lines that flow) and closure.

**Use.** Make the space inside a group clearly smaller than the space between groups (a ratio of about 1:2 or more). Use space before lines or boxes: a gap groups with no ink. Use a shared background only when grouping is not obvious. Align members of a group on a shared edge.

**Broken.** Equal gaps everywhere, so nothing groups. A label closer to the item above than its own field, so people read it as the wrong label. Borders around everything (too many regions).

## 4. Alignment creates order, and order creates trust

**Principle.** Elements that share an edge, baseline or centre look intentional. Near-misses look like mistakes.

**Why.** The eye detects tiny misalignments (a pixel or two on long edges) and reads them as carelessness, and from that, as low quality overall. Strong alignment lines also guide the eye down a page.

**Use.** A small number of alignment lines per screen (two or three left edges). Align text on baselines, not boxes. Right-align numbers so digits line up. Use optical alignment where geometry misleads: circles and triangles need slight overshoot to look the same size as squares; a play triangle sits a little right of centre; an icon next to text aligns to the text's cap height or centre line.

**Broken.** Off-by-three-pixel edges, icons that float above the text line, numbers in a column with ragged decimals.

## 5. Whitespace is structure, not emptiness

**Principle.** Space separates, groups, emphasises and gives rest.

**Why.** Crowding forces the eye to do work to separate things (cognitive load). Surrounding an element with space makes it stand out without adding anything. Generous space reads as confidence and quality.

**Use.** Use a spacing scale and reuse it so space has a rhythm (4, 8, 12, 16, 24, 32, 48, 64...). Give the star extra room. Make section gaps clearly larger than internal gaps. Margins are larger than gutters.

**Broken.** Everything touching (dense, anxious), or random gaps (rhythm lost), or the opposite: a vast blank band with nothing to anchor it.

## 6. Type does most of the work

**Principle.** Most of an interface is text, so type quality is interface quality.

**Why.** Legibility depends on size, x-height, contrast, spacing and line length. Readers' eyes travel along a line and jump back; too-long lines lose the return, too-short ones break rhythm.

**Use.**
- **Measure:** 45 to 75 characters per line; about 65 is ideal.
- **Leading:** about 1.45 to 1.6 for body; tighter for large display text (1.0 to 1.15); looser for long lines.
- **Scale:** a modular ratio (1.2 to 1.333 for apps, larger for marketing) gives steps people can tell apart. Perceived size difference is proportional (Weber), so steps should multiply, not add.
- **Tracking:** slightly looser for small and uppercase text; tighter for very large display text. Never tighten small text.
- **Weight and size together:** use size and colour for hierarchy; keep weights to two.
- **Tabular figures** where numbers are compared or change, so digits do not dance.
- **Sentence case** reads faster than all caps, because lower-case word shapes are distinctive.

**Broken.** Edge-to-edge text on a wide screen, thin grey 12 px captions, five weights, headline wrapping to four lines.

## 7. Colour: lightness does the work, hue adds meaning

**Principle.** Contrast between light and dark carries legibility and hierarchy. Hue carries meaning and mood.

**Why.** The eye's detail vision is mostly achromatic. Text and edges are read by luminance contrast; colour alone fails for low-vision and colour-blind users (about 1 in 12 men have a colour deficiency). Hues are interpreted by association (green okay, red danger) and by emotion.

**Use.**
- Build from one tinted neutral ramp. Define steps by lightness. Perceptually uniform spaces (OKLCH) give steps that look evenly spaced and keep hue stable as lightness changes.
- Meet WCAG contrast (4.5:1 body, 3:1 large and UI parts) as a floor. Know it is a rough model: very light text on dark can look fine and fail, or the reverse. Look at the real thing.
- One accent for action and selection. Semantic colours for meaning only, always with a word or icon too.
- Dark themes are not inverted light themes: reduce pure white, lower saturation, express depth with lighter surfaces, not shadows.
- Tint neutrals toward the brand hue a little; pure grey feels cold and unconsidered.

**Broken.** Brand colour used as large backgrounds and as text; red and green as the only signal; five blues; pure `#000` on `#fff` in a long reading page (glare).

## 8. Affordance, signifiers and feedback

**Principle.** A control should look like what it does, and answer every action.

**Why.** People form a mental model from appearance. A thing that looks pressable gets pressed. When an action produces no visible reply, people repeat it or doubt the system. Latency thresholds shape trust: about 100 ms feels instant; about 1 s keeps flow; beyond about 10 s attention is lost. Doherty threshold: under about 400 ms a system feels responsive.

**Use.** Buttons look like buttons (a fill, an edge, a clear label); links look like links. Every control has hover, focus, pressed, disabled. Respond within 100 ms (pressed state, optimistic update), show progress for longer waits, confirm results. Use motion to show cause and effect (where something came from and went).

**Broken.** Flat text that is secretly a button; silent failures; spinners with no label; a toggle that moves but does not say what it did.

## 9. Fewer, clearer choices

**Principle.** Time to decide grows with the number and complexity of options (Hick's law). Working memory holds only a few chunks.

**Why.** Each added option adds scanning and comparison cost. People satisfice: they take the first acceptable option.

**Use.** One primary action per view. Group and order options by frequency and meaning. Progressive disclosure: show the common path, tuck the rare one behind one click. Sensible defaults so that doing nothing is fine. Chunk long data (phone numbers, card numbers, sections).

**Broken.** Three equal buttons in a hero, a 12-item top nav, a settings page with 40 switches at one level.

## 10. Target size and distance (Fitts's law)

**Principle.** The time to hit a target grows with distance and shrinks with size.

**Why.** Pointing is a motor act with a limit on precision and speed. On touch, fingers are about 10 mm wide and cover what they press.

**Use.** Touch targets at least 44 pt (iOS) or 48 dp (Android), 44 px on web. Put the primary action within thumb reach on phones. Make frequent targets large and close to where the pointer already is. Edges and corners of the screen are effectively infinitely large targets on desktop. Put a little space between targets so mistakes cost nothing.

**Broken.** 24 px icon buttons packed on phones, the primary action at the far top corner on a big phone, a delete button right beside save.

## 11. Consistency and convention (Jakob's law)

**Principle.** People spend most of their time in other products and expect yours to work the same way.

**Why.** Learned patterns become automatic and free attention. Breaking a convention costs thought, so break one only for a clear gain.

**Use.** Use platform and web conventions for the things everyone knows: logo top left links home, hamburger or tab bar, magnifier is search, floppy is save (and is also fading), cart top right. Be consistent inside the product: the same thing looks and behaves the same, and has the same name, everywhere. Use standard controls.

**Broken.** A custom scrollbar that does not scroll like one, a dropdown that opens upward for no reason, "workspace" and "project" meaning one thing.

## 12. Fidelity of the whole: the aesthetic-usability effect

**Principle.** People find attractive things easier to use and forgive them more.

**Why.** Positive affect widens attention and tolerance. Visual polish is read as a signal of care, competence and safety. The reverse is also true: small roughness (misalignment, inconsistent spacing, a broken state) makes people distrust the content, the data and the payment form.

**Use.** Sweat the small, repeated things: spacing, alignment, states, icon weight, empty and error screens. That is where "cheap" is felt (see `feels-cheap.md`).

**Broken.** A beautiful hero and a raw browser-default form below it.

## 13. Cognitive load: remove, then organise

**Principle.** Every element costs attention. Intrinsic load (the task) cannot be removed; extraneous load (the interface) can.

**Use.** Remove anything that does not serve the task: decoration, duplicate labels, redundant icons, instructions the design should have made unnecessary. Then organise: group, order, label. Use recognition over recall: show options, recent items, defaults. Keep the person's place and work safe.

**Broken.** Tooltips explaining a button that should have been clearer, text-heavy empty screens, a cluttered toolbar.

## 14. Rhythm, scale and repetition

**Principle.** Repeated spacing, sizes and structures create a rhythm the eye can predict. Predictability is calm, and calm lets the one break stand out.

**Use.** Choose scales for space, type and radius, and reuse their steps. Repeat the same component structure for the same kind of content. Vary scale on purpose in one place (the star).

**Broken.** Twenty arbitrary values, cards that are each slightly different, a grid that changes columns without reason.

## 15. Reading patterns are context, not law

**Principle.** The famous F and Z scan patterns describe what people do on dense, unstructured pages, not what they must do.

**Use.** Do not design for a pattern; design a clear hierarchy and the eye will follow it. Put the most important content at the top and left of its region, and put the key actions where the content ends (after reading, the eye looks for what to do next).

## 16. Depth, elevation and layering

**Principle.** Overlapping, shadow and lightness tell the eye what is in front.

**Why.** Light comes from above in our experience. Closer objects are lighter (on dark themes) or cast larger softer shadows. Layers communicate interaction: a menu above a page is temporary.

**Use.** A few elevation levels (flat, raised, floating, overlay), each with a defined surface step and shadow. Anything that floats (menu, modal) is clearly above. Do not use shadow for things at rest.

**Broken.** Everything has a shadow, or shadows point different ways, or a modal that does not dim the page.

## 17. Motion is a language of cause and effect

**Principle.** Our visual system is very sensitive to movement. It captures attention involuntarily and explains relationships.

**Why.** Motion shows where something came from, where it went, what is related and what changed, which static frames cannot. But it is also the strongest attention thief, so every moving thing is a cost.

**Use.** Move only to explain or confirm (`motion.md`). Short and eased: 100 to 400 ms. Start fast and settle (ease-out) for things that appear. Keep paths short and consistent with the direction they came from. Offer a no-motion path.

**Broken.** Looping decoration next to the thing you are trying to read; long entrance animations on every load; motion sickness from parallax.

## 18. Trust is built in small moments

**Principle.** People decide whether to trust a product from tiny cues, and lose it from one mishap.

**Use.** Be specific and honest in copy; say where data goes; never invent social proof; show real state (what is saved, what is syncing); never lose a person's work; admit errors plainly and say what to do. The peak-end rule: people remember the peak and the end of an experience, so make the successful finish feel good.

## 19. Content-first and real data

**Principle.** An interface is a vessel for content. Designs tested with placeholder content mislead.

**Use.** Design with real, long, short, missing and messy content. Names 40 characters long; zero items; ten thousand items; a failed image. Plausible numbers and names. If the content is not known, design for the ranges.

**Broken.** `Lorem ipsum`, three perfect cards, a layout that breaks on the first German word.

## 20. Constraints produce character

**Principle.** A small, strict set of choices makes something recognisable. A large set makes it generic.

**Use.** One typeface (or a deliberate pair), one accent, one corner treatment, one icon set, one motion curve, one idea. Then one deliberate exception. That is the whole method behind a direction (`direction.md`): the constraints are what make a product look like itself and nothing else.

---

## Using this file

When you hit a decision no rule covers:
1. Name what the person is trying to do (mode).
2. Ask which principle above is in play (grouping? hierarchy? feedback? target size?).
3. Choose the option that follows from it, and say which principle in the report if it was not obvious.

When a rule seems to give a bad result, look for the principle underneath it. The rule exists to serve that principle; if the principle is better served another way here, the rule yields (but the project's own rules still win).
