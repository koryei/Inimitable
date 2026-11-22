# Contributing

The most useful contribution is a screenshot of something Inimitable got wrong.

## Report a miss

Open an issue and include:

- What you asked for, and which surface it was (web app, landing page, terminal, native).
- A screenshot or the output of `scripts/shoot.mjs` or `scripts/term-shot.mjs`.
- What looked wrong, in a sentence.
- Whether your project has its own design rules, and what they say about it.

## Propose a rule or a tell

Each addition to `references/` should be:

- **Specific.** A number, a pattern or a before and after, not "make it feel premium".
- **Evidenced.** A screen where it mattered, or a measurement.
- **Paired with a fix.** A tell without a fix just removes things.
- **Subordinate to the project.** Rules here are defaults; a project's own rules win.

If the tell can be detected, add a detector to `scripts/lib/probe.mjs` and a planted example to `test/fixtures/sloppy.html`.

## Develop

```bash
npm test                      # unit tests; browser tests are skipped when no Chrome is installed
./install.sh --check            # Node, Chrome, Python
```

Shell snippets must work on macOS and Linux (`sed -i ''` differs between them: prefer a small Node or Python script). Scripts must stay dependency-free and work on Node 22+. Keep `SKILL.md` short: detail belongs in `references/`.

## Licence

By contributing you agree your work is released under Apache 2.0. Do not copy text from other design skills unless its licence allows it, and credit it in `NOTICE.md`.
