Write a program `entab` that replaces strings of blanks (spaces) by the minimum number of tabs and blanks to achieve the same spacing. Use the same tab stops as for `detab`.

Put a tab stop every 8 columns, as in `detab`: the tab stops are at columns 0, 8, 16, 24 and so on, and every line starts again at column 0. The output must print exactly as the input does, with every character in the same column, but with as few tabs and blanks as possible.

Blanks that run up to a tab stop become a tab, except that a single blank stays a blank. Blanks that stop short of a tab stop stay as they are. A tab in the input is copied, and any blanks just before it that stop short of a tab stop are dropped, because the tab covers them. A tab in the input also moves the column to the next tab stop, which changes where the blanks after it end.

For example, with `\t` standing for a tab and `·` for a blank:

- `ab······x` becomes `ab\tx`: the 6 blanks run from column 2 up to the tab stop at column 8.
- `abc········x` becomes `abc\t···x`: the first 5 blanks reach column 8 and become a tab, and the 3 after them reach no tab stop.
- `abcdefg·x` stays as it is: a single blank reaches column 8.
- `ab··x` stays as it is: the blanks reach no tab stop.
- `ab··\tx` becomes `ab\tx`: the tab runs to column 8 with or without the 2 blanks before it.
- `a\t········b` becomes `a\t\tb`: the tab runs to column 8, so the 8 blanks run from column 8 to column 16.

Each of those lines prints the same before and after. Here they are under a ruler that marks the tab stops:

```
0       8       16      24
|       |       |       |
ab      x
abc        x
abcdefg x
ab  x
ab      x
a               b
```
