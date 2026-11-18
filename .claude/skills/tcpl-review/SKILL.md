---
name: tcpl-review
description: Find the edge cases an existing tcpl-exercises exercise's tests miss, by analysing its description, reference solution and tests, proving each gap with a wrong solution that currently passes, and adding the tests that close them. Use when the user runs /tcpl-review with an exercise id such as 1-21, or asks to review, audit or harden an exercise's tests, or to check whether a solution they pasted would wrongly pass.
argument-hint: <exercise id, e.g. 1-21> [notes, or the path of a solution to check]
---

# Review an exercise's tests for missing edge cases

Arguments: `$ARGUMENTS`

The first word is the exercise id (e.g. `1-21`, `1-13a`). Anything after it is notes from the user, or the path of a solution to include. If there's no id, ask for one.

App: `apps/tcpl-exercises`. The exercise is in `src/server/exercises/<chapter>/<number>/`: `description.md`, `main.c` (the reference solution) and `exercise.ts` (the tests).

## What counts as a gap

A test suite exists to fail wrong solutions. So a gap is not "an input nobody tried"; it is **a wrong solution that passes every test**. Each test this review adds must come with a wrong solution it catches that nothing caught before. That standard keeps the review honest in both directions: it finds gaps that reading the tests wouldn't, and it stops tests being added that sound thorough but catch nothing.

The judge is the site's grader: its compiler flags, its comparison of output, its exit-code rule and its limits. If the grader ignores a difference, a test for that difference passes for every submission. `scripts/probe.mjs` judges everything the way the grader does, so use it rather than comparing output yourself.

Keep working files (variants, candidates, generators) in a scratch directory outside the repo.

## 1. Read everything

- `description.md`, `main.c`, `exercise.ts`, and the later solution if `exercise.ts` has one.
- The book's text around the exercise, in `apps/tcpl-exercises/[Kernighan-Ritchie]The_C_Programming_Language.txt` (local and gitignored, so it may be missing; carry on without it). Exercises often lean on the surrounding text.
- `src/server/sandbox/run-c.ts` and `outputMatches` in `src/shared/output-diff.ts`: how a run is judged, anything the comparison ignores, and the time and output limits. Read them each time; don't rely on what you remember.
- The user's notes, and any solution they pasted or pointed to.

## 2. Map what the description requires

Do this from the description, before studying what the tests cover, so the map isn't shaped by the tests.

- List every rule the description states, one per line, including what each example implies.
- For each rule, list its boundaries: zero, one and many; just below, at and just above each threshold; first and last position.
- For a program that reads a stream, draw the table of **states x events**: every state the program can be in (e.g. "blanks pending, none written", "just after a tab", "at a tab stop") against every input event (each kind of character, newline, end of input). End of input is an event like any other, and the one most often missed: it can arrive in every state.
- List the interactions: two rules applying to the same characters, one rule's output feeding another.

Then mark each cell and boundary with the id of the test that covers it. Unmarked ones are where to look. Also note anything the description doesn't decide; step 6 comes back to those.

## 3. Write wrong solutions

Put them in a scratch directory, one `.c` file each, named for what's wrong (`no-reset-at-newline.c`). Aim for 20 to 40 across these sources:

- **Small changes to `main.c`**, one per file: delete a statement or a branch, flip a comparison, move a boundary by one, change a constant, drop a reset, swap two statements. Go through the solution line by line; every line is there for a reason, and removing it should fail a test.
- **Slips a student makes in C**: `char c` for `getchar`, a fixed buffer one byte short, a variable not reset for each line, `<` for `<=`, input assumed to end with a newline, nothing flushed at end of input.
- **Misreadings**: for each rule from step 2, a solution that ignores it or applies it one case too widely or too narrowly.
- **Differently built solutions**: three to five complete solutions that don't follow `main.c`'s structure (other state variables, a line at a time instead of a character at a time, lookahead). A different structure fails in different places, which is why solutions users paste keep exposing gaps. If you can spawn a subagent, have one write them from `description.md` alone, without seeing `main.c` or the tests, so they aren't copies in disguise. Name these `ok-<name>.c`: they are believed correct, and the probe reports any disagreement with `main.c` instead of counting it as a catch.
- **Any solution the user gave**, as `ok-` if they believe it correct.

