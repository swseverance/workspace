#include <stdio.h>
#define MAXLINE 1000 /* maximum input line size */

int getline(char line[], int maxline);
int getnums(char s[], unsigned v[], int max);
unsigned rightrot(unsigned x, int n);
int wordlength(void);

/* print rightrot(x,n) for each line of x and n */
int main() {
  char line[MAXLINE];
  unsigned v[2];

  while (getline(line, MAXLINE) > 0)
    if (getnums(line, v, 2) == 2)
      printf("%u\n", rightrot(v[0], v[1]));

  return 0;
}

/* rightrot: rotate x to the right by n positions */
unsigned rightrot(unsigned x, int n) {
  int w;
  unsigned rbit;

  w = wordlength();
  n = n % w; /* rotating by w positions changes nothing */
  for (; n > 0; n--) {
    rbit = (x & 1) << (w - 1); /* the bit moving round to the left end */
    x = (x >> 1) | rbit;
  }
  return x;
}

/* wordlength: the number of bits in an unsigned */
int wordlength(void) {
  int i;
  unsigned v;

  v = ~0U;
  for (i = 1; (v = v >> 1) > 0; i++)
    ;
  return i;
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
