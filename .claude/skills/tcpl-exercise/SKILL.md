---
name: tcpl-exercise
description: Add one K&R ("The C Programming Language") exercise to the tcpl-exercises app - description, title, summary, reference solution and tests - and verify the solution passes. Use when the user runs /tcpl-exercise with an exercise number such as 1-12.
argument-hint: <exercise id, e.g. 1-12> [the exercise text from the book]
disable-model-invocation: true
---

# Add a K&R exercise

Arguments: `$ARGUMENTS`

The first word is the exercise id (`<chapter>-<number>`, e.g. `1-12`). Anything after it is the exercise's text from the book, or notes from the user about it.

App: `apps/tcpl-exercises`. Exercises live in `src/server/exercises/<chapter>/<number>/` and are registered in `src/server/exercises/index.ts`. Copy the shape of the existing ones.

## 1. Check the inputs

- If the exercise's folder already exists, stop and ask whether to replace it. Skip this if the user's notes make clear they want it redone.
- The description uses the book's wording, so you need the book's text. If it isn't in the arguments, look in `apps/tcpl-exercises/[Kernighan-Ritchie]The_C_Programming_Language.txt` (the book's extracted text, kept locally and gitignored, so it may be missing). If it isn't there either, ask the user to paste it, and wait. Don't write it from memory: recalled wording is unreliable.

## 2. Check the grader can test it

Read `src/server/sandbox/run-c.ts` and `src/shared/output-diff.ts` to see what the grader currently supports (input, arguments, files, limits) and how it compares output. Don't rely on what you remember about them.

- If the exercise asks for a function rather than a program, make it a program: `main` reads input, calls the function, and prints the results.
- If the grader can't test the exercise (it needs something the grader doesn't support, or has no checkable output), stop. Tell the user what's missing, and create nothing.

## 3. Description

`description.md`:

1. The book's exercise text, as close to word for word as possible.
2. Then, only if the tests need it, the exact input and output format. Keep it to a line or two, or a short example. For example: "Print the three counts on one line, separated by spaces."

Keep it brief. Never mention the grader, the tests, the site, or how submissions are checked: those change, and the description would go out of date. No links.

## 4. Title and summary

In `exercise.ts`. They become the page's heading, `<title>` and meta description.

- `title`: short, in sentence case, with no exercise number, e.g. `Count blanks, tabs, and newlines`.
- `summary`: plain text, at most 160 characters. Say what the program does, then end with `K&R exercise <id>, solved and tested in your browser.`

## 5. Tests, written from the spec before the solution

Work out each expected output by hand from the description, before writing or running the solution. Tests built from the solution's output only prove it agrees with itself.

- **One test per distinct behaviour, typically 8 to 15.** List the behaviours first. Always cover the examples, empty input, and input without a final newline. Then cover the edge cases this exercise is about: tabs, consecutive blanks, blank lines, whitespace-only lines, EOF in the middle of a word or line. Never pad to reach a number.
- **One or two stress tests** where a larger input could expose a real C bug: buffer overflow, off-by-one, a signed `char` compared with `EOF`. Build their input and expected output with JS expressions in `exercise.ts` (e.g. `'x'.repeat(10_000) + '\n'`), or with a short independent script. Never generate them by running the solution.
- Keep every test within the grader's limits (see `run-c.ts`) and the storage limits (see `src/server/firestore/exercise-records.ts`).
- Each test id is 8 random lowercase hex digits (`openssl rand -hex 4`). When redoing an exercise, keep the ids of tests that still check the same thing, so saved results still line up.
- Omit `stdin` for a test with no input.

## 6. Reference solution

`main.c`: idiomatic C in the book's style, using only what the book has covered by that chapter (e.g. no pointers in chapter 1). Match the existing solutions' formatting. It must compile without warnings.

## 7. Register it

Name the export `exercise<chapter>_<number>`, and import the description and solution with `with { type: 'text' }`. Add it to `EXERCISES` in `index.ts`, ordered by chapter and then number.

## 8. Verify

```bash
npx nx run tcpl-exercises:test --skip-nx-cache
npx prettier --write apps/tcpl-exercises/src/server/exercises
```

`exercises.spec.ts` compiles every solution and runs its tests. If one fails, decide from the description whether the test or the solution is wrong, and fix that one. Never copy actual output into `expectedStdout` without checking it.

## 9. Report

Briefly: the files added, each test in a few words, and any judgment calls where the book was ambiguous. Don't commit.
