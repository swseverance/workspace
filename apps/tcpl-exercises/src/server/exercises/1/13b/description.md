Write a program to print a histogram of the lengths of words in its input, with the bars vertical.

A word is any sequence of characters that does not contain a blank, tab or newline. Count words of 10 or more characters as length 10.

Each length from 1 to 10 has a column 3 characters wide. Print:

1. A row for each count from the tallest bar down to 1, with a `*` in the last position of a length's column if its bar reaches that row. Fill the rest with spaces, so that every row is 30 characters wide.
2. A line of 30 `-` characters.
3. The lengths, each printed with `printf("%3d", length)`.

For the input `I am the one`:

```
        *
  *  *  *
------------------------------
  1  2  3  4  5  6  7  8  9 10
```
