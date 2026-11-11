#include <stdio.h>
#include <string.h>
#define MAXLINE 1000 /* maximum input line size */

int getline(char line[], int maxline);
int getints(char s[], int v[], int max);
void itoa(int n, char s[]);
void reverse(char s[]);

/* convert each input number back to a string with itoa */
int main() {
  char line[MAXLINE], s[MAXLINE];
  int v[1];

  while (getline(line, MAXLINE) > 0)
    if (getints(line, v, 1) == 1) {
      itoa(v[0], s);
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

/* getints: convert up to max integers in s into v; return how many */
int getints(char s[], int v[], int max) {
  int i, n, sign;

  i = n = 0;
  while (n < max && s[i] != '\0') {
    if (s[i] == '-' || (s[i] >= '0' && s[i] <= '9')) {
      sign = (s[i] == '-') ? -1 : 1;
      if (s[i] == '-')
        ++i;
      /* build the value as a negative number, which can hold INT_MIN */
      for (v[n] = 0; s[i] >= '0' && s[i] <= '9'; ++i)
        v[n] = 10 * v[n] - (s[i] - '0');
      if (sign > 0)
        v[n] = -v[n];
      ++n;
    } else
      ++i;
  }
  return n;
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
