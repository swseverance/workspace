# Grading QA programs

Submissions that each produce a different grading outcome, for checking by
hand how the grader and the UI report it. They're written against exercise
1-8 (count blanks, tabs and newlines), so paste one into that exercise and
submit. Submits are rate limited to 5 per minute.

| File                          | What's wrong                                        | What the UI shows                                                                             |
| ----------------------------- | --------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `1-passes-with-stderr.c`      | Nothing; also writes a debug line to stderr         | All tests **Passed**, each with `debug: done reading` under stderr                            |
| `2-wrong-answer.c`            | Doesn't count tabs                                  | Tests with tabs **Failed**, the rest **Passed**                                               |
| `3-compile-error.c`           | Missing semicolon                                   | gcc's error on the Compilation Errors tab, every test **Failed**                              |
| `4-time-limit-exceeded.c`     | Loops until `'\0'`, which `getchar()` never returns | Every test **Time Limit Exceeded** (each test is stopped after 250ms)                         |
| `5-output-limit-exceeded.c`   | Same loop, printing as it goes                      | Every test **Output Limit Exceeded**, almost immediately                                      |
| `6-runtime-error-crash.c`     | Writes through a NULL pointer on spaces             | Inputs with spaces **Runtime Error** (segmentation fault); `"abc"` and empty input **Passed** |
| `7-runtime-error-exit-code.c` | Right output, but returns 1                         | Every test **Runtime Error** (exited with code 1)                                             |

Nothing compiles or runs these automatically.
