In a two's complement number representation, our version of `itoa` does not handle the largest negative number, that is, the value of `n` equal to -(2<sup>wordsize-1</sup>). Explain why not. Modify it to print that value correctly, regardless of the machine on which it runs.

Each input line holds an integer that fits in an `int`. Print the string `itoa` makes from it on a line of its own.

Reading numbers takes `scanf`, which the book doesn't reach until Chapter 7, so here is a `main` to start from, with the book's `itoa` and `reverse`. `scanf` reads a number and returns how many it read, which stops the loop at the end of the input.

```c
#include <stdio.h>
#include <string.h>
#define MAXLEN 100 /* room for any number itoa makes */

void itoa(int n, char s[]);
void reverse(char s[]);

int main() {
  int n;
  char s[MAXLEN];

  while (scanf("%d", &n) == 1) {
    itoa(n, s);
    printf("%s\n", s);
  }

  return 0;
}

/* itoa:  convert n to characters in s */
void itoa(int n, char s[])
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
