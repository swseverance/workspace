#include <stdio.h>

int main(void) {
  int c, nb = 0, nt = 0, nl = 0;

  while ((c = getchar()) != EOF) {
    if (c == ' ') ++nb;
    if (c == '\t') ++nt;
    if (c == '\n') ++nl;
  }

  printf("%d %d %d\n", nb, nt, nl);
  return 1; /* right output, wrong exit code */
}
