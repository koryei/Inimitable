# Step 2: Decide the mode

A mode is what a person is trying to do on this screen. Pick it from the **surface being worked on**, not from the product. A fashion house's docs are Read. A database tool's landing page is Persuade. Decide in one line, then use it to choose rules. The mode is named in the report and nothing else about it needs explaining.

| Mode | The person is | Success looks like | Priorities | Rule files |
| --- | --- | --- | --- | --- |
| **Persuade** | deciding whether to act | they understand the promise in five seconds and take the one action | a clear claim, one true visual, one action, trust built from facts | `references/surfaces/landing.md` |
| **Operate** | getting a job done | they finish the task without thinking about the interface | scanning, consistency, familiar controls, honest states, density | `references/surfaces/web-app.md` |
| **Read** | understanding something | they find the answer and keep reading | structure, line length, hierarchy, quiet chrome | `references/surfaces/reading.md` |
| **Experience** | inside the work itself | the work leads and the interface recedes | the artifact from the first screen, restraint, pacing | `references/surfaces/showpiece.md` |
| **Terminal** | reading and typing in a console | they know what happened and what to do next | hierarchy by colour and weight, width discipline, signal over noise | `references/surfaces/terminal.md` |

Native mobile screens take their mode from what the person is doing (most are Operate) and add `references/surfaces/native-ios.md` or `references/surfaces/native-android.md`.

## How the mode changes the work

- **Expression budget.** Persuade and Experience may spend boldly on one moment. Operate, Read and Terminal spend on precision: the brand shows in detail, never at the cost of speed.
- **Bright element.** Every new screen has one star (see `build-new.md`). In Persuade and Experience it is a visual or a headline set at scale. In Operate it is usually the thing the person must act on (the composer, the primary action, the key figure). In Read it is the content itself. In Terminal it is the result line.
- **Anti-slop handling.** Always remove tells. In Persuade and Experience, check the brand guide first, because a bold choice may be deliberate.
- **Density.** Operate is dense and tidy; Read is airy with a measure of about 65 characters; Persuade breathes in 80 to 128 px sections; Terminal is as dense as it can be while staying scannable.

## Mixed screens

A settings page inside a marketing site is Operate. A hero inside an app (an empty dashboard welcome) is Persuade, but small. When a screen holds two modes, name the larger one and apply the other's rules only to its region.

## When unsure

Ask what the person does *first* on arrival. A task → Operate. A decision → Persuade. A question → Read. A look → Experience. A command → Terminal.
