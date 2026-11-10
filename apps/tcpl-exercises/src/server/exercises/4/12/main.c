#include <stdio.h>
#define MAXLINE 1000 /* maximum input line size */

int getline(char line[], int max);
int getints(char s[], int v[], int max);
void itoa(int n, char s[]);
int putdigits(int n, char s[], int i);

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

/* itoa: convert n to characters in s; recursive */
void itoa(int n, char s[]) {
  int i;

  i = 0;
  if (n < 0)
    s[i++] = '-';
  i = putdigits(n, s, i);
  s[i] = '\0';
}

/* putdigits: put the decimal digits of n into s, starting at s[i];
   return the index after the last one

   Like printd, it handles the leading digits first by recursion. It
   takes each digit from the magnitude of n % 10 rather than negating
   n, so the largest negative number works too. */
int putdigits(int n, char s[], int i) {
  int d;

  if (n / 10)
    i = putdigits(n / 10, s, i);
  d = n % 10;
  s[i++] = (d < 0 ? -d : d) + '0';
  return i;
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
