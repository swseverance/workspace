#include <stdio.h>
#define MAXLINE 1000 /* maximum input line size */

int getline(char line[], int maxline);
int htoi(char s[]);
int hexdigit(int c);

/* print the value of each line of hexadecimal digits */
int main() {
  int len;
  char line[MAXLINE];

  while ((len = getline(line, MAXLINE)) > 0) {
    if (line[len - 1] == '\n')
      line[len - 1] = '\0';
    printf("%d\n", htoi(line));
  }

  return 0;
}

/* htoi: convert a string of hexadecimal digits to an integer */
int htoi(char s[]) {
  int i, n, d;

  i = 0;
  if (s[0] == '0' && (s[1] == 'x' || s[1] == 'X'))
    i = 2;
  n = 0;
  for (; (d = hexdigit(s[i])) >= 0; ++i)
    n = 16 * n + d;
  return n;
}

/* hexdigit: return the value of hexadecimal digit c, or -1 */
int hexdigit(int c) {
  if (c >= '0' && c <= '9')
    return c - '0';
  else if (c >= 'a' && c <= 'f')
    return c - 'a' + 10;
  else if (c >= 'A' && c <= 'F')
    return c - 'A' + 10;
  else
    return -1;
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
