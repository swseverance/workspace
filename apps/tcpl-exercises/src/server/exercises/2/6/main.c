#include <stdio.h>
#define MAXLINE 1000 /* maximum input line size */

int getline(char line[], int maxline);
int getnums(char s[], unsigned v[], int max);
unsigned setbits(unsigned x, int p, int n, unsigned y);

/* print setbits(x,p,n,y) for each line of x, p, n and y */
int main() {
  char line[MAXLINE];
  unsigned v[4];

  while (getline(line, MAXLINE) > 0)
    if (getnums(line, v, 4) == 4)
      printf("%u\n", setbits(v[0], v[1], v[2], v[3]));

  return 0;
}

/* setbits: x with the n bits at position p set to the rightmost n bits of y */
unsigned setbits(unsigned x, int p, int n, unsigned y) {
  unsigned mask;

  mask = ~(~0U << n); /* n 1-bits at the right end */
  return (x & ~(mask << (p + 1 - n))) | ((y & mask) << (p + 1 - n));
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
