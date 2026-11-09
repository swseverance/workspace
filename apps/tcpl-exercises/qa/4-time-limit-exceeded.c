#include <stdio.h>

int main(void) {
  int c, nb = 0, nt = 0, nl = 0;

  /* Bug: getchar() returns EOF (-1) at the end, never '\0'. */
  while ((c = getchar()) != '\0') {
    if (c == ' ') ++nb;
    if (c == '\t') ++nt;
    if (c == '\n') ++nl;
  }

  printf("%d %d %d\n", nb, nt, nl);
  return 0;
}
