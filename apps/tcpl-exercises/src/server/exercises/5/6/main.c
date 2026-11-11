#include <stdio.h>
#define MAXLINE 1000 /* maximum input line size */

int getline(char *s, int lim);
void reverse(char *s);

/* print each input line reversed */
int main() {
  int len;
  char line[MAXLINE + 2]; /* + newline and '\0' */

  while ((len = getline(line, MAXLINE + 2)) > 0) {
    if (line[len - 1] == '\n')
      line[len - 1] = '\0';
    reverse(line);
    printf("%s\n", line);
  }

  return 0;
}

/* getline: read a line into s, return length; pointer version */
int getline(char *s, int lim) {
  int c;
  char *start = s;

  while (--lim > 0 && (c = getchar()) != EOF && c != '\n')
    *s++ = c;
  if (c == '\n')
    *s++ = c;
  *s = '\0';
  return s - start;
}

/* reverse: reverse string s in place; pointer version */
void reverse(char *s) {
  char *t, c;

  for (t = s; *t; t++) /* find the end of s */
    ;
  while (t > s && s < --t) { /* swap the ends, moving inwards */
    c = *s;
    *s++ = *t;
    *t = c;
  }
}
