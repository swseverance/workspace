Write versions of the library functions `strncpy`, `strncat`, and `strncmp`, which operate on at most the first `n` characters of their argument strings. For example, `strncpy(s,t,n)` copies at most `n` characters of `t` to `s`. Full descriptions are in Appendix B.

As in Appendix B: `strncpy` pads `s` with `'\0'`s if `t` has fewer than `n` characters, and adds no `'\0'` otherwise; `strncat` appends at most `n` characters of `t` and ends `s` with `'\0'`; `strncmp` compares at most `n` characters.

The input is groups of three lines: `s` and `t`, at most 1000 characters each, and `n`, from 0 to 1000. For each group, print three lines: `s` after `strncpy(s,t,n)`; `s` after `strncat(s,t,n)`; and the sign of `strncmp(s,t,n)` as -1, 0 or 1. Each call starts from the `s` that was read, followed by `'\0'`s.
