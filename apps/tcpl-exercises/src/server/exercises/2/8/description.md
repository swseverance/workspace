Write a function `rightrot(x,n)` that returns the value of the integer `x` rotated to the right by `n` positions.

`x` is `unsigned`. `n` may be 0, or more than the number of bits in `x`; it is never negative and never more than 1,000.

Each input line holds `x` and `n` in decimal, separated by a space. Print `rightrot(x,n)` in decimal on a line of its own.

Reading numbers takes `scanf`, which the book doesn't reach until Chapter 7, so here is a `main` to start from. `scanf` reads the two numbers and returns how many it read, which stops the loop at the end of the input.

```c
#include <stdio.h>

unsigned rightrot(unsigned x, int n);

int main() {
  unsigned x;
  int n;

  while (scanf("%u %d", &x, &n) == 2)
    printf("%u\n", rightrot(x, n));

  return 0;
}
```
