#include <stdio.h>

/* print the ranges of the integer types, computed directly;
   <limits.h> gives the same values as SCHAR_MIN, UCHAR_MAX, etc. */
int main() {
  unsigned char uc;
  unsigned short us;
  unsigned u;
  unsigned long ul;

  /* all bits set: the largest value of each unsigned type */
  uc = ~0;
  us = ~0;
  u = ~0;
  ul = ~0;

  /* the largest signed value has every bit but the sign bit set;
     in two's complement the smallest is one less than its negative */
  printf("signed char %d %d\n", -(uc >> 1) - 1, uc >> 1);
  printf("unsigned char 0 %d\n", uc);
  printf("signed short %d %d\n", -(us >> 1) - 1, us >> 1);
  printf("unsigned short 0 %d\n", us);
  printf("signed int %d %d\n", -(int)(u >> 1) - 1, (int)(u >> 1));
  printf("unsigned int 0 %u\n", u);
  printf("signed long %ld %ld\n", -(long)(ul >> 1) - 1, (long)(ul >> 1));
  printf("unsigned long 0 %lu\n", ul);

  return 0;
}
