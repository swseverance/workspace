#include <stdio.h>

int main(void) {
  int c;

  /* Same bug, but printing as it goes: after the input runs out it
     prints -1 forever. */
  while ((c = getchar()) != '\0') {
    printf("%d\n", c);
  }

  return 0;
}
