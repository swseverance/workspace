#include <stdio.h>

unsigned setbits(unsigned x, int p, int n, unsigned y);

/* print setbits(x,p,n,y) for each line of x, p, n and y */
int main() {
  unsigned x, y;
  int p, n;

  while (scanf("%u %d %d %u", &x, &p, &n, &y) == 4)
    printf("%u\n", setbits(x, p, n, y));

  return 0;
}

/* setbits: x with the n bits at position p set to the rightmost n bits of y */
unsigned setbits(unsigned x, int p, int n, unsigned y) {
  unsigned mask;

  mask = ~(~0U << n); /* n 1-bits at the right end */
  return (x & ~(mask << (p + 1 - n))) | ((y & mask) << (p + 1 - n));
}
