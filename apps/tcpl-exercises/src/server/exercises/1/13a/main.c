#include <stdio.h>

#define MAXLEN 10 /* words this long or longer share the last bar */

/* print a horizontal histogram of the lengths of words in input */
int main() {
  int c, i, j, len;
  int count[MAXLEN + 1];

  for (i = 0; i <= MAXLEN; ++i)
    count[i] = 0;

  /* a blank, tab or newline ends a word. When no word came before it,
     len is 0, so count[0] collects those and is never printed */
  len = 0;
  while ((c = getchar()) != EOF) {
    if (c == ' ' || c == '\n' || c == '\t') {
      if (len > MAXLEN)
        ++count[MAXLEN];
      else
        ++count[len];
      len = 0;
    } else {
      ++len;
    }
  }
  /* the last word, if the input didn't end with a newline */
  if (len > MAXLEN)
    ++count[MAXLEN];
  else
    ++count[len];

  for (i = 1; i <= MAXLEN; ++i) {
    printf("%2d |", i);
    for (j = 0; j < count[i]; ++j)
      putchar('*');
    putchar('\n');
  }

  return 0;
}
