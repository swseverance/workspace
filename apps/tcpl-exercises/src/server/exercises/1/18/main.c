#include <stdio.h>
#define MAXLINE 1000 /* maximum input line size */

int getline(char line[], int maxline);

/* remove trailing blanks and tabs, and delete blank lines */
int main() {
  int len, i, newline;
  char line[MAXLINE];

  while ((len = getline(line, MAXLINE)) > 0) {
    i = len - 1;
    newline = 0;
    if (line[i] == '\n') {
      newline = 1;
      --i;
    }
    while (i >= 0 && (line[i] == ' ' || line[i] == '\t'))
      --i;
    if (i >= 0) { /* not a blank line */
      ++i;
      if (newline) {
        line[i] = '\n';
        ++i;
      }
      line[i] = '\0';
      printf("%s", line);
    }
  }

  return 0;
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