## 4. Run the probe

```bash
node .claude/skills/tcpl-review/scripts/probe.mjs <id> --variants <dir>
```

It compiles as the grader does, runs every variant on every existing test, and lists which wrong variants are caught and which survive. It also checks the reference itself: clean compile, no undefined behaviour or memory errors under sanitizers, within the grader's time and output limits, and it marks existing tests that repeat another test's input or whose expected output differs from what `main.c` prints in a way the grader doesn't see. Lines marked `!!` need a decision.

Survivors are the candidate gaps.

## 5. Find inputs that catch the survivors

Write candidate inputs to a JSON file, an array of `{ name?, stdin?, args?, files?, program?, expected? }`:

- one for each unmarked cell and boundary from step 2;
- one or more aimed at each survivor: the input where its bug shows;
- generated ones, from a short script you write for this exercise: every string up to some length over the few characters the exercise cares about (for a tab exercise: a letter, a blank, a tab, a newline), plus random longer ones where the rules need length (lines past a tab stop or a buffer size). Exhaustive short inputs find the cases nobody thought of. A few thousand candidates is plenty.

```bash
node .claude/skills/tcpl-review/scripts/probe.mjs <id> --variants <dir> --candidates <file.json>
```

The probe reports the smallest set of candidates that catches the survivors, the survivors nothing catches, and every candidate where an `ok-` solution disagrees with `main.c`.

## 6. Settle what's left

For each survivor no candidate catches, decide which it is:

- **Not actually wrong**: the change made no difference to behaviour. Drop it. (If a deleted line of `main.c` makes no difference, the line is dead; report it.)
- **Wrong only where the grader doesn't look**: no test can catch it. Report it; don't add a test.
- **Wrong, and you haven't found the input yet**: find it and go back to step 5.

For each disagreement between an `ok-` solution and `main.c`, decide from the description alone:

- `main.c` is wrong: report it prominently. Don't change `main.c`.
- The other solution is wrong: rename it without `ok-`, and it becomes one more wrong solution to catch.
- The description doesn't say: that's an ambiguity. Don't add a test that picks a side. Report it, with wording for `description.md` that would settle it.

Repeat steps 3 to 6 until a round turns up nothing new. New inputs suggest new wrong solutions, and the reverse.

## 7. Choose the tests

For each input that catches a survivor:

- Shrink it to the shortest, plainest input that still catches the same survivors. A reader should see what it checks.
- Work out the expected output by hand from the description, then put it in the candidate's `expected` and let the probe compare it with `main.c`. If they differ, one of them is wrong; settle it as in step 6. Never copy `main.c`'s output into a test unchecked.
- Keep one behaviour per test. Two tests catching exactly the same survivors is one test too many.
- If the description doesn't decide the expected output, it isn't a test; it's an ambiguity to report.
- Stay within the grader's limits (`run-c.ts`) and the storage limits (`src/server/firestore/exercise-records.ts`).

Add them to `exercise.ts` next to the tests they're related to, in the file's style: a one-line comment saying the behaviour, an id from `openssl rand -hex 4`. Don't change, reorder or remove existing tests or their ids, since saved results are keyed by id; report weak or duplicate ones instead.

## 8. Verify

Run the probe once more with the same variants. Every wrong variant should now be caught or accounted for in step 6, and the reference section should have no `!!` beyond those you're reporting. Then:

```bash
npx nx run tcpl-exercises:test-exercises --skip-nx-cache
npx prettier --write apps/tcpl-exercises/src/server/exercises/<chapter>/<number>
```

## 9. Report

Lead with the result: how many wrong solutions passed before, and how many pass now. Then:

- each test added: its input, and in a few words the mistake it catches;
- wrong solutions no test can catch, and why;
- problems with `main.c`, the description (ambiguities, with suggested wording) or existing tests;
- if the user gave a solution: whether it's correct, and whether the tests would have caught what's wrong with it before and after.

Keep it short; the diff shows the rest. Don't commit.
