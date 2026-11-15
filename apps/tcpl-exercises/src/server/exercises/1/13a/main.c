#include <stdio.h>

#define MAXLEN 10 /* words this long or longer share the last bar */
#define IN 1      /* inside a word */
#define OUT 0     /* outside a word */

/* print a histogram of the lengths of words in input:
   horizontal if the first character is 0, vertical if it is 1 */
int main() {
  int c, i, j, len, state, vertical, height, row, last;
  int count[MAXLEN + 1];

  for (i = 0; i <= MAXLEN; ++i)
    count[i] = 0;

  vertical = (getchar() == '1');

  state = OUT;
  len = 0;
  while ((c = getchar()) != EOF) {
    if (c == ' ' || c == '\n' || c == '\t') {
      if (state == IN) {
        if (len > MAXLEN)
          len = MAXLEN;
        ++count[len];
      }
      state = OUT;
      len = 0;
    } else {
      state = IN;
      ++len;
    }
  }
  if (state == IN) {
    if (len > MAXLEN)
      len = MAXLEN;
    ++count[len];
  }

  if (!vertical) {
    for (i = 1; i <= MAXLEN; ++i) {
      printf("%2d |", i);
      for (j = 0; j < count[i]; ++j)
        putchar('*');
      putchar('\n');
    }
  } else {
    height = 0;
    for (i = 1; i <= MAXLEN; ++i)
      if (count[i] > height)
        height = count[i];

    for (row = height; row >= 1; --row) {
      last = 0;
      for (i = 1; i <= MAXLEN; ++i)
        if (count[i] >= row)
          last = i;
      for (i = 1; i <= last; ++i)
        if (count[i] >= row)
          printf("  *");
        else
          printf("   ");
      putchar('\n');
    }
    for (i = 1; i <= MAXLEN; ++i)
      printf("%3d", i);
    putchar('\n');
  }

  return 0;
}
