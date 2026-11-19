#include <stdio.h>

int bitcount(unsigned x);

/* print the number of 1-bits in each input number */
int main() {
  unsigned x;

  while (scanf("%u", &x) == 1)
    printf("%d\n", bitcount(x));

  return 0;
}

/* bitcount: count 1 bits in x, faster version

   x-1 turns the rightmost 1-bit of x into 0 and the 0-bits to its
   right into 1s, leaving the bits to its left alone. So x & (x-1)
   is x with its rightmost 1-bit cleared, and the loop runs once
   per 1-bit rather than once per bit position. */
int bitcount(unsigned x) {
  int b;

  for (b = 0; x != 0; x &= x - 1)
    b++;
  return b;
}
