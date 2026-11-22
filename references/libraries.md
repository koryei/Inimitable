# Libraries and where to look

Building well is mostly choosing well. This file says where good parts and good examples live, when to reach for each, and the rules for taking from them. Facts here were checked against each project's own pages and README in November 2026; versions, prices and licences change, so re-read the licence before shipping anything.

## The rules for taking from a library

1. **The project's own parts come first.** Its components, tokens and icon set. Then a library the project already uses. A new dependency is a decision for the person, not a convenience for you: ask before adding one.
2. **Prefer source you can own** (copy-in, shadcn-style registries) for small pieces. Prefer a headless, accessible base (React Aria, Radix) for behaviour: focus, keyboard, announcements.
3. **Re-skin everything to the project's tokens.** Demo components arrive with their own colours, gradients, glows and radii. The tells in `anti-slop.md` apply to library code exactly as to your own. Many animated-effects components are the tells (glowing borders, sparkles, gradient text): take the mechanism, drop the decoration.
4. **One motion system and one component system per project.** Do not mix two animated libraries on one screen.
5. **Check the stack before installing.** React version, Tailwind version, router, framework. A component built for Tailwind v4 or React 19 will not drop into an older setup.
6. **Check the licence.** Free is not the same as unrestricted. Typical limits: no redistribution as a competing library, attribution, separate terms for paid tiers. Never sign up, subscribe or pay on the person's behalf.
7. **Say what you took.** In the report: the library, the pieces, the licence, and anything that needs credit.
8. **Learn from, then build.** Studying how a good component handles its states is always allowed. Copying a whole look is not the goal: the goal is the right behaviour in this product's own style.

## Component and motion sources

| Library | What it is | Best for | Take it with | Licence and cost |
| --- | --- | --- | --- | --- |
| **[Bencho](https://bencho.dev)** | About 48 interactive React blocks and 24 synthesised interface sounds: liquid toggle, toast stack, slide to confirm, one-time code, label input, rolling counter, pull to refresh, magnifying dock, card stack, signature pad, upload dropzone | Micro-interactions and playful controls; studying how a control feels | `npx shadcn@latest add https://bencho.dev/r/<block>.json`, or copy the folder (needs `framer-motion`, `lucide-react`) | Free blocks MIT; Pro blocks (180+) and MCP are paid; the name and photos are excluded |
| **[Transitions.dev](https://transitions.dev)** | 43 copy-paste CSS transitions with motion tokens and a reduced-motion guard: dropdown, modal, toast, tabs, skeleton to content, success check, error shake, number roll, text swap | Everyday motion that must be right: menus, modals, toasts, state changes | `npx transitions-dev add <name>`, or copy the snippet; also ships its own agent skill | Free for personal and commercial use, modify freely; do not redistribute as a competing library; tooling MIT; some transitions are Pro |
| **[BoardUI](https://boardui.com)** | React, Tailwind v4 and React Aria design system for dashboards and agent interfaces: data table and grid, stat cards, sidebar, settings modal, notification centre, command palette, toast, skeleton, drawer, chat composer, thinking indicator | Dashboards, admin tools, chat and agent UIs | `npx boardui@latest init --yes`, then `add <name>`; MCP server `npx -y boardui@latest mcp` | Free tier is about 69 items as source (read the repo LICENSE); Pro adds chart cards, agent components, templates |
| **[Astryx](https://astryx.atmeta.com)** (Meta) | A complete design system: 150+ accessible components, seven themes, patterns (table pages, detail layouts, form wizards), CLI. React 19+ and StyleX; override with Tailwind, CSS modules or plain CSS. Beta | A product that needs a whole system, especially internal tools | `npm i @astryxdesign/core @astryxdesign/theme-neutral @stylexjs/stylex`, then `npx @astryxdesign/cli init` (writes AGENTS.md) | MIT |
| **[Aceternity UI](https://ui.aceternity.com)** | 200+ animated components, blocks and landing templates on Tailwind and Motion: spotlight, 3D cards, parallax, backgrounds | Landing-page and showpiece effects, used sparingly | `npx shadcn@latest add @aceternity/<name>` | Free components are open source; Pro templates and blocks are paid under a custom licence that restricts redistribution |
| **[ObsidianUI](https://obsidianui.dev)** | Animated, interactive React components on Tailwind and Motion: text effects, staggered grids, trading cards, cursor effects | Expressive Persuade and Experience pages | CLI or copy the source | Free; confirm the licence before shipping |
| **[HorizonX](https://horizonx.so)** | A subscription library of UI kits, templates, Figma files, components, 3D models, shaders, textures and mockups, with an MCP server and Figma plugin | A team already subscribed that wants Figma-first kits and templates | Download, or MCP | Paid subscription (from about $20 a month) with a commercial licence; downloads are capped. Never subscribe for the person |

### Which to reach for

| You need | Reach for |
| --- | --- |
| A menu, modal, toast, tabs or accordion to open, close and swap well | Transitions.dev recipes, restated in the project's tokens |
| A delightful, specific control (toggle, slider, counter, confirm gesture) | Bencho, as a reference for feel, then build or adopt in the project's style |
| A dashboard, table, stat cards, settings, command palette, agent chat | BoardUI parts, or Astryx if the project needs a full system |
| A whole design system with themes and conventions | Astryx |
| A landing-page effect | Aceternity or ObsidianUI, for the mechanism only, and only in Persuade or Experience modes |
| Figma-first kits or templates | HorizonX, only if the person already has it |

## Where to look for how real products do it

| Source | What it is | Use it for | Notes |
| --- | --- | --- | --- |
| **[Mobbin](https://mobbin.com)** | A library of 600,000+ real shipped app screens and flows, searchable | "How do good apps handle onboarding, empty states, paywalls, settings?" Research before designing a flow | Limited free plan; flows, search and animations need a paid plan (from about $10 a month); MCP for Pro and Team. Study, do not copy screenshots into a product |
| **[21st.dev](https://21st.dev)** | A community library of React components by category: accordions, AI chats, buttons, cards, dialogs, dropdowns, forms, inputs, sidebars, tables, tabs, toasts, tooltips | Finding a starting point for a specific component | Components are community-made: check each one's licence and quality, and re-skin to the project |
| **[react.dev](https://react.dev)** | The official React documentation | Correct patterns for state, effects, forms, transitions, accessibility; settling "how should this work" | Authoritative; prefer it over blog posts for React behaviour |

## What to learn from them, in one line each

- **Transitions.dev:** motion is a small set of named recipes with shared tokens, and every one respects reduced motion. See `motion.md`.
- **Bencho:** the difference between a control and a *good* control is a few specific behaviours: weight, anticipation, a reply to every press. See `components.md`.
- **BoardUI and Astryx:** a system is tokens plus components that agree with each other, with every state designed. See `components.md`.
- **Aceternity and ObsidianUI:** effects sell a landing page and wreck a working screen. Use them where the mode allows.
- **Mobbin:** look at five real apps before inventing a flow.
