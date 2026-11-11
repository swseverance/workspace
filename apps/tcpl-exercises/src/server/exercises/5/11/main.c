#include <stdio.h>
#include <stdlib.h> /* for atoi() */

#define MAXSTOPS 100 /* maximum number of tab stops */
#define TABINC 8     /* default tab increment */

int nexttab(int col, int *stops, int nstops);

/* detab: replace tabs with blanks, using the tab stops given as
   arguments, or one every TABINC columns */
int main(int argc, char *argv[]) {
  int c, col, next, nstops;
  int stops[MAXSTOPS];

  for (nstops = 0; --argc > 0 && nstops < MAXSTOPS; nstops++)
    stops[nstops] = atoi(*++argv);

  col = 0;
  while ((c = getchar()) != EOF)
    if (c == '\t') {
      next = nexttab(col, stops, nstops);
      while (col < next) {
        putchar(' ');
        col++;
      }
    } else {
      putchar(c);
      col = (c == '\n') ? 0 : col + 1;
    }

  return 0;
}

/* nexttab: the column a tab at col moves to: the next tab stop, or the
   next column past the last one */
int nexttab(int col, int *stops, int nstops) {
  int *p;

  if (nstops == 0)
    return (col / TABINC + 1) * TABINC;
  for (p = stops; p < stops + nstops; p++)
    if (*p > col)
      return *p;
  return col + 1;
}
