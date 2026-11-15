Write a program to remove trailing blanks and tabs from each line of input, and to delete entirely blank lines.

A line is entirely blank if nothing is left after removing its trailing blanks and tabs. Keep each line's newline, if it has one.

You can start from this, which has `getline` from Section 1.9. No input line is too long for it: each one, with its newline, fits in an array of `MAXLINE` characters.

```c
#include <stdio.h>
#define MAXLINE 1000 /* maximum input line length */

int getline(char line[], int maxline);

int main() {
  /* your code goes here */

  return 0;
}

/* getline: read a line into s, return length */
int getline(char s[], int lim) {
  int c, i;

  for (i = 0; i < lim - 1 && (c = getchar()) != EOF && c != '\n'; ++i)
    s[i] = c;
  if (c == '\n') {
    s[i] = c;
    ++i;
  }
  s[i] = '\0';
  return i;
}
```
