#include <stdio.h>
#define MAXLINE 500 /* maximum input line size */

int getline(char line[], int maxline);
void unescape(char s[], char t[]);

/* print each input line with its escape sequences turned into real
   characters */
int main() {
  int len;
  char t[MAXLINE + 2], s[MAXLINE + 1]; /* t: + newline and '\0' */

  while ((len = getline(t, MAXLINE + 2)) > 0) {
    if (t[len - 1] == '\n')
      t[len - 1] = '\0';
    unescape(s, t);
    printf("%s\n", s);
  }

  return 0;
}

/* unescape: copy t to s, turning \n, \t and \\ into real characters */
void unescape(char s[], char t[]) {
  int i, j;

  for (i = j = 0; t[i] != '\0'; ++i)
    if (t[i] != '\\')
      s[j++] = t[i];
    else
      switch (t[i + 1]) {
      case 'n':
        s[j++] = '\n';
        ++i;
        break;
      case 't':
        s[j++] = '\t';
        ++i;
        break;
      case '\\':
        s[j++] = '\\';
        ++i;
        break;
      default: /* not an escape sequence: copy the backslash */
        s[j++] = '\\';
        break;
      }
  s[j] = '\0';
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
