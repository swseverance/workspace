/* The same program, written with || (OR), which the book introduces after
   this exercise, in section 1.5.4. One test replaces the three ifs: print the
   character unless both it and the one before it are blanks. */
#include <stdio.h>

int main() {
  int c, prev;

  prev = EOF;
  while ((c = getchar()) != EOF) {
    if (c != ' ' || prev != ' ')
      putchar(c);
    prev = c;
  }

  return 0;
}
