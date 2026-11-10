#include <stdio.h>
#define MAXLINE 1000 /* maximum input line size */

/* swap: interchange x and y, which have type t; the block gives _z a
   scope of its own */
#define swap(t, x, y) \
  {                   \
    t _z;             \
    _z = x;           \
    x = y;            \
    y = _z;           \
  }

int getline(char line[], int max);
int getints(char s[], int v[], int max);

/* swap the two numbers on each input line */
int main() {
  char line[MAXLINE];
  int v[2], x, y;

  while (getline(line, MAXLINE) > 0)
    if (getints(line, v, 2) == 2) {
      x = v[0];
      y = v[1];
      swap(int, x, y);
      printf("%d %d\n", x, y);
    }

  return 0;
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

/* getline: get line into s, return length */
int getline(char s[], int lim) {
  int c, i;

  i = 0;
  while (--lim > 0 && (c = getchar()) != EOF && c != '\n')
    s[i++] = c;
  if (c == '\n')
    s[i++] = c;
  s[i] = '\0';
  return i;
}
