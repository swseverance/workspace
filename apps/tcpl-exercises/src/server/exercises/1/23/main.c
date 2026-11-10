#include <stdio.h>

#define CODE 0
#define COMMENT 1
#define STRING 2
#define CHAR 3

/* remove comments from a C program */
int main() {
  int c, d, state;

  state = CODE;
  c = getchar();
  while (c != EOF) {
    if (state == CODE) {
      if (c == '/') {
        d = getchar();
        if (d == '*') {
          state = COMMENT;
          c = getchar();
        } else {
          putchar(c);
          c = d; /* look at d again */
        }
      } else {
        putchar(c);
        if (c == '"')
          state = STRING;
        else if (c == '\'')
          state = CHAR;
        c = getchar();
      }
    } else if (state == COMMENT) {
      if (c == '*') {
        d = getchar();
        if (d == '/') {
          state = CODE;
          c = getchar();
        } else
          c = d; /* look at d again: it may be another '*' */
      } else
        c = getchar();
    } else { /* inside a string or character constant */
      putchar(c);
      if (c == '\\') {
        d = getchar();
        if (d != EOF)
          putchar(d);
      } else if ((state == STRING && c == '"') ||
                 (state == CHAR && c == '\''))
        state = CODE;
      c = getchar();
    }
  }

  return 0;
}
