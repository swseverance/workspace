In a two's complement number system, `x &= (x-1)` deletes the rightmost 1-bit in `x`. Explain why. Use this observation to write a faster version of `bitcount`.

Each input line holds an `unsigned` number in decimal. Print `bitcount` of it on a line of its own.

Reading numbers takes `scanf`, which the book doesn't reach until Chapter 7, so here is a `main` to start from. `scanf` reads a number and returns how many it read, which stops the loop at the end of the input.

```c
#include <stdio.h>

int bitcount(unsigned x);

int main() {
  unsigned x;

  while (scanf("%u", &x) == 1)
    printf("%d\n", bitcount(x));

  return 0;
}
```
