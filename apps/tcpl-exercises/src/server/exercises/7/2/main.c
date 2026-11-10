#include <stdio.h>
#include <ctype.h>

#define MAXCOL 40 /* longest output line */

/* print the input visibly: other characters than graphic ones and blanks
   in hexadecimal, and long lines broken */
int main(void) {
  int c, col, width;

  col = 0;
  while ((c = getchar()) != EOF) {
    if (c == '\n') {
      putchar(c);
      col = 0;
      continue;
    }
    width = isprint(c) ? 1 : 4; /* c, or \xhh */
    if (col + width > MAXCOL) {
      putchar('\n');
      col = 0;
    }
    if (width == 1)
      putchar(c);
    else
      printf("\\x%02x", c);
    col += width;
  }
  return 0;
}
