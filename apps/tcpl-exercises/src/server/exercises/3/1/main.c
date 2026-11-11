#include <stdio.h>
#define MAXLINE 1000 /* maximum input line size */
#define MAXN 1000    /* maximum number of elements in v */

int getline(char line[], int maxline);
int getints(char s[], int v[], int max);
int binsearch(int x, int v[], int n);

/* read n and v[0]...v[n-1], then search v for each remaining number */
int main() {
  char line[MAXLINE];
  int v[MAXN], x[1];
  int i, n;

  if (getline(line, MAXLINE) == 0 || getints(line, x, 1) == 0)
    return 0;
  n = x[0];
  for (i = 0; i < n && getline(line, MAXLINE) > 0; ++i)
    if (getints(line, x, 1) == 1)
      v[i] = x[0];

  while (getline(line, MAXLINE) > 0)
    if (getints(line, x, 1) == 1)
      printf("%d\n", binsearch(x[0], v, n));

  return 0;
}

/* binsearch: find x in v[0] <= v[1] <= ... <= v[n-1];
   one test inside the loop

   The loop narrows [low, high] to the first element >= x without
   checking for a match, so it always runs about log2(n) times; the
   book's version can stop early on a match, but makes two tests per
   pass. */
int binsearch(int x, int v[], int n) {
  int low, high, mid;

  low = 0;
  high = n - 1;
  while (low < high) {
    mid = (low + high) / 2;
    if (x <= v[mid])
      high = mid;
    else
      low = mid + 1;
  }
  if (n > 0 && v[low] == x)
    return low;
  return -1; /* no match */
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
