# Layer 4: Copy

## Rules

- **Headlines say what the product does for whom**, in plain words, so they could not fit another product. Use facts already on the page; invent none.
- **No exclamation marks** in interface text.
- **No greeting headlines** (`Welcome back, Sam! 👋`). The title names the context: the page, or the period (`November 2026`).
- **Short labels.** `Search`, not `Search anything...`.
- **A change says what it compares to**: `+12% vs last month`, `3 fewer than last week`.
- **No trailing periods** on headlines, subheads, labels, buttons or captions. Paragraphs of several sentences keep theirs.
- **No hype words**: supercharge, seamless, unlock, magic, revolutionize, game-changing, effortless, next-generation, cutting-edge. No "AI-powered" on everything.
- **Unverifiable claims** (`Loved by 10,000+ teams`, `10x faster`) are asked about. If real and confirmed, make them quiet and specific; otherwise remove. List them in the report.
- **Mock data looks real**: plausible names, amounts, dates. Never `John Doe`, `[X]`, `123,456`.
- **Badges** (`PRO`, `New ✨`, `Beta 🚀`) go unless the product really needs them, then as quiet text.
- **Errors** say what happened and what to do next, in a human voice, without blame or jokes.
- **Buttons say what happens**: `Save and continue`, `Add this machine`. Not `Submit`, `OK`, `Click here`.
- **Empty states** say what will appear here and give one way to start.
- Sentence case. Numbers in one format. Dates and times in the person's format.

## How

1. Collect every string on the screen into a list.
2. Rewrite each against these rules, starting with the headline.
3. Put the rewritten copy into the real files, keeping translations or i18n keys intact.

## Check

- `signs.mjs` finds no hype words, exclamation marks or unverifiable claims.
- The swap test: with the name covered, could this copy sell a competitor?
