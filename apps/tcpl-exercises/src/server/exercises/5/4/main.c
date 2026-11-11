#include <stdio.h>
#define MAXLINE 1000 /* maximum input line size */

int getline(char *s, int lim);
void chop(char *s, int len);
int strend(char *s, char *t);

/* for each pair of lines s and t, print whether s ends with t */
int main() {
  int len;
  char s[MAXLINE + 2], t[MAXLINE + 2]; /* + newline and '\0' */

  while ((len = getline(s, MAXLINE + 2)) > 0) {
    chop(s, len);
    len = getline(t, MAXLINE + 2);
    chop(t, len);
    printf("%d\n", strend(s, t));
  }

  return 0;
}

/* strend: return 1 if t occurs at the end of s, 0 otherwise */
int strend(char *s, char *t) {
  char *bs = s, *bt = t;

  while (*s) /* find the ends of s and t */
    s++;
  while (*t)
    t++;
  for (; *s == *t; s--, t--) /* compare backwards */
    if (t == bt)
      return 1; /* all of t matched */
    else if (s == bs)
      return 0; /* s ran out first */
  return 0;
}

/* getline: read a line into s, return length */
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

/* chop: remove the newline from the end of s, which has length len */
void chop(char *s, int len) {
  if (len > 0 && s[len - 1] == '\n')
    s[len - 1] = '\0';
}
