---
name: tcpl-exercise
description: Add one K&R ("The C Programming Language") exercise to the tcpl-exercises app - description, title, summary, reference solution and tests - and verify the solution passes. Use when the user runs /tcpl-exercise with an exercise number such as 1-12.
argument-hint: <exercise id, e.g. 1-12> [the exercise text from the book]
disable-model-invocation: true
---

# Add a K&R exercise

Arguments: `$ARGUMENTS`

The first word is the exercise id (`<chapter>-<number>`, e.g. `1-12`). Anything after it is the exercise's text from the book.

App: `apps/tcpl-exercises`. Exercises live in `src/server/exercises/<chapter>/<number>/` and are registered in `src/server/exercises/index.ts`. Look at `1/8/` (a stdin/stdout program) and `33/1/` (a fuller description) for the shape of the files.

## 1. Check the inputs

- If `src/server/exercises/<chapter>/<number>/` already exists, stop and ask whether to replace it.
- If no exercise text was given, ask the user to paste it from their copy of the book, and wait. Don't write the exercise from memory: recalled wording is unreliable. Only go ahead without the text if the user says so.

## 2. Check the grader can test it

The grader (`src/server/sandbox/run-c.ts`) compiles one `main.c` with `gcc -Wall`, runs it once per test with that test's stdin, and compares stdout, ignoring trailing whitespace at the very end. Each run gets 250 ms and 64 KB of output. There are no command-line arguments, no input files, and no hidden test code.

- **A program that reads stdin and writes stdout:** fine.
- **"Write a function"** (e.g. `htoi`, `squeeze`, `strrindex`): make it a program. `main` reads input from stdin, calls the function, and prints the results. Specify that input and output format exactly in the description.
- **Needs command-line arguments or files, or has no checkable output** (an experiment like 1-1, or results that depend on the machine like 2-1): stop. Tell the user what the grader would need, and don't create anything.

## 3. Write the description, in our own words

Create `description.md`. **Never copy the book's wording**: it's copyrighted, and the site is public. Restate the task in your own words, then add what the book leaves out, because the tests compare output exactly:

- An opening paragraph saying what to write.
- `### Requirements`: the exact input and output format, and every edge case the tests cover (empty input, no newline at the end, tabs, long lines, and so on).
- `### Examples`: a table or code block of input and output.
- Optionally, a short `### Hints` section.

Don't mention test ids or the reference solution.

## 4. Title and summary

These go in `exercise.ts` and become the page's heading, `<title>` and meta description.

- `title`: short, sentence case, under about 40 characters, e.g. `Count blanks, tabs, and newlines`. No exercise number, since the page adds it.
- `summary`: plain text, at most 160 characters. Say what the program does, then end with `K&R exercise <id>, solved and tested in your browser.`

## 5. Write the tests from the spec, before the solution

Work out each expected output by hand from the requirements, _before_ writing or running the solution. Tests derived from the solution's own output only prove it agrees with itself.

**One test per distinct behaviour, typically 8 to 15.** List the behaviours first, then write a test for each. Near-duplicates don't catch anything new, and each one is another output to get right by hand.

- Always cover: the examples from the description, empty input, and input with no newline at the end.
- Then the edge cases this exercise is about. For text processing, think about tabs, consecutive blanks, blank lines, a line that's only whitespace, and EOF in the middle of a word or line.
- Go past 15 only when the exercise really has more cases, e.g. 1-23 (removing comments, with strings and character constants) or 4-3 (the calculator). Never pad to reach a number. The hard cap is 50, since every test's output is saved in one Firestore document.

**Add one or two stress tests** where a bigger input could expose a real C bug: a fixed-size buffer overflowing, an off-by-one error, a signed `char` compared with `EOF`, a counter overflowing. For example, a 10,000-character line, or 1,000 lines.

- Build the input and expected output with JS expressions in `exercise.ts` (e.g. `'x'.repeat(10_000) + '\n'`), so they come from the spec rather than the solution.
- If the expected output can't be written as a simple expression, compute it with a short independent script (Python or Node), never by running the C solution.
- Keep the input under about 20 KB, since the test panel displays it. Keep the expected output under 8 KB, because longer output is truncated when it's saved.

**For every test:**

- The id is 8 random lowercase hex digits (`openssl rand -hex 4`), unique within the exercise.
- It must run well under 250 ms, the grader's limit.
- Omit `stdin` for a test that gets no input.

## 6. Write the reference solution

`main.c`:

- Idiomatic, readable C in the book's style, using only what the book has covered by that chapter. For example, no pointers in chapter 1. Use `int main()`, 2-space indents, and `return 0;`, as in the existing solutions.
- It must compile with `gcc -Wall` with no warnings.

## 7. Add the files

- `exercise.ts`: follow `1/8/exercise.ts`. Name the export `exercise<chapter>_<number>`, and import the description and solution with `with { type: 'text' }`.
- `index.ts`: import it and add it to `EXERCISES`, ordered by chapter and then number. The sitemap and sidebar pick it up from there.

## 8. Verify

Run the app's tests:

```bash
npx nx run tcpl-exercises:test --skip-nx-cache
```

`src/server/exercises/exercises.spec.ts` compiles every solution and runs its tests. It fails on compiler warnings, bad test ids, or a missing title or summary, or one over 160 characters.

If a test fails, decide from the requirements whether the test or the solution is wrong, and fix that one. Never paste the actual output into `expectedStdout` without checking it against the spec.

Then format the new files: `npx prettier --write apps/tcpl-exercises/src/server/exercises`.

## 9. Report

Tell the user, briefly:

- Which files were added.
- Each test, in a word or two (e.g. "empty input", "tabs only", "stress: 10,000-character line").
- Any judgment calls, where the book was ambiguous and you picked an interpretation.

Don't commit.
