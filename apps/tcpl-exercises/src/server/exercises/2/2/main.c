#include <stdio.h>
#define MAXLINE 1000 /* maximum input line size */

int getline(char line[], int maxline);

/* print each input line after its length */
int main() {
  int len;
  char line[MAXLINE];

  while ((len = getline(line, MAXLINE)) > 0) {
    printf("%d: %s", len, line);
    if (line[len - 1] != '\n')
      putchar('\n');
  }
  return 0;
}

/* getline: read a line into s, return length; without && or || */
int getline(char s[], int lim) {
  int c, i, more;

  c = 0;
  i = 0;
  more = 1;
  while (more) {
    if (i >= lim - 1) /* no room: don't read another character */
      more = 0;
    else if ((c = getchar()) == '\n')
      more = 0;
    else if (c == EOF)
      more = 0;
    else {
      s[i] = c;
      ++i;
    }
  }

  if (c == '\n') {
    s[i] = c;
    ++i;
  }
  s[i] = '\0';
  return i;
}
