Write the function `any(s1,s2)`, which returns the first location in a string `s1` where any character from the string `s2` occurs, or `-1` if `s1` contains no characters from `s2`. (The standard library function `strpbrk` does the same job but returns a pointer to the location.)

The input is **pairs of lines**: the first line of each pair is `s1` and the second is `s2`. The newline that ends a line isn't part of the string, so remove it if it's there. For each pair, print `any(s1,s2)` on a line of its own.

**No line is longer than 500 characters.**
