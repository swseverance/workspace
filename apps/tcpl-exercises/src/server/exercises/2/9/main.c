#include <stdio.h>
#define MAXLINE 1000 /* maximum input line size */

int getline(char line[], int maxline);
int getnums(char s[], unsigned v[], int max);
int bitcount(unsigned x);

/* print the number of 1-bits in each input number */
int main() {
  char line[MAXLINE];
  unsigned v[1];

  while (getline(line, MAXLINE) > 0)
    if (getnums(line, v, 1) == 1)
      printf("%d\n", bitcount(v[0]));

  return 0;
}

/* bitcount: count 1 bits in x, faster version

   x-1 turns the rightmost 1-bit of x into 0 and the 0-bits to its
   right into 1s, leaving the bits to its left alone. So x & (x-1)
   is x with its rightmost 1-bit cleared, and the loop runs once
   per 1-bit rather than once per bit position. */
int bitcount(unsigned x) {
  int b;

  for (b = 0; x != 0; x &= x - 1)
    b++;
  return b;
}

/* getnums: convert up to max decimal numbers in s into v; return how many */
int getnums(char s[], unsigned v[], int max) {
  int i, n;

  i = n = 0;
  while (n < max && s[i] != '\0') {
    if (s[i] >= '0' && s[i] <= '9') {
      v[n] = 0;
      while (s[i] >= '0' && s[i] <= '9')
        v[n] = 10 * v[n] + (s[i++] - '0');
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
