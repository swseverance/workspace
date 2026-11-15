Write a program to print a histogram of the lengths of words in its input. It is easy to draw the histogram with the bars horizontal; a vertical orientation is more challenging.

The first character of the input is `0` for a horizontal histogram or `1` for a vertical one; the rest is the text. A word is any sequence of characters that does not contain a blank, tab or newline. Count words of 10 or more characters as length 10.

- **Horizontal:** a line for each length from 1 to 10: `printf("%2d |", length)`, then one `*` per word.
- **Vertical:** a row for each count from the tallest bar down to 1, then the lengths 1 to 10, each printed with `printf("%3d", length)`. Each length's column is 3 characters wide, with a `*` in its last position if the bar reaches that row. Don't end a row with spaces.

For the input `I am the one`:

```
 1 |*
 2 |*
 3 |**
 4 |
 5 |
 6 |
 7 |
 8 |
 9 |
10 |
```

```
        *
  *  *  *
  1  2  3  4  5  6  7  8  9 10
```
