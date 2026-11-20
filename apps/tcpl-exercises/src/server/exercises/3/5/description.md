Write the function `itob(n,s,b)` that converts the integer `n` into a base `b` character representation in the string `s`. In particular, `itob(n,s,16)` formats `s` as a hexadecimal integer in `s`.

Use the digits `0` to `9` and then the lower case letters `a` to `z`, so `b` is from 2 to 36. Write a negative `n` as a minus sign followed by the digits of its magnitude. Each input line holds `n` and `b`, separated by a blank, with `n` fitting in an `int`. Print `s` on a line of its own.

Reading numbers takes `scanf`, which the book doesn't reach until Chapter 7, so here is a `main` to start from, with the book's `reverse`. `scanf` reads `n` and `b` and returns how many numbers it read, which stops the loop at the end of the input.

```c
#include <stdio.h>
#include <string.h>
#define MAXLEN 100 /* room for any number itob makes */

void itob(int n, char s[], int b);
void reverse(char s[]);

int main() {
  int n, b;
  char s[MAXLEN];

  while (scanf("%d %d", &n, &b) == 2) {
    itob(n, s, b);
    printf("%s\n", s);
  }

  return 0;
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
