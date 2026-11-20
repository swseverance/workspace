Write a version of `itoa` that accepts three arguments instead of two. The third argument is a minimum field width; the converted number must be padded with blanks on the left if necessary to make it wide enough.

Each input line holds an integer `n`, which fits in an `int`, and a width `w` from 0 to 100, separated by a blank. Print the string `itoa(n,s,w)` makes on a line of its own. A minus sign counts towards the width.

Reading numbers takes `scanf`, which the book doesn't reach until Chapter 7, so here is a `main` to start from, with the book's `reverse` and its `itoa`, which has been given `w` but does nothing with it yet. `scanf` reads `n` and `w` and returns how many numbers it read, which stops the loop at the end of the input.

```c
#include <stdio.h>
#include <string.h>
#define MAXLEN 200 /* room for the widest field */

void itoa(int n, char s[], int w);
void reverse(char s[]);

int main() {
  int n, w;
  char s[MAXLEN];

  while (scanf("%d %d", &n, &w) == 2) {
    itoa(n, s, w);
    printf("%s\n", s);
  }

  return 0;
}

/* itoa:  convert n to characters in s */
void itoa(int n, char s[], int w)
{
    int i, sign;

    if ((sign = n) < 0)  /* record sign */
        n = -n;          /* make n positive */
    i = 0;
    do {      /* generate digits in reverse order */
        s[i++] = n % 10 + '0';  /* get next digit */
    } while ((n /= 10) > 0);    /* delete it */
    if (sign < 0)
        s[i++] = '-';
    s[i] = '\0';
    reverse(s);
}

/* reverse:  reverse string s in place */
void reverse(char s[])
{
    int c, i, j;

    for (i = 0, j = strlen(s)-1; i < j; i++, j--) {
        c = s[i];
        s[i] = s[j];
        s[j] = c;
    }
}
```
