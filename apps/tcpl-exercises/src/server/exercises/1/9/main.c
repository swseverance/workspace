#include <stdio.h>

/* copy input to output, replacing each string of blanks by a single blank */
int main() {
  int c, prev;

  prev = EOF;
  while ((c = getchar()) != EOF) {
    if (c != ' ')
      putchar(c);
    if (c == ' ')
      if (prev != ' ')
        putchar(c);
    prev = c;
  }

  return 0;
}
