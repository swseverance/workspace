#include <stdio.h>
#define TABSTOP 8 /* a tab stop every TABSTOP columns */

/* replace runs of blanks with the fewest tabs and blanks */
int main() {
  int c, pos, nb;

  pos = 0; /* column within the current tab stop, 0 to TABSTOP - 1 */
  nb = 0;  /* blanks waiting to be written */
  while ((c = getchar()) != EOF) {
    if (c == ' ') {
      ++nb;
      ++pos;
      if (pos == TABSTOP) { /* the blanks reach a tab stop */
        if (nb == 1)
          putchar(' ');
        else
          putchar('\t');
        nb = 0;
        pos = 0;
      }
    } else {
      while (nb > 0) {
        putchar(' ');
        --nb;
      }
      putchar(c);
      if (c == '\t' || c == '\n')
        pos = 0;
      else {
        ++pos;
        if (pos == TABSTOP)
          pos = 0;
      }
    }
  }
  while (nb > 0) {
    putchar(' ');
    --nb;
  }

  return 0;
}
