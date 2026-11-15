#include <stdio.h>

#define MAXLEN 10 /* words this long or longer share the last bar */

/* print a vertical histogram of the lengths of words in input */
int main() {
  int c, i, len, height, row;
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

  height = 0;
  for (i = 1; i <= MAXLEN; ++i)
    if (count[i] > height)
      height = count[i];

  for (row = height; row >= 1; --row) {
    for (i = 1; i <= MAXLEN; ++i)
      if (count[i] >= row)
        printf("  *");
      else
        printf("   ");
    putchar('\n');
  }
  for (i = 1; i <= 3 * MAXLEN; ++i)
    putchar('-');
  putchar('\n');
  for (i = 1; i <= MAXLEN; ++i)
    printf("%3d", i);
  putchar('\n');

  return 0;
}
