Write a program `detab` that replaces tabs in the input with the proper number of blanks to space to the next tab stop. Assume a fixed set of tab stops, say every n columns. Should n be a variable or a symbolic parameter?

Put a tab stop every 8 columns. Number the columns of a line from 0: the tab stops are at columns 0, 8, 16, 24 and so on, and every line starts again at column 0. Every character other than a tab takes one column.

Replace a tab with the blanks that reach the next tab stop after it. That's between 1 and 8 blanks: a tab already at a tab stop moves on to the one after. A line has no last column, so a tab at the end of a line gets its blanks like any other.

For example, with `\t` standing for a tab:

- `ab\tx`: the tab is at column 2, so it becomes 6 blanks and `x` is at column 8.
- `abcdefg\tx`: the tab is at column 7, so it becomes 1 blank and `x` is at column 8.
- `abcdefgh\tx`: the tab is at column 8, so it becomes 8 blanks and `x` is at column 16.
- `abcdefghij\tx`: the tab is at column 10, so it becomes 6 blanks and `x` is at column 16.

Those four lines of output, under a ruler that marks the tab stops:

```
0       8       16      24
|       |       |       |
ab      x
abcdefg x
abcdefgh        x
abcdefghij      x
```
