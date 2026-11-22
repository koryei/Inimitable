# inimitable: approved decisions

Only what the owner has approved goes in `SKILL.md`, and `SKILL.md` is written only from this file.
An item is proposed in chat, approved by the owner, then added here with its date and source.
Nothing here is a draft.

## Approved

| # | Decision | Source | Approved |
|---|---|---|---|
| 1 | The skill is global (`~/.claude/skills/inimitable/`), not tied to one project. It keeps improving as more projects are built. | owner | 2026-11-16 |
| 2 | Name: `inimitable`. | owner | 2026-11-16 |
| 3 | Backbone: one fixed run for any request. The skill detects whether the job is new or a fix of an existing screen, and branches. Not a set of commands. | owner | 2026-11-16 |
| 4 | Sources: impeccable (impeccable.style), tasteskill (tasteskill.dev) and unslop (github.com/heydamir/unslop) are built on item by item. Each idea is proposed in chat with its source named and goes in only after approval. | owner | 2026-11-16 |
| 5 | Surfaces covered from the start: web apps and dashboards, landing and marketing pages, terminal UI, native mobile. | owner | 2026-11-16 |
| 6 | The one-shot bar: it looks right on first show. The skill renders the real screen, checks it at phone and desktop sizes, and fixes what it finds before showing the owner. The owner should only need to give taste feedback. | owner | 2026-11-16 |
| 7 | Approvals are tracked in this file. | owner | 2026-11-16 |
| 8 | The skill is extremely in-depth and practical, and good at one-shotting. | owner | 2026-11-16 |
| 9 | The run has nine steps, in this order: 1 Read (the brief, the project's own design rules and tokens, and the existing screens running in a real browser). 2 Decide the mode (persuade, operate, read or experience; from impeccable). 3 Fix the direction (one sentence on what it should feel like and what it must not look like). 4 Branch: an existing screen is fixed layer by layer (spacing, colour, icons, copy, type, layout, details, motion; from unslop), a new screen is built around one bright element (from tasteskill). 5 Build. 6 Gate (run the checks). 7 Look (render at phone and desktop sizes and fix what shows). 8 Report (short summary, before and after). 9 Log (record what was learned). Each step is deepened one at a time, with approval. | owner | 2026-11-16 |
| 10 | The project's own design rules win over the skill's taste (brand guide, tokens, checklists). Where a project has none, the skill proposes rules and the owner approves them. | owner | 2026-11-16 |
| 11 | Step 1 Read, A1: find the project's design rules (brand guide, tokens, DESIGN.md or PRODUCT.md, CSS variables, Tailwind config, design notes in CLAUDE.md). Say in one line what was found and what was not. | impeccable, decision 10 | 2026-11-16 |
| 12 | Step 1 Read, A2: what the code already does is evidence about the product, not approval of the look. Existing sloppy styling is never treated as a rule. | impeccable | 2026-11-16 |
| 13 | Step 1 Read, A3: establish what is real: subject, audience, the one thing the screen must get someone to do, the stack, and which images and assets truly exist. Never plan around pictures that do not exist. | tasteskill | 2026-11-16 |
| 14 | Step 1 Read, A4: inventory the subject: 8 to 12 things that belong to this client and to no competitor (name and meaning, place, numbers, constraints, materials, rituals). This list is where the idea comes from later. | tasteskill | 2026-11-16 |
| 15 | Step 1 Read, B1: see it running first. Launch the app and capture every affected screen at phone and desktop widths before changing anything. These are the "before" images and include empty, loading and error states where they exist. | owner's Activity test | 2026-11-16 |
| 16 | Step 1 Read, B2: measure the drift. Count the font sizes, radii, colours and spacing values in use and compare with the project's scale. | owner's Activity test | 2026-11-16 |
| 17 | Step 1 Read, B3: when a request is vague, state the reading in one line and proceed. Ask only when a missing fact blocks the work. | tasteskill | 2026-11-16 |
| 18 | Step 1 Read, B4: do not ask the owner about colours, fonts or vibe in this step. Those come from the project's rules and the direction step. | impeccable | 2026-11-16 |
| 19 | Step 2 Decide the mode: modes go in. A mode is what a person is trying to do on the screen. Four from impeccable: Persuade (landing pages), Operate (apps, dashboards), Read (docs, long text), Experience (showpiece, brand). | impeccable | 2026-11-22 |
| 20 | The terminal app gets its own fifth mode, with its own rules (text and colour only, narrow width, no images). | owner | 2026-11-22 |
| 21 | The mode is used to pick rules and nothing else; the report (step 8) says which mode was used, and no more. | owner | 2026-11-22 |
| 22 | Step 3 Fix the direction: when the project has design rules, the direction is taken from them and stated in one sentence (what it should feel like, what it must not look like), then the run proceeds. Nothing is invented over the project's rules. | impeccable, decision 10 | 2026-11-22 |
| 23 | Step 3: when the project has no design rules, the skill drafts the direction and a few rules from the subject inventory (decision 14) and waits for the owner's yes before building. | tasteskill, decision 10 | 2026-11-22 |
| 24 | Step 4 Branch, fixing an existing screen: work in layers in this order: spacing, colour, icons, copy, type, layout, details, motion. | unslop (CC BY 4.0, Damir Sokolovsky) | 2026-11-22 |
| 25 | Step 4 Branch, building a new screen: every new screen has one star (the "bright element"). The brand's own palette decides what bright means; it does not have to be a colour. The star is made first with size, weight, contrast or imagery, and an accent colour is used only if the project's rules allow one (owner's example: Apple is black and grey). | tasteskill, owner | 2026-11-22 |
| 26 | Step 5 Build: reuse first. Use the project's existing components, tokens and icon set; add a new piece only when nothing fits, and name it in the report. | impeccable, decision 10 | 2026-11-22 |
| 27 | Step 5 Build: build one section at a time, rendering and checking each before the next, rather than the whole screen at once. Real content, and empty, loading and error states are part of each section. | owner | 2026-11-22 |
| 28 | Step 6 Gate: run the project's own checks (lint, types, tests). On a failure, fix what the work broke and re-run; move on only when green. If it cannot get green, stop and say what is failing. | owner | 2026-11-22 |
| 29 | Step 6 Gate: also run the skill's own design checks, measured: repeat the drift count from step 1 (decision 16) so the report can show it went down, and check contrast and tap-target size (44 px). | owner's Activity test, decision 16 | 2026-11-22 |
| 30 | Step 7 Look: always render the real screen at four widths: 320 px (small phone), 390 px (phone), 1440 px (desktop) and 2560 px (big screen). Terminal UI is checked at its narrow and wide column counts instead. | owner, decision 6 | 2026-11-22 |
| 31 | Step 7 Look: look, fix, look again until clean, at most three rounds; then show, and list anything left over honestly. | owner | 2026-11-22 |

## Licences (facts, not decisions)

- unslop: CC BY 4.0, by Damir Sokolovsky (@heydamir). Any adaptation must keep that credit.
- impeccable and tasteskill: no licence file in the installed copies. Restate ideas in our own words and name the source. Do not copy wording until terms are confirmed.

## Open

Not yet decided: the steps of the run, house rules, anti-slop list, per-surface rules, verification method, scripts, how lessons are logged after each project.
