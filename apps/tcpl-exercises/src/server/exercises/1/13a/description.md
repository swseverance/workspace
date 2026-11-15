Write a program to print a histogram of the lengths of words in its input, with the bars horizontal.

A word is any sequence of characters that does not contain a blank, tab or newline. Count words of 10 or more characters as length 10.

Print a line for each length from 1 to 10: `printf("%2d |", length)`, then one `*` per word of that length.

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
