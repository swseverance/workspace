#include <stdio.h>

int main(void) {
  int c, nb = 0, nt = 0, nl = 0

  while ((c = getchar()) != EOF) {
    if (c == ' ') ++nb;
  }

  printf("%d %d %d\n", nb, nt, nl);
  return 0;
}
