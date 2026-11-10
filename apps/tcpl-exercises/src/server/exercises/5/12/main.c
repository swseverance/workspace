#include <stdio.h>
#include <stdlib.h> /* for atoi() */

#define TABINC 8 /* default tab increment */

int istab(int col, int m, int n);

/* entab: replace runs of blanks with the fewest tabs and blanks, with
   tab stops every n columns from column m (entab -m +n) */
int main(int argc, char *argv[]) {
  int c, col, nb, m, n;

  m = 0;
  n = TABINC;
  while (--argc > 0) {
    ++argv;
    if ((*argv)[0] == '-')
      m = atoi(*argv + 1);
    else if ((*argv)[0] == '+')
      n = atoi(*argv + 1);
  }

  col = 0; /* column of the next character */
  nb = 0;  /* blanks waiting to be written */
  while ((c = getchar()) != EOF) {
    if (c == ' ') {
      ++nb;
      ++col;
      if (istab(col, m, n)) { /* the blanks reach a tab stop */
        putchar(nb == 1 ? ' ' : '\t');
        nb = 0;
      }
    } else {
      for (; nb > 0; nb--)
        putchar(' ');
      putchar(c);
      if (c == '\n')
        col = 0;
      else if (c == '\t')
        while (!istab(++col, m, n)) /* move to the next tab stop */
          ;
      else
        ++col;
    }
  }
  for (; nb > 0; nb--)
    putchar(' ');

  return 0;
}

/* istab: is there a tab stop at column col? */
int istab(int col, int m, int n) {
  return col >= m && (col - m) % n == 0;
}
