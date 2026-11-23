# Surface: web apps and dashboards (Operate)

The person came to get a job done. The interface is a tool: they should know where everything is before they notice the style. Brand shows in precise details, not in expression.

**For a new app screen, start with `node scripts/scaffold.mjs <folder> --kind app [--theme dark|light] [--accent '#hex']`.** It writes a working surface that already follows the rules below: a sidebar that becomes a menu on a phone, a page header with its one primary action, four key numbers, one chart with its legend and an "example data" label, a table whose status is a word and a dot, an empty state that says what to do, and a hover, focus and press state on every control. Four type sizes, one neutral ramp, one accent. It passes `check`, `signs` and `craft` at all four widths. Replace every `data-todo` with the product's own words and numbers; label drawn data as an example until it is real.

## Structure

- **Shell:** fixed top bar (56 to 64) or a sidebar (240 to 280), fluid content capped near 1440 to 1600. The shell fills the viewport. Navigation names where you are.
- **One main thing per screen.** The page title names the context (the page or period), then the work area. Secondary information is quieter and smaller.
- **Familiar controls.** Standard inputs, selects, tabs, menus, dialogs. Do not invent a new control for a solved problem.
- **Density:** compact rows 32, default 36, touch 40 to 44. Tables align numbers right with tabular figures; headers are sentence case and muted.

## States (design all of them)

| State | Must do |
| --- | --- |
| Empty | say what will appear and give one way to start |
| Loading | skeleton shaped like the content, naming what loads; no spinner for more than a moment |
| Error | what happened, what to do next, a retry |
| Success | confirm the result; offer the next step |
| Partial or stale | say when it was last updated |
| Long content | truncate with a way to read all; never truncate what a decision depends on |
| Offline or unreachable | say so plainly; keep what is already loaded |

## Data display

- **Stat cards:** label, figure, change vs comparison. Nothing else.
- **One main chart** at least two thirds of the width, 280 to 360 tall. Another data block beside it is a list or table.
- **One accent per chart.** Neutral steps for the rest.
- **Tables:** one row height, hairline separators at most, sticky header when long, row hover, selected state, sort indicator, and a way to scan (zebra only if rows are long).
- **Numbers:** one format per column, units shown once, negative values distinct but not alarming.

## Forms

- Labels above fields, always visible; helper text where an effect is not obvious.
- Validate on blur, explain in words next to the field, keep what was typed.
- One primary action per form, named for what it does; destructive actions confirm and name what they delete.
- Show success and failure after every write. Nothing may fail silently.

## Navigation and flow

- The current location is clear (active state: small surface step, not a glow).
- A command palette or search for apps with many destinations.
- Keyboard: every action reachable, shortcuts shown as keycaps, visible focus.
- Back works; deep links work.

## Trust moments

Where someone hands over a key, a payment or a permission, say what is stored, where, and how to remove it, in one plain sentence beside the action.

## Mobile

Sidebar becomes a bottom bar or a sheet; tables become cards or scroll within their own frame (never the page); touch targets 44 px; the composer or primary action sits above the keyboard.

## Bright element

The thing the person must act on: the composer, the primary action, the key figure, the approval card.
