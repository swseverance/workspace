#include <stdio.h>
#define MAXLINE 1000 /* maximum input line size */

int getline(char *s, int lim);
void chop(char *s, int len);
char *strcat(char *s, const char *t);

/* for each pair of lines s and t, print s with t added to the end */
int main() {
  int len;
  char s[2 * MAXLINE + 1], t[MAXLINE + 2]; /* s has room for t too */

  while ((len = getline(s, MAXLINE + 2)) > 0) {
    chop(s, len);
    len = getline(t, MAXLINE + 2);
    chop(t, len);
    strcat(s, t);
    printf("%s\n", s);
  }

  return 0;
}

/* strcat: concatenate t to end of s; s must be big enough; pointer version

   Declared as in <string.h> (returning s, with t const) so it matches
   the compiler's built-in strcat. */
char *strcat(char *s, const char *t) {
  char *start = s;

  while (*s) /* find end of s */
    s++;
  while ((*s++ = *t++)) /* copy t */
    ;
  return start;
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
