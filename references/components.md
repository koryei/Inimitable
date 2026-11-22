# What a complete component does

A component that looks right in one state is a screenshot. A component is finished when every state and every input method works. This is the list to build against, distilled from how mature component sets (see `libraries.md`) cover the ground. Use it as a checklist when you build a part, and as a review list when you adopt one.

**Every component:** default, hover, focus-visible, pressed, disabled (with a reason), loading where it can wait, error where it can fail. Works by keyboard and touch. Has an accessible name. Takes its colours, spacing, radius and type from tokens. Respects reduced motion. Looks right in light and dark if the product has both.

## Inputs

- **Button.** Roles: primary, secondary, ghost, danger. Sizes with 44 px touch height. Icon support. A loading state keeps its width, shows a spinner and blocks double submit. Label says what happens.
- **Icon button.** Square, 44 px target, always has an accessible name and a tooltip.
- **Text field.** Visible label (never placeholder-only), helper text, error text tied to the field, leading icon, clear button where useful, correct `type`, `inputmode` and `autocomplete`.
- **Number field.** Steppers, locale-aware formatting for currency and units, min and max, tabular figures.
- **Search field.** Clear button that appears when there is text, Escape clears, loading state, results announced.
- **Select and combobox.** Filters as you type, sections, empty result message, keyboard navigation, custom value where it makes sense, no clipping by parents.
- **Checkbox, radio, switch.** Large hit area including the label, indeterminate state for checkbox, switch applies immediately and says what it does.
- **One-time code.** One logical field: paste distributes across boxes, autofill works, backspace moves back.
- **Date and time.** Typing works as well as picking; ranges show both ends; unavailable days are struck through; time fields allow 12 and 24 hour.
- **File upload.** Drag and drop plus a button; validation with a reason (`File is over 10 MB`); progress per file; cancel and retry; completed state.
- **Slider.** Value shown, keyboard steps, fine control on touch, a label saying the unit.
- **Token or tag input.** Items are atomic, removable by keyboard, undo works, paste keeps tokens.

## Overlays

- **Modal.** Focus moves in and is trapped, Escape closes, focus returns to the trigger, background does not scroll, one clear primary action. An **alert dialog** for destructive confirms names the thing and the consequence.
- **Drawer or sheet.** Same rules as modal; any edge; swipe to dismiss on touch; width fits content.
- **Popover.** Anchored to its trigger, flips to stay on screen, closes on outside click and Escape.
- **Dropdown and context menu.** Opens from the trigger edge, arrow keys and type-ahead, icons and shortcuts as keycaps, submenus, checkable rows, long-press and Shift+F10 for context menus, a visible separation for destructive items.
- **Tooltip.** Never the only place information lives; shows on focus as well as hover; short; no interactive content.
- **Toast.** Stacks, pauses on hover, has an action when undo or retry is possible, a cap on how many show, announced politely to screen readers, never covers the primary control.
- **Command palette.** Opens with Cmd or Ctrl K, searchable commands with sections and shortcuts, recent first, empty state, Escape closes.

## Navigation

- **Sidebar.** Groups with quiet labels, active item marked, collapsible, current user and team menu at the foot, becomes a drawer or bottom bar on phones.
- **Tabs.** Indicator follows the active tab, arrow-key navigation, panel keeps its scroll position, a URL for each tab when content is substantial.
- **Breadcrumb.** Shows depth, last item is the current page and not a link.
- **Pagination or infinite scroll.** Shows where you are and how many; keeps position on Back; offers a way to the end.
- **Accordion.** Header is a button, state announced, only one open if the design needs it, content height animates without layout jump.

## Data display

- **Table.** One row height, aligned columns (numbers right, tabular), sticky header, sort indicator, selection, row actions, pagination, empty and loading rows, responsive fallback (cards or an inner scroll area, never the page).
- **Data grid.** Everything a table does plus editable cells, range selection, resizing, undo and redo, export.
- **Stat card.** Label, figure, change with its comparison. Loading skeleton the same size.
- **Chart card.** Title, a one-line hint of what is plotted, one accent for what matters, hover readout, legend that matches, accessible description, loading and empty states.
- **Badge, chip, tag.** Quiet by default; status chips pair a word or icon with the colour; removable tags are keyboard reachable.
- **Avatar.** Image with initials fallback, consistent sizes, a group stacks with a `+N` overflow.
- **Notification centre.** Grouped by time, unread state, inline actions, mark all as read, empty state that says what appears here.

## Feedback and status

- **Skeleton.** Shaped like the real content, same dimensions, labelled for screen readers, cross-fades into content.
- **Spinner.** For short waits only, announced as loading; anything over a couple of seconds gets progress or a skeleton.
- **Progress and meter.** Determinate when you can, with a value and label; a meter shows a level in a known range with status tones.
- **Empty state.** One sentence on what will appear, one button that starts it. Not an illustration for its own sake.
- **Banner and alert.** Inline, dismissible when safe, says what to do. Reserve full-width banners for things that affect the whole app.
- **Thinking and agent states.** A status line that names the current step, an elapsed timer, a way to stop, the final answer replacing the status without a jump.

## Chat and agent surfaces

- **Composer.** Grows with text up to a limit, Enter sends and Shift+Enter breaks, a visible stop control while the agent works, attachments and model choices where relevant, sits above the on-screen keyboard on phones.
- **Message list.** Streams without jumping scroll, new content announced once, copy and retry actions, long code and tables scroll inside their own frames.
- **Approvals.** Plain-language ask of what will happen and to what, approve and decline equally reachable, outcome stated afterwards.

## Settings

- **Settings.** Grouped by task, each control with helper text where its effect is not obvious, every write confirms success or reports failure, dangerous options last and separated.
- **Account and data.** Export, delete, sign out everywhere, and a plain statement of what is stored.
