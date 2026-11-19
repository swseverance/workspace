Write a function `unescape(s,t)` that converts visible escape sequences like `\n` and `\t` into the real characters as it copies the string `t` to `s`: the other direction of `escape` in exercise 3-2a. Use a `switch`.

Convert `\n`, `\t` and `\\` to newline, tab and backslash, and copy every other character unchanged, including a backslash that doesn't start one of these sequences. Each input line, at most 500 characters, holds `t` without its newline. Print `s` followed by a newline.

For the input line `one\ntwo\\`, print:

```
one
two\
```
