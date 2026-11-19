#include <stdio.h>

unsigned rightrot(unsigned x, int n);
int wordlength(void);

/* print rightrot(x,n) for each line of x and n */
int main() {
  unsigned x;
  int n;

  while (scanf("%u %d", &x, &n) == 2)
    printf("%u\n", rightrot(x, n));

  return 0;
}

/* rightrot: rotate x to the right by n positions */
unsigned rightrot(unsigned x, int n) {
  int w;
  unsigned rbit;

  w = wordlength();
  n = n % w; /* rotating by w positions changes nothing */
  for (; n > 0; n--) {
    rbit = (x & 1) << (w - 1); /* the bit moving round to the left end */
    x = (x >> 1) | rbit;
  }
  return x;
}

/* wordlength: the number of bits in an unsigned */
int wordlength(void) {
  int i;
  unsigned v;

  v = ~0U;
  for (i = 1; (v = v >> 1) > 0; i++)
    ;
  return i;
}
