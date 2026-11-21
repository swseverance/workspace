Our binary search makes two tests inside the loop, when one would suffice (at the price of more tests outside.) Write a version with only one test inside the loop and measure the difference in run-time.

The first input line holds `n`, from 0 to 1000. The next `n` lines hold `v[0]` to `v[n-1]`, in increasing order, and each line after that holds a value of `x`. For each `x`, print `binsearch(x, v, n)` on a line of its own.

A value may appear in `v` more than once. When `x` does, `binsearch` must return the lowest index that holds it; the book's version returns whichever one it reaches first.

Reading numbers takes `scanf`, which the book doesn't reach until Chapter 7, so here is a `main` to start from, with the book's `binsearch`. `scanf` reads a number and returns how many it read, which stops the last loop at the end of the input.

```c
#include <stdio.h>
#define MAXN 1000 /* maximum number of elements in v */

int binsearch(int x, int v[], int n);

int main() {
  int v[MAXN];
  int i, n, x;

  if (scanf("%d", &n) != 1 || n < 0 || n > MAXN)
    return 1; /* no n, or one that v can't hold */
  for (i = 0; i < n; i++)
    scanf("%d", &v[i]);

  while (scanf("%d", &x) == 1)
    printf("%d\n", binsearch(x, v, n));

  return 0;
}

/* binsearch:  find x in v[0] <= v[1] <= ... <= v[n-1] */
int binsearch(int x, int v[], int n)
{
    int low, high, mid;

    low = 0;
    high = n - 1;
    while (low <= high) {
        mid = (low+high)/2;
        if (x < v[mid])
            high = mid - 1;
        else if (x > v[mid])
            low = mid + 1;
        else    /* found match */
            return mid;
    }
    return -1;   /* no match */
}
```
