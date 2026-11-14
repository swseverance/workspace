#include <stdio.h>

/* verify that getchar() != EOF is 0 or 1 */
int main() {
  int c;

  while ((c = getchar()) != EOF)
    printf("%d\n", c != EOF);
  /* the loop has ended, so c is EOF */
  printf("%d\n", c != EOF);

  return 0;
}
