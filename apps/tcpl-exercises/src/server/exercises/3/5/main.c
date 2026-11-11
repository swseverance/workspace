#include <stdio.h>
#include <string.h>
#define MAXLINE 1000 /* maximum input line size */

int getline(char line[], int maxline);
int getints(char s[], int v[], int max);
void itob(int n, char s[], int b);
void reverse(char s[]);

/* print each input number n in base b */
int main() {
  char line[MAXLINE], s[MAXLINE];
  int v[2];

  while (getline(line, MAXLINE) > 0)
    if (getints(line, v, 2) == 2) {
      itob(v[0], s, v[1]);
      printf("%s\n", s);
    }

  return 0;
}

/* itob: convert n to characters in s, in base b (2 to 36)

   Like itoa in exercise 3-4, n is never negated, so the largest
   negative number works too. */
void itob(int n, char s[], int b) {
  int i, sign, d;

  sign = n;
  i = 0;
  do { /* generate digits in reverse order */
    d = n % b;
    if (d < 0)
      d = -d;
    s[i++] = (d < 10) ? d + '0' : d - 10 + 'a';
  } while ((n /= b) != 0);
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
