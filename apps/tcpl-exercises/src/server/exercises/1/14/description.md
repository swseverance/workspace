Write a program to print a histogram of the frequencies of different characters in its input.

Draw the bars horizontally: a line for each character that appears, in order of character code, printed with `printf("%3d |", c)` followed by one `*` per occurrence. The input contains only ASCII characters (codes 0 to 127).

For the input `abba` followed by a newline:

```
 10 |*
 97 |**
 98 |**
```
