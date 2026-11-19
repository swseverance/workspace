Write a function `invert(x,p,n)` that returns `x` with the `n` bits that begin at position `p` inverted (i.e., 1 changed into 0 and vice versa), leaving the others unchanged.

As in `getbits`, bit position 0 is at the right end, and the `n` bits that begin at position `p` are positions `p` down to `p+1-n`. `x` is `unsigned`. As the book says of `getbits`, assume `n` and `p` are sensible: the field fits in `x`, and `n` is from 1 to 31.

Each input line holds `x`, `p` and `n` in decimal, separated by spaces. Print `invert(x,p,n)` in decimal on a line of its own.

Reading numbers takes `scanf`, which the book doesn't reach until Chapter 7, so here is a `main` to start from. `scanf` reads the three numbers and returns how many it read, which stops the loop at the end of the input.

```c
#include <stdio.h>

unsigned invert(unsigned x, int p, int n);

int main() {
  unsigned x;
  int p, n;

  while (scanf("%u %d %d", &x, &p, &n) == 3)
    printf("%u\n", invert(x, p, n));

  return 0;
}
```
