Write a function `reverse(s)` that reverses the character string `s`. Use it to write a program that reverses its input a line at a time.

Keep each line's newline at the end, if it has one.

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
