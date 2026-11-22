# Surface: terminal UI (Terminal)

Text and colour only, in a grid the user resizes. The person types a command or reads an outcome. They want to know what happened, and what to do next, at a glance.

## Principles

- **Outcome first.** The most important line is the result: what was done, what failed. Detail follows, quieter.
- **Hierarchy with three tools**: weight (bold for the one thing to read first), brightness (dim for detail), and one or two colours with meaning. Nothing else: no boxes around everything, no banners on every run.
- **Colour means something.** Green: success. Red: failure. Yellow: needs attention. One accent colour for the product (prompts, selection, links). Everything else is the terminal's default foreground, so it works on any theme.
- **Degrade gracefully.** Honour `NO_COLOR`, `FORCE_COLOR`, and non-TTY output (no colour, no spinners, no cursor movement when piped). Information must survive without colour: add a word or a symbol (`✓ done`, `✗ failed`).
- **Width discipline.** Detect columns. Wrap at the real width, never a hard-coded 80. Check at 60 and 120 columns. No line may exceed the width; tables degrade to lists when narrow.
- **Signal over noise.** Default output is short. `--verbose` shows more. Progress is one updating line, replaced by the result when done.

## Structure of a command's output

1. **Progress** (only while running, only on a TTY): one line, a spinner or percentage, what is happening now.
2. **Result line:** `✓ Wrote 3 files in 1.2s`, or `✗ Could not reach the server`. The progress line is replaced by it.
3. **Detail:** the few lines that matter, indented under the result, dim.
4. **Next step:** if something failed, the one thing to try, on its own line (`Run remy login to sign in`).

## Errors

- Say what went wrong in plain words, then what to do. No stack traces by default (`--debug` shows them); no jokes; no blame.
- Exit codes are meaningful (0 success, non-zero failure) and documented.
- Messages go to stderr; results go to stdout.

## Prompts and interaction

- Questions are single and specific, with a visible default (`Overwrite? [y/N]`). Enter takes the default.
- Selection lists show the current choice with the accent colour and a marker (`›`), not only colour. Arrow keys, `j/k`, and Enter work; a hint line says so.
- Secrets are never echoed and never printed.
- Ctrl-C always works and leaves the terminal in a sane state (cursor shown, raw mode off).
- Never ask for something the tool can find itself.

## Text styling

- Sentence case. No exclamation marks. No emoji as status; use `✓ ✗ • › !` or words.
- Tables: align columns, right-align numbers, a dim header, no outer box.
- Code and paths in the terminal's default foreground (or accent when they are the answer); do not fence them.
- Timestamps relative when recent (`2 minutes ago`), absolute otherwise.
- Banners and ASCII art: at most on the first run or `--version`, never on every command.

## Help text

- `--help` leads with one line on what the command does, then usage, then the few options that matter most, then examples. Group commands; show defaults; no wall of text.

## Full-screen terminal apps (Ink, curses, Bubble Tea and the like)

- Fill the available height and width; reflow on resize.
- A persistent status line (dim) for mode, hints and key state; an input line anchored at the bottom.
- Rendering must not flicker: redraw only what changed.
- Leave the screen as you found it when you exit (alternate screen restored, scrollback intact if you did not use it).
- Feedback within 100 ms of a keypress.

## Verify

Run `scripts/term-shot.mjs` on the command at 60 and 120 columns, with and without `NO_COLOR`. Read the captured text and the image: is the result line the first thing you see? Is anything wrapped badly or lost without colour?

## Bright element

The result line.
