#include <stdio.h>
#define MAXLINE 1000 /* maximum input line size */

int getline(char line[], int maxline);
int getnums(char s[], unsigned v[], int max);
unsigned invert(unsigned x, int p, int n);

/* print invert(x,p,n) for each line of x, p and n */
int main() {
  char line[MAXLINE];
  unsigned v[3];

  while (getline(line, MAXLINE) > 0)
    if (getnums(line, v, 3) == 3)
      printf("%u\n", invert(v[0], v[1], v[2]));

  return 0;
}

/* invert: x with the n bits at position p inverted */
unsigned invert(unsigned x, int p, int n) {
  return x ^ (~(~0U << n) << (p + 1 - n));
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
