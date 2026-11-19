Write a function `setbits(x,p,n,y)` that returns `x` with the `n` bits that begin at position `p` set to the rightmost `n` bits of `y`, leaving the other bits unchanged.

As in `getbits`, bit position 0 is at the right end, and the `n` bits that begin at position `p` are positions `p` down to `p+1-n`. `x` and `y` are `unsigned`. As the book says of `getbits`, assume `n` and `p` are sensible: the field fits in `x`, and `n` is from 1 to 31.

Each input line holds `x`, `p`, `n` and `y` in decimal, separated by spaces. Print `setbits(x,p,n,y)` in decimal on a line of its own.

Reading numbers takes `scanf`, which the book doesn't reach until Chapter 7, so here is a `main` to start from. `scanf` reads the four numbers and returns how many it read, which stops the loop at the end of the input.

```c
#include <stdio.h>

unsigned setbits(unsigned x, int p, int n, unsigned y);

int main() {
  unsigned x, y;
  int p, n;

  while (scanf("%u %d %d %u", &x, &p, &n, &y) == 4)
    printf("%u\n", setbits(x, p, n, y));

  return 0;
}
```
