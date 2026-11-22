# What makes an app feel cheap

Most of what makes software feel cheap is not how it looks. It is what happens when a person does something and the app does not answer, explain, or remember. This is the checklist for **Operate** screens and anything with state. Run it in the Look step, after the visual checks.

Six areas. Each item is a yes or no you can check on the running screen.

## 1. User guidance and trust

- **Say where data goes** at every moment someone hands something over: a key, a file, a card, a permission. One plain sentence beside the action: what is stored, where, how to remove it.
- **No dead ends.** Every empty state has one sentence saying what will appear here, and one button that starts it.
- **Helper text on any control whose effect is not obvious.** A switch labelled "Sync" explains what syncs and where.
- **Buttons say what happens.** `Save and continue`, `Add this machine`, `Create the schedule`. Never `Submit`, `OK`, `Click here`, `Yes`.
- **Never ask for what the app already knows.** Do not ask for an email it has, a choice it can default, or a location it can read. Offer the last thing the person did.
- **Destructive actions name what they destroy** (`Delete 3 invoices`) and offer undo where it can, confirmation where it cannot.
- **First run shows value before it asks for anything.** An account wall, a tour or a survey before the first useful moment is a tax.

## 2. Feedback and error handling

- **Every action that can fail has a visible outcome**: success confirms the result in words, failure says what happened. A write that fails silently is the worst bug in an app.
- **Errors are specific and kind.** What went wrong, what to do next, a retry. Never `Something went wrong`, `Oops`, or a raw status code. Map each failure class to one plain sentence: not signed in, no permission, not found, conflict, rate limited, server down, no connection.
- **Keep what the person typed** when validation fails. Explain next to the field, in words, after they leave it, not on every keystroke.
- **Disable-with-reason, not disable-in-silence.** A greyed button explains itself on hover, focus or in helper text.
- **Pressed means seen.** Every control reacts within 100 ms: pressed state, spinner on the button, optimistic update. The person never wonders whether the tap registered.
- **Undo beats confirm** for reversible actions: a toast with `Undo` for about six seconds.

## 3. Loading, and the states between

- **Loading names the thing.** `Loading invoices`, not a bare spinner. Use a skeleton shaped like the content, so the page does not jump when it arrives.
- **No layout shift.** Images and embeds reserve their size. Content swaps in place, with a short cross-fade.
- **Long waits show progress and a way out** (cancel, or carry on elsewhere). Say roughly how long.
- **Stale data says so** (`Updated 4 minutes ago`) and refreshes quietly.
- **Offline and unreachable are states**, not crashes: keep what is loaded, say what is not available, retry when back.
- **Empty is not loading and not error.** Design all three differently.

## 4. Data and retention

- **Remember what a person told you.** Filters, sort order, last tab, draft text, the theme: survive a refresh and a new session.
- **Drafts are never lost.** A form, a message or a note survives an accidental close, a crash and a lost connection.
- **Let people take their data out** (export) and **delete it** (really), and say what deleting does.
- **Searches and filters reset in one click**, and the empty result offers that reset.
- **Return people to where they were.** Deep links work; Back works; the front door offers the newest thing, not a blank start.
- **Reasons to come back come from the product**, not from nagging: a result that finished, something that changed. Notifications are opt-in, specific and rare.

## 5. Design and copy consistency

- **One icon set** at one size and stroke. No emoji in the interface.
- **One voice.** Same tense, same terms for the same thing everywhere (a thing is not a `project` here and a `workspace` there).
- **Same thing looks the same.** One button style per role, one input style, one spacing rhythm, one date and number format.
- **Times and dates in the person's format** (12 or 24 hour as they use), relative when recent, absolute when old.
- **No truncation of text a decision depends on.** Approval text, failure reasons, prices and names wrap or expand. Truncate only what is safely recoverable, with a way to read it all.
- **Typography and spacing come from tokens.** A raw value in a component is a defect.

## 6. Permissions and navigation

- **No permission prompt before value.** Ask for the microphone when the person presses the microphone, the camera when they press the camera, location when they ask for something nearby, notifications after a moment they would want one. Say why in one sentence first. Handle `No` gracefully and say how to change it later.
- **The person always knows where they are.** The active destination is marked, the page title names the place, breadcrumbs for depth.
- **Navigation is predictable.** Back does what Back does. Links open in place; only deliberate exits open a new tab. Nothing important hides behind a gesture with no visible alternative.
- **Every screen has a way out**: close, cancel, back, escape. Modals trap focus and release it on close.
- **Keyboard and touch both work.** Everything is reachable by keyboard; touch targets are 44 px; focus is visible.
- **Sign-in and sign-out are simple.** Signed out never shows broken pages or console errors: it goes to sign-in without calling protected routes.

## How to run it

1. Use the screen for real: do the main task, then break it (bad input, no network, empty account, slow response).
2. Walk the six areas above and write down each *no*.
3. Fix with the shared pieces the project already has (its error mapper, skeleton, icon component). If it has none, make one small shared piece rather than patching each screen.
4. Report which areas had problems and what changed, not the whole checklist.

Some of these need a browser tool or a person to verify (permission prompts, offline). Say plainly which you could not test.
