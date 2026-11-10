#include <stdio.h>

/* verify that getchar() != EOF is 0 or 1 */
int main() {
  int c;

  c = getchar() != EOF;
  while (c == 1) {
    printf("%d\n", c);
    c = getchar() != EOF;
  }
  printf("%d\n", c);

  return 0;
}
