#include <stdio.h>
#define TABSTOP 8 /* a tab stop every TABSTOP columns */

/* replace tabs with blanks to the next tab stop */
int main() {
  int c, pos;

  pos = 0; /* column within the current tab stop, 0 to TABSTOP - 1 */
  while ((c = getchar()) != EOF) {
    if (c == '\t') {
      while (pos < TABSTOP) {
        putchar(' ');
        ++pos;
      }
      pos = 0;
    } else if (c == '\n') {
      putchar(c);
      pos = 0;
    } else {
      putchar(c);
      ++pos;
      if (pos == TABSTOP)
        pos = 0;
    }
  }

  return 0;
}
