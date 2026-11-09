#include <stdio.h>

int main(void) {
  int *counts = NULL;
  int c;

  while ((c = getchar()) != EOF) {
    if (c == ' ') ++counts[0]; /* writes through a NULL pointer */
  }

  printf("0 0 0\n");
  return 0;
}
