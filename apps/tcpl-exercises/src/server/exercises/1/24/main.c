#include <stdio.h>

#define MAXDEPTH 1000 /* deepest nesting of brackets */

#define CODE 0
#define COMMENT 1
#define STRING 2
#define CHAR 3

/* check a C program for unmatched parentheses, brackets and braces */
int main() {
  int c, d, want, state, line, commentline, depth, error;
  char open[MAXDEPTH];  /* unclosed openers */
  int openline[MAXDEPTH]; /* the line each one is on */

  state = CODE;
  line = 1;
  commentline = 0;
  depth = 0;
  error = 0;
  c = getchar();
  while (!error && c != EOF) {
    if (state == CODE) {
      if (c == '/') {
        d = getchar();
        if (d == '*') {
          state = COMMENT;
          commentline = line;
          c = getchar();
        } else
          c = d; /* look at d again */
      } else {
        if (c == '\n')
          ++line;
        else if (c == '"')
          state = STRING;
        else if (c == '\'')
          state = CHAR;
        else if (c == '(' || c == '[' || c == '{') {
          open[depth] = c;
          openline[depth] = line;
          ++depth;
        } else if (c == ')' || c == ']' || c == '}') {
          if (c == ')')
            want = '(';
          else if (c == ']')
            want = '[';
          else
            want = '{';
          if (depth == 0 || open[depth - 1] != want) {
            printf("line %d: unmatched %c\n", line, c);
            error = 1;
          } else
            --depth;
        }
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
      } else {
        if (c == '\n')
          ++line;
        c = getchar();
      }
    } else { /* inside a string or character constant */
      if (c == '\n') {
        if (state == STRING)
          printf("line %d: unterminated string\n", line);
        else
          printf("line %d: unterminated character constant\n", line);
        error = 1;
      } else if (c == '\\') {
        d = getchar();
        if (d == '\n')
          ++line;
        c = getchar();
      } else {
        if ((state == STRING && c == '"') || (state == CHAR && c == '\''))
          state = CODE;
        c = getchar();
      }
    }
  }

  if (!error) {
    if (state == COMMENT)
      printf("line %d: unterminated comment\n", commentline);
    else if (state == STRING)
      printf("line %d: unterminated string\n", line);
    else if (state == CHAR)
      printf("line %d: unterminated character constant\n", line);
    else if (depth > 0)
      printf("line %d: unmatched %c\n", openline[depth - 1], open[depth - 1]);
    else
      printf("ok\n");
  }

  return 0;
}
