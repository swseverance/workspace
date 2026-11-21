#include <stdio.h>

/* verify that getchar() != EOF is 0 or 1 */
int main() {
  int v; /* the value of the expression */

  v = 1;
  while (v == 1) {
    v = getchar() != EOF;
    printf("%d\n", v);
  }

  return 0;
}
