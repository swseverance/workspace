---
name: tcpl-exercise
description: Add every exercise in one chapter of K&R ("The C Programming Language") to the tcpl-exercises app - description, title, summary, reference solution and tests for each - and verify the solutions pass. Use when the user runs /tcpl-exercise with a chapter number such as 3.
argument-hint: <chapter number, e.g. 3> [notes about the chapter]
disable-model-invocation: true
---

# Add a chapter of K&R exercises

Arguments: `$ARGUMENTS`

The first word is the chapter number (e.g. `3`). Anything after it is notes from the user about the chapter or particular exercises. If the first word isn't a chapter number from 1 to 8, stop and ask for one.

App: `apps/tcpl-exercises`. Exercises live in `src/server/exercises/<chapter>/<number>/` and are registered in `src/server/exercises/index.ts`. Copy the shape of the existing ones.

## 1. Find the chapter's exercises

- The descriptions use the book's wording, so you need the book's text. Read it from `apps/tcpl-exercises/[Kernighan-Ritchie]The_C_Programming_Language.txt` (the book's extracted text, kept locally and gitignored, so it may be missing). If it's missing, ask the user to paste the chapter's exercises, and wait. Don't write them from memory: recalled wording is unreliable.
- Find every `Exercise <chapter>-<n>.` in the book. An exercise's text can wrap onto following lines, and often depends on the surrounding text (e.g. "the for loop above", "the function lower"), so read the context around each one too.
- If any exercise folders for the chapter already exist, list them and ask whether to replace them or skip them. Skip this if the user's notes already say.

## 2. Check the grader can test each one

Read `src/server/sandbox/run-c.ts` and `src/shared/output-diff.ts` to see what the grader currently supports (input, arguments, files, limits) and how it compares output. Don't rely on what you remember about them.

- If an exercise asks for a function rather than a program, make it a program: `main` reads input, calls the function, and prints the results.
- If the grader can't test an exercise (it needs something the grader doesn't support, or has no checkable output), skip it and create nothing for it. Carry on with the rest, and list the skipped ones with what's missing in the report.

Then do steps 3 to 7 for each exercise in order, one at a time.

## 3. Description

`description.md`:

1. The book's exercise text, as close to word for word as possible.
2. Then, only if the tests need it, the exact input and output format. Keep it to a line or two, or a short example. For example: "Print the three counts on one line, separated by spaces."

Keep it brief. Never mention the grader, the tests, the site, or how submissions are checked: those change, and the description would go out of date. No links.

## 4. Title and summary

In `exercise.ts`. They become the page's heading, `<title>` and meta description.

- `title`: short, in sentence case, with no exercise number, e.g. `Count blanks, tabs, and newlines`. Keep titles distinct within the chapter.
- `summary`: plain text, at most 160 characters. Say what the program does, then end with `K&R exercise <id>, solved and tested in your browser.`

## 5. Tests, written from the spec before the solution

Work out each expected output by hand from the description, before writing or running the solution. Tests built from the solution's output only prove it agrees with itself.

- **One test per distinct behaviour, typically 8 to 15.** List the behaviours first. Always cover the examples, empty input, and input without a final newline. Then cover the edge cases this exercise is about: tabs, consecutive blanks, blank lines, whitespace-only lines, EOF in the middle of a word or line. Never pad to reach a number.
- **One or two stress tests** where a larger input could expose a real C bug: buffer overflow, off-by-one, a signed `char` compared with `EOF`. Build their input and expected output with JS expressions in `exercise.ts` (e.g. `'x'.repeat(10_000) + '\n'`), or with a short independent script. Never generate them by running the solution.
- Keep every test within the grader's limits (see `run-c.ts`) and the storage limits (see `src/server/firestore/exercise-records.ts`).
- Each test id is 8 random lowercase hex digits (`openssl rand -hex 4`), unique across the app. When redoing an exercise, keep the ids of tests that still check the same thing, so saved results still line up.
- Omit `stdin` for a test with no input.

## 6. Reference solution

`main.c`: idiomatic C in the book's style, using only what the book has covered by the point where the exercise appears (e.g. no pointers in chapter 1). Match the existing solutions' formatting. It must compile without warnings.

## 7. Register it

Name the export `exercise<chapter>_<number>`, and import the description and solution with `with { type: 'text' }`. Add it to `EXERCISES` in `index.ts`, ordered by chapter and then number.

## 8. Verify

Once every exercise is added:

```bash
npx nx run-many -t test test-exercises -p tcpl-exercises --skip-nx-cache
npx prettier --write apps/tcpl-exercises/src/server/exercises
```

`exercises.spec.ts` compiles every solution and runs its tests. If one fails, decide from the description whether the test or the solution is wrong, and fix that one. Never copy actual output into `expectedStdout` without checking it.

## 9. Report

Briefly: the exercises added (id and title), the number of tests for each, any skipped and why, and any judgment calls where the book was ambiguous. Don't commit.
