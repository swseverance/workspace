#include <stdio.h>

unsigned invert(unsigned x, int p, int n);

/* print invert(x,p,n) for each line of x, p and n */
int main() {
  unsigned x;
  int p, n;

  while (scanf("%u %d %d", &x, &p, &n) == 3)
    printf("%u\n", invert(x, p, n));

  return 0;
}

/* invert: x with the n bits at position p inverted */
unsigned invert(unsigned x, int p, int n) {
  return x ^ (~(~0U << n) << (p + 1 - n));
}
