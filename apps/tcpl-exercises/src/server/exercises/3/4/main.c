#include <stdio.h>
#include <string.h>
#define MAXLEN 100 /* room for any number itoa makes */

void itoa(int n, char s[]);
void reverse(char s[]);

/* convert each input number back to a string with itoa */
int main() {
  int n;
  char s[MAXLEN];

  while (scanf("%d", &n) == 1) {
    itoa(n, s);
    printf("%s\n", s);
  }

  return 0;
}

/* itoa: convert n to characters in s; handles the largest negative number

   In two's complement the largest negative number, -2^(wordsize-1),
   has no positive counterpart: the largest positive int is
   2^(wordsize-1) - 1. So the book's n = -n overflows and leaves n
   negative, n % 10 + '0' is not a digit, and the loop stops after one
   pass. This version never negates n. Instead it takes each digit from
   the magnitude of n % 10, which (since C99) has the sign of n, and
   divides n by 10 until it reaches 0. */
void itoa(int n, char s[]) {
  int i, sign, d;

  sign = n;
  i = 0;
  do { /* generate digits in reverse order */
    d = n % 10;
    s[i++] = (d < 0 ? -d : d) + '0';
  } while ((n /= 10) != 0);
  if (sign < 0)
    s[i++] = '-';
  s[i] = '\0';
  reverse(s);
}

/* reverse: reverse string s in place */
void reverse(char s[]) {
  int c, i, j;

  for (i = 0, j = strlen(s) - 1; i < j; i++, j--) {
    c = s[i];
    s[i] = s[j];
    s[j] = c;
  }
}
