#include <stdio.h>

#define NCHARS 128 /* ASCII character codes 0 to 127 */

/* print a histogram of the frequencies of characters in input */
int main() {
  int c, i, j;
  int count[NCHARS];

  for (i = 0; i < NCHARS; ++i)
    count[i] = 0;

  while ((c = getchar()) != EOF)
    ++count[c];

  for (i = 0; i < NCHARS; ++i)
    if (count[i] > 0) {
      printf("%3d |", i);
      for (j = 0; j < count[i]; ++j)
        putchar('*');
      putchar('\n');
    }

  return 0;
}
