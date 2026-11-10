#include <stdio.h>
#define MAXLINE 1000 /* maximum input line size */
#define LIMIT 80     /* print lines longer than this */

int getline(char line[], int maxline);

/* print input lines longer than LIMIT characters */
int main() {
  int len, chars;
  char line[MAXLINE];

  while ((len = getline(line, MAXLINE)) > 0) {
    chars = len;
    if (line[len - 1] == '\n')
      --chars;
    if (chars > LIMIT)
      printf("%s", line);
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
