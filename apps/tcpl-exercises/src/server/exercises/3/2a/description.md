Write a function `escape(s,t)` that converts characters like newline and tab into visible escape sequences like `\n` and `\t` as it copies the string `t` to `s`. Use a `switch`.

Convert newline, tab and backslash to `\n`, `\t` and `\\`, and copy every other character unchanged. Each input line is at most 500 characters, not counting its newline. Read it into `t` with its newline, as the book's `getline` does, and print `s` followed by a newline.

For an input line holding `a`, a tab, `b` and a newline, print:

```
a\tb\n
```

Exercise 3-2b is the other direction.
